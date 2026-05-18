import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '../types';

export interface POSItem {
    product: Product;
    quantity: number;
    notes?: string;
}

interface POSState {
    items: POSItem[];
    customerName: string;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    setCustomerName: (name: string) => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const usePOSStore = create<POSState>()(
    persist(
        (set, get) => ({
            items: [],
            customerName: 'Pelanggan Umum',
            addItem: (product, quantity = 1) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item.product.id === product.id);

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.product.id === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...currentItems, { product, quantity }] });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item.product.id !== productId) });
            },
            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.product.id === productId ? { ...item, quantity } : item
                    ),
                });
            },
            clearCart: () => set({ items: [], customerName: 'Pelanggan Umum' }),
            setCustomerName: (name) => set({ customerName: name }),
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
            name: 'ewwon-coco-pos-cart',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
