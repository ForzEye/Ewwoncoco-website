import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
    items: CartItem[];
    addItem: (product: Product, quantity?: number, notes?: string) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product: Product, quantity = 1, notes = '') => {
                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.product.id === product.id
                    );

                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.product.id === product.id
                                    ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
                                    : item
                            ),
                        };
                    }

                    return { items: [...state.items, { product, quantity, notes }] };
                });
            },
            removeItem: (productId: number) => {
                set((state) => ({
                    items: state.items.filter((item) => item.product.id !== productId),
                }));
            },
            updateQuantity: (productId: number, quantity: number) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.product.id === productId ? { ...item, quantity } : item
                    ),
                }));
            },
            clearCart: () => {
                set({ items: [] });
            },
            getTotal: () => {
                return get().items.reduce(
                    (total, item) => total + item.product.price * item.quantity,
                    0
                );
            },
            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'ewwon-coco-cart',
        }
    )
);
