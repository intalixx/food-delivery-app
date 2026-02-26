import { apiFetch } from './api';

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_price: number;
    qty: number;
    subtotal: number;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: string;
    order_code: string;
    user_id: string;
    address_id: string;
    total_qty: number;
    final_amount: number;
    order_status: string;
    items: OrderItem[];
    created_at: string;
    updated_at: string;
}

interface OrderResponse {
    success: boolean;
    data: Order;
}

interface OrderListResponse {
    success: boolean;
    data: Order[];
}

export interface CheckoutItem {
    product_id: string;
    qty: number;
}

export const orderService = {
    /** Place a new order */
    async create(addressId: string, items: CheckoutItem[]): Promise<Order> {
        const response = await apiFetch<OrderResponse>('/orders', {
            method: 'POST',
            body: JSON.stringify({ address_id: addressId, items }),
        });
        return response.data;
    },

    /** Get all orders for the authenticated user */
    async getMyOrders(): Promise<Order[]> {
        const response = await apiFetch<OrderListResponse>('/orders/my');
        return response.data;
    },

    /** Get a single order by ID */
    async getById(id: string): Promise<Order> {
        const response = await apiFetch<OrderResponse>(`/orders/${id}`);
        return response.data;
    },

    /** Cancel an order */
    async cancel(id: string): Promise<Order> {
        const response = await apiFetch<OrderResponse>(`/orders/${id}/cancel`, {
            method: 'PATCH',
        });
        return response.data;
    },
};
