import pool from '../config/db';

export interface Order {
    id: string;
    order_code: string;
    user_id: string;
    address_id: string;
    total_qty: number;
    final_amount: number;
    order_status: string;
    created_at: Date;
    updated_at: Date;
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

export interface OrderWithItems extends Order {
    items: OrderItem[];
}

interface CreateOrderItemInput {
    product_id: string;
    product_name: string;
    product_price: number;
    qty: number;
    subtotal: number;
}

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
    /** Create order + items inside a transaction */
    async createWithItems(
        userId: string,
        addressId: string,
        totalQty: number,
        finalAmount: number,
        items: CreateOrderItemInput[]
    ): Promise<OrderWithItems> {
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
                `INSERT INTO orders (order_code, user_id, address_id, total_qty, final_amount, order_status)
                 VALUES ($1, $2, $3, $4, $5, 'Order Received') RETURNING *`,
                [orderCode, userId, addressId, totalQty, finalAmount]
            );
            const order: Order = orderResult.rows[0];

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
            return { ...order, items: orderItems };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /** Get all orders for a user, with items */
    async getByUserId(userId: string): Promise<OrderWithItems[]> {
        const ordersResult = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        const orders: OrderWithItems[] = [];
        for (const order of ordersResult.rows) {
            const itemsResult = await pool.query(
                'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
                [order.id]
            );
            orders.push({ ...order, items: itemsResult.rows });
        }

        return orders;
    },

    /** Get a single order by ID with items */
    async getById(orderId: string): Promise<OrderWithItems | null> {
        const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (orderResult.rows.length === 0) return null;

        const order = orderResult.rows[0];
        const itemsResult = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
            [order.id]
        );
        return { ...order, items: itemsResult.rows };
    },

    /** Update order status */
    async updateStatus(orderId: string, status: string): Promise<Order | null> {
        const result = await pool.query(
            'UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *',
            [status, orderId]
        );
        return result.rows[0] || null;
    },

    /** Cancel an order — only if status is 'Order Received' */
    async cancel(orderId: string, userId: string): Promise<Order | null> {
        const result = await pool.query(
            `UPDATE orders SET order_status = 'Cancelled'
             WHERE id = $1 AND user_id = $2 AND order_status = 'Order Received'
             RETURNING *`,
            [orderId, userId]
        );
        return result.rows[0] || null;
    }
};
