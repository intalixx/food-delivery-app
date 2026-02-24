/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, ReactNode } from 'react';
export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const savedItems = localStorage.getItem('cartItems');
            const expiry = localStorage.getItem('cartExpiry');

            if (savedItems && expiry) {
                // If current time is past expiry, clear storage and return empty
                if (new Date().getTime() > parseInt(expiry, 10)) {
                    localStorage.removeItem('cartItems');
                    localStorage.removeItem('cartExpiry');
                    return [];
                }
                return JSON.parse(savedItems);
            }
        } catch (error) {
            console.error('Error parsing cart from localStorage', error);
        }
        return [];
    });

    // Sync to local storage on every change and push expiry 30 days
    useEffect(() => {
        try {
            localStorage.setItem('cartItems', JSON.stringify(items));
            const expiryDate = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 Days
            localStorage.setItem('cartExpiry', expiryDate.toString());
        } catch (error) {
            console.error('Error saving cart to localStorage', error);
        }
    }, [items]);

    const addToCart = (product: Omit<CartItem, 'quantity'>) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
}
