import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { orderService, CheckoutItem } from '../orderService';
import { apiFetch } from '../api';

// Mock the api module
vi.mock('../api', () => ({
    apiFetch: vi.fn(),
}));

describe('orderService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockOrder = {
        id: 'o-123',
        order_code: 'ORD-123',
        user_id: 'u-123',
        address_id: 'a-123',
        total_qty: 2,
        final_amount: 500,
        order_status: 'Order Received',
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    describe('create()', () => {
        it('should call apiFetch with POST and correct body', async () => {
            // Setup
            (apiFetch as Mock).mockResolvedValueOnce({ success: true, data: mockOrder });
            const addressId = 'a-123';
            const items: CheckoutItem[] = [{ product_id: 'p-1', qty: 2 }];

            // Execute
            const result = await orderService.create(addressId, items);

            // Assert
            expect(apiFetch).toHaveBeenCalledWith('/orders', {
                method: 'POST',
                body: JSON.stringify({ address_id: addressId, items }),
            });
            expect(result).toEqual(mockOrder);
        });

        it('should throw error if apiFetch throws (e.g. valid failure)', async () => {
            (apiFetch as Mock).mockRejectedValueOnce(new Error('Address not found'));

            await expect(orderService.create('bad-address', []))
                .rejects.toThrow('Address not found');
        });
    });

    describe('getMyOrders()', () => {
        it('should fetch user orders using GET', async () => {
            (apiFetch as Mock).mockResolvedValueOnce({ success: true, data: [mockOrder] });

            const result = await orderService.getMyOrders();

            expect(apiFetch).toHaveBeenCalledWith('/orders/my');
            expect(result).toEqual([mockOrder]);
        });
    });

    describe('getById()', () => {
        it('should fetch single order by id', async () => {
            (apiFetch as Mock).mockResolvedValueOnce({ success: true, data: mockOrder });

            const result = await orderService.getById('o-123');

            expect(apiFetch).toHaveBeenCalledWith('/orders/o-123');
            expect(result).toEqual(mockOrder);
        });
    });

    describe('cancel()', () => {
        it('should send PATCH request to cancel order', async () => {
            const cancelledOrder = { ...mockOrder, order_status: 'Cancelled' };
            (apiFetch as Mock).mockResolvedValueOnce({ success: true, data: cancelledOrder });

            const result = await orderService.cancel('o-123');

            expect(apiFetch).toHaveBeenCalledWith('/orders/o-123/cancel', {
                method: 'PATCH',
            });
            expect(result).toEqual(cancelledOrder);
        });
    });
});
