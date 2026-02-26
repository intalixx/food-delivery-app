import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider } from '../CartContext';
import { useCart } from '../../hooks/useCart';

describe('CartContext & useCart hook', () => {

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CartProvider>{children}</CartProvider>
    );

    const mockProduct1 = {
        id: 'p-1',
        name: 'Pizza Margherita',
        price: 299,
        image: 'http://example.com/pizza.jpg'
    };

    const mockProduct2 = {
        id: 'p-2',
        name: 'Burger',
        price: 150,
        image: 'http://example.com/burger.jpg'
    };

    it('should initialize with empty cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper });
        expect(result.current.items).toEqual([]);
        expect(result.current.totalItems).toBe(0);
        expect(result.current.totalPrice).toBe(0);
    });

    it('should add item to cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addToCart(mockProduct1);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0]).toEqual({ ...mockProduct1, quantity: 1 });
        expect(result.current.totalItems).toBe(1);
        expect(result.current.totalPrice).toBe(299);
    });

    it('should increment quantity if same item added again', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addToCart(mockProduct1);
            result.current.addToCart(mockProduct1);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].quantity).toBe(2);
        expect(result.current.totalItems).toBe(2);
        expect(result.current.totalPrice).toBe(598); // 299 * 2
    });

    it('should handle adding multiple distinct items', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addToCart(mockProduct1);
            result.current.addToCart(mockProduct2);
        });

        expect(result.current.items).toHaveLength(2);
        expect(result.current.totalItems).toBe(2);
        expect(result.current.totalPrice).toBe(449); // 299 + 150
    });

    it('should remove item entirely', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addToCart(mockProduct1);
            result.current.removeFromCart(mockProduct1.id);
        });

        expect(result.current.items).toHaveLength(0);
        expect(result.current.totalItems).toBe(0);
        expect(result.current.totalPrice).toBe(0);
    });

    it('should update item quantity', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addToCart(mockProduct2);
            result.current.updateQuantity(mockProduct2.id, 5);
        });

        expect(result.current.items[0].quantity).toBe(5);
        expect(result.current.totalItems).toBe(5);
        expect(result.current.totalPrice).toBe(750); // 150 * 5
    });

    it('should remove item if quantity updated to less than 1', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addToCart(mockProduct1);
            result.current.updateQuantity(mockProduct1.id, 0);
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('should clear all items in cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addToCart(mockProduct1);
            result.current.addToCart(mockProduct2);
            result.current.clearCart();
        });

        expect(result.current.items).toHaveLength(0);
        expect(result.current.totalItems).toBe(0);
    });

    it('should persist cart to localStorage', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addToCart(mockProduct1);
        });

        const savedData = JSON.parse(localStorage.getItem('cartItems') || '[]');
        expect(savedData).toHaveLength(1);
        expect(savedData[0].id).toBe(mockProduct1.id);
    });
});
