import pool from '../config/db';

export interface Order {
    id: string;
    order_code: string;
    user_id: string;
    total_qty: number;
    final_amount: number;
    order_status: string;
    created_at: Date;
    updated_at: Date;
}

export interface OrderAddress {
    id: string;
    order_id: string;
    save_as: string;
    pincode: string;
    city: string;
    state: string;
    house_number: string;
    street_locality: string;
    mobile: string;
    created_at: Date;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_price: number;
    qty: number;
    subtotal: number;
    created_at: Date;
    updated_at: Date;
}

export interface OrderWithDetails extends Order {
    address: OrderAddress | null;
    items: OrderItem[];
}

interface CreateOrderItemInput {
    product_id: string;
    product_name: string;
    product_price: number;
    qty: number;
    subtotal: number;
}

interface CreateOrderAddressInput {
    save_as: string;
    pincode: string;
    city: string;
    state: string;
    house_number: string;
    street_locality: string;
    mobile: string;
}

/**
 * Allowed forward transitions for order status.
 * Cancelled is handled separately — allowed from any non-delivered/non-cancelled state.
 */
const STATUS_FLOW: Record<string, string> = {
    'Order Received': 'Preparing',
    'Preparing': 'Out for Delivery',
    'Out for Delivery': 'Delivered',
};

/** Generates a random order code like ORD-A7X3B2 */
function generateOrderCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ORD-${code}`;
}

export const OrderModel = {
    /**
     * Validates whether a status transition is allowed.
     * Returns { valid: true } or { valid: false, reason: string }.
     */
    validateStatusTransition(
        currentStatus: string,
        newStatus: string
    ): { valid: true } | { valid: false; reason: string } {
        // Already cancelled or delivered — no further transitions
        if (currentStatus === 'Cancelled') {
            return { valid: false, reason: 'Order is already cancelled. No further updates allowed.' };
        }
        if (currentStatus === 'Delivered' && newStatus === 'Cancelled') {
            return { valid: false, reason: 'Order is already delivered and cannot be cancelled.' };
        }
        if (currentStatus === 'Delivered') {
            return { valid: false, reason: 'Order is already delivered. No further updates allowed.' };
        }

        // Cancel is allowed from any active (non-delivered, non-cancelled) state
        if (newStatus === 'Cancelled') {
            return { valid: true };
        }

        // Forward-only sequential transition
        const expectedNext = STATUS_FLOW[currentStatus];
        if (!expectedNext) {
            return { valid: false, reason: `No forward transition available from "${currentStatus}".` };
        }
        if (newStatus !== expectedNext) {
            return {
                valid: false,
                reason: `Invalid transition. Current status is "${currentStatus}", next allowed status is "${expectedNext}". Cannot jump to "${newStatus}".`
            };
        }

        return { valid: true };
    },

    /** Create order + address snapshot + items inside a transaction */
    async createWithItems(
        userId: string,
        addressData: CreateOrderAddressInput,
        totalQty: number,
        finalAmount: number,
        items: CreateOrderItemInput[]
    ): Promise<OrderWithDetails> {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Generate a unique order code (retry on collision)
            let orderCode = generateOrderCode();
            let attempts = 0;
            while (attempts < 5) {
                const exists = await client.query('SELECT 1 FROM orders WHERE order_code = $1', [orderCode]);
                if (exists.rows.length === 0) break;
                orderCode = generateOrderCode();
                attempts++;
            }

            // Insert order
            const orderResult = await client.query(
                `INSERT INTO orders (order_code, user_id, total_qty, final_amount, order_status)
                 VALUES ($1, $2, $3, $4, 'Order Received') RETURNING *`,
                [orderCode, userId, totalQty, finalAmount]
            );
            const order: Order = orderResult.rows[0];

            // Insert address snapshot
            const addressResult = await client.query(
                `INSERT INTO order_addresses (order_id, save_as, pincode, city, state, house_number, street_locality, mobile)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [
                    order.id,
                    addressData.save_as,
                    addressData.pincode,
                    addressData.city,
                    addressData.state,
                    addressData.house_number,
                    addressData.street_locality,
                    addressData.mobile
                ]
            );
            const address: OrderAddress = addressResult.rows[0];

            // Insert order items
            const orderItems: OrderItem[] = [];
            for (const item of items) {
                const itemResult = await client.query(
                    `INSERT INTO order_items (order_id, product_id, product_name, product_price, qty, subtotal)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                    [order.id, item.product_id, item.product_name, item.product_price, item.qty, item.subtotal]
                );
                orderItems.push(itemResult.rows[0]);
            }

            await client.query('COMMIT');
            return { ...order, address, items: orderItems };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /** Get all orders for a user, with address + items */
    async getByUserId(userId: string): Promise<OrderWithDetails[]> {
        const ordersResult = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        const orders: OrderWithDetails[] = [];
        for (const order of ordersResult.rows) {
            const addressResult = await pool.query(
                'SELECT * FROM order_addresses WHERE order_id = $1',
                [order.id]
            );
            const itemsResult = await pool.query(
                'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
                [order.id]
            );
            orders.push({
                ...order,
                address: addressResult.rows[0] || null,
                items: itemsResult.rows
            });
        }

        return orders;
    },

    /** Get a single order by ID with address + items */
    async getById(orderId: string): Promise<OrderWithDetails | null> {
        const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (orderResult.rows.length === 0) return null;

        const order = orderResult.rows[0];
        const addressResult = await pool.query(
            'SELECT * FROM order_addresses WHERE order_id = $1',
            [order.id]
        );
        const itemsResult = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
            [order.id]
        );
        return {
            ...order,
            address: addressResult.rows[0] || null,
            items: itemsResult.rows
        };
    },

    /** Update order status (raw — caller must validate transition first) */
    async updateStatus(orderId: string, status: string): Promise<Order | null> {
        const result = await pool.query(
            'UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *',
            [status, orderId]
        );
        return result.rows[0] || null;
    },

    /** Cancel an order — allowed from any state except Delivered and Cancelled */
    async cancel(orderId: string, userId: string): Promise<Order | null> {
        const result = await pool.query(
            `UPDATE orders SET order_status = 'Cancelled'
             WHERE id = $1 AND user_id = $2
             AND order_status NOT IN ('Delivered', 'Cancelled')
             RETURNING *`,
            [orderId, userId]
        );
        return result.rows[0] || null;
    }
};
