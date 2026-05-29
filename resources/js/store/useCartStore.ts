import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, CustomizationOption } from '../types';

interface CartState {
    items: CartItem[];
    addItem: (product: Product, quantity?: number, notes?: string, customizations?: CustomizationOption[]) => void;
    removeItem: (productId: number, customizations?: CustomizationOption[]) => void;
    updateQuantity: (productId: number, quantity: number, customizations?: CustomizationOption[]) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product: Product, quantity = 1, notes = '', customizations = []) => {
                set((state) => {
                    const newCustIds = (customizations || []).map((c) => c.id).sort().join(',');
                    const existingItem = state.items.find((item) => {
                        if (item.product.id !== product.id) return false;
                        const itemCustIds = (item.customizations || []).map((c) => c.id).sort().join(',');
                        return itemCustIds === newCustIds;
                    });

                    if (existingItem) {
                        return {
                            items: state.items.map((item) => {
                                const itemCustIds = (item.customizations || []).map((c) => c.id).sort().join(',');
                                return item.product.id === product.id && itemCustIds === newCustIds
                                    ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
                                    : item;
                            }),
                        };
                    }

                    return { items: [...state.items, { product, quantity, notes, customizations }] };
                });
            },
            removeItem: (productId: number, customizations = []) => {
                const newCustIds = (customizations || []).map((c) => c.id).sort().join(',');
                set((state) => ({
                    items: state.items.filter((item) => {
                        if (item.product.id !== productId) return true;
                        const itemCustIds = (item.customizations || []).map((c) => c.id).sort().join(',');
                        return itemCustIds !== newCustIds;
                    }),
                }));
            },
            updateQuantity: (productId: number, quantity: number, customizations = []) => {
                const newCustIds = (customizations || []).map((c) => c.id).sort().join(',');
                set((state) => ({
                    items: state.items.map((item) => {
                        if (item.product.id !== productId) return item;
                        const itemCustIds = (item.customizations || []).map((c) => c.id).sort().join(',');
                        return itemCustIds === newCustIds ? { ...item, quantity } : item;
                    }),
                }));
            },
            clearCart: () => {
                set({ items: [] });
            },
            getTotal: () => {
                return get().items.reduce((total, item) => {
                    const toppingsPrice = (item.customizations || []).reduce(
                        (sum, c) => sum + Number(c.price),
                        0
                    );
                    return total + (Number(item.product.price) + toppingsPrice) * item.quantity;
                }, 0);
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
