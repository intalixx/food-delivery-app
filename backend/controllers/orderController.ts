import { Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { AddressModel } from '../models/addressModel';
import { ProductModel } from '../models/productModel';
import { AuthRequest } from '../middleware/authMiddleware';
import { sseManager } from '../utils/sseManager';

export const OrderController = {
    /**
     * POST /api/orders
     * Creates a new order with items.
     * Server-side validates: auth, address ownership, product existence, price snapshot.
     */
    async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { address_id, items } = req.body as {
                address_id: string;
                items: { product_id: string; qty: number }[];
            };

            // 1. Verify address belongs to this user
            const address = await AddressModel.getById(address_id);
            if (!address || address.user_id !== userId) {
                res.status(400).json({ success: false, errors: ['Invalid delivery address'] });
                return;
            }

            // 2. Validate each product exists and snapshot current price
            let totalQty = 0;
            let finalAmount = 0;
            const orderItems: {
                product_id: string;
                product_name: string;
                product_price: number;
                qty: number;
                subtotal: number;
            }[] = [];

            for (const item of items) {
                const product = await ProductModel.getById(item.product_id);
                if (!product) {
                    res.status(400).json({
                        success: false,
                        errors: [`Product not found: ${item.product_id}. It may have been removed.`]
                    });
                    return;
                }

                const subtotal = Number(product.price) * item.qty;
                totalQty += item.qty;
                finalAmount += subtotal;

                orderItems.push({
                    product_id: product.id,
                    product_name: product.product_name,
                    product_price: Number(product.price),
                    qty: item.qty,
                    subtotal
                });
            }

            // 3. Create order + items in a transaction
            const order = await OrderModel.createWithItems(
                userId,
                address_id,
                totalQty,
                finalAmount,
                orderItems
            );

            res.status(201).json({ success: true, data: order });
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ success: false, errors: ['Failed to place order'] });
        }
    },

    /**
     * GET /api/orders/my
     * Get all orders for the authenticated user.
     */
    async getMyOrders(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const orders = await OrderModel.getByUserId(userId);
            res.json({ success: true, data: orders });
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ success: false, errors: ['Failed to fetch orders'] });
        }
    },

    /**
     * GET /api/orders/:id
     * Get a single order by ID (must belong to authenticated user).
     */
    async getById(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const order = await OrderModel.getById(req.params.id as string);

            if (!order || order.user_id !== userId) {
                res.status(404).json({ success: false, errors: ['Order not found'] });
                return;
            }

            res.json({ success: true, data: order });
        } catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({ success: false, errors: ['Failed to fetch order'] });
        }
    },

    /**
     * PATCH /api/orders/:id/status
     * Update order status (admin/internal use) and broadcast via SSE.
     */
    async updateStatus(req: AuthRequest, res: Response): Promise<void> {
        try {
            const orderId = req.params.id as string;
            const { order_status } = req.body as { order_status: string };

            const validStatuses = ['Order Received', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
            if (!validStatuses.includes(order_status)) {
                res.status(400).json({ success: false, errors: [`Invalid status. Must be one of: ${validStatuses.join(', ')}`] });
                return;
            }

            const updated = await OrderModel.updateStatus(orderId, order_status);
            if (!updated) {
                res.status(404).json({ success: false, errors: ['Order not found'] });
                return;
            }

            // Broadcast status change to the order's user via SSE
            sseManager.sendToUser(updated.user_id, 'order_status_update', {
                order_id: updated.id,
                order_code: updated.order_code,
                order_status: updated.order_status,
            });

            res.json({ success: true, data: updated, message: 'Order status updated' });
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ success: false, errors: ['Failed to update order status'] });
        }
    },

    /**
     * PATCH /api/orders/:id/cancel
     * Cancel an order (only if status is 'Order Received').
     */
    async cancel(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const cancelled = await OrderModel.cancel(req.params.id as string, userId);

            if (!cancelled) {
                res.status(400).json({
                    success: false,
                    errors: ['Cannot cancel this order. It may have already been processed or does not exist.']
                });
                return;
            }

            // Broadcast cancellation via SSE
            sseManager.sendToUser(userId, 'order_status_update', {
                order_id: cancelled.id,
                order_code: cancelled.order_code,
                order_status: cancelled.order_status,
            });

            res.json({ success: true, data: cancelled, message: 'Order cancelled successfully' });
        } catch (error) {
            console.error('Error cancelling order:', error);
            res.status(500).json({ success: false, errors: ['Failed to cancel order'] });
        }
    },

    /**
     * GET /api/orders/stream
     * SSE endpoint — streams real-time order status updates to authenticated user.
     */
    async stream(req: AuthRequest, res: Response): Promise<void> {
        const userId = req.user!.id;

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        // Send initial heartbeat
        res.write(`event: connected\ndata: ${JSON.stringify({ message: 'SSE connected' })}\n\n`);

        // Register client
        sseManager.addClient(userId, res);

        // Keep-alive ping every 30s to prevent timeout
        const keepAlive = setInterval(() => {
            res.write(`: ping\n\n`);
        }, 30000);

        // Cleanup on disconnect
        req.on('close', () => {
            clearInterval(keepAlive);
        });
    }
};
