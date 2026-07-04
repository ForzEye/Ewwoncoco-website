import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CustomizationOption } from '../types';

export interface CartItem {
    product: Product;
    quantity: number;
    notes?: string;
    customizations?: CustomizationOption[];
    selected_price_option?: { id: string, name: string, price: number, multiplier: number } | null;
}

interface CartState {
    items: CartItem[];
    addItem: (
        product: Product, 
        quantity?: number, 
        notes?: string, 
        customizations?: CustomizationOption[],
        selected_price_option?: { id: string, name: string, price: number, multiplier: number } | null
    ) => void;
    removeItem: (
        productId: number, 
        customizations?: CustomizationOption[],
        selected_price_option?: { id: string, name: string, price: number, multiplier: number } | null
    ) => void;
    updateQuantity: (
        productId: number, 
        quantity: number, 
        customizations?: CustomizationOption[],
        selected_price_option?: { id: string, name: string, price: number, multiplier: number } | null
    ) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
    toggleUpgradeClaim: (
        productId: number, 
        customizationId: number, 
        claim: boolean, 
        customizations?: CustomizationOption[],
        selected_price_option?: { id: string, name: string, price: number, multiplier: number } | null
    ) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product: Product, quantity = 1, notes = '', customizations = [], selected_price_option = null) => {
                set((state) => {
                    const newCustIds = (customizations || []).map((c) => c.id).sort().join(',');
                    const optId = selected_price_option?.id || '';
                    const existingItem = state.items.find((item) => {
                        if (item.product.id !== product.id) return false;
                        const itemCustIds = (item.customizations || []).map((c) => c.id).sort().join(',');
                        const itemOptId = item.selected_price_option?.id || '';
                        return itemCustIds === newCustIds && itemOptId === optId;
                    });

                    if (existingItem) {
                        return {
                            items: state.items.map((item) => {
                                const itemCustIds = (item.customizations || []).map((c) => c.id).sort().join(',');
                                const itemOptId = item.selected_price_option?.id || '';
                                return item.product.id === product.id && itemCustIds === newCustIds && itemOptId === optId
                                    ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
                                    : item;
                            }),
                        };
                    }

                    return { items: [...state.items, { product, quantity, notes, customizations, selected_price_option }] };
                });
            },
            removeItem: (productId: number, customizations = [], selected_price_option = null) => {
                const newCustIds = (customizations || []).map((c) => c.id).sort().join(',');
                const optId = selected_price_option?.id || '';
                set((state) => ({
                    items: state.items.filter((item) => {
                        if (item.product.id !== productId) return true;
                        const itemCustIds = (item.customizations || []).map((c) => c.id).sort().join(',');
                        const itemOptId = item.selected_price_option?.id || '';
                        return itemCustIds !== newCustIds || itemOptId !== optId;
                    }),
                }));
            },
            updateQuantity: (productId: number, quantity: number, customizations = [], selected_price_option = null) => {
                const newCustIds = (customizations || []).map((c) => c.id).sort().join(',');
                const optId = selected_price_option?.id || '';
                set((state) => ({
                    items: state.items.map((item) => {
                        if (item.product.id !== productId) return item;
                        const itemCustIds = (item.customizations || []).map((c) => c.id).sort().join(',');
                        const itemOptId = item.selected_price_option?.id || '';
                        return itemCustIds === newCustIds && itemOptId === optId ? { ...item, quantity } : item;
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
                    const basePrice = item.selected_price_option ? Number(item.selected_price_option.price) : Number(item.product.price);
                    return total + (basePrice + toppingsPrice) * item.quantity;
                }, 0);
            },
            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
            toggleUpgradeClaim: (productId, customizationId, claim, customizations = [], selected_price_option = null) => {
                const newCustIds = (customizations || []).map((c) => c.id).sort().join(',');
                const optId = selected_price_option?.id || '';
                set((state) => ({
                    items: state.items.map((item) => {
                        if (item.product.id !== productId) return item;
                        const itemCustIds = (item.customizations || []).map((c) => c.id).sort().join(',');
                        const itemOptId = item.selected_price_option?.id || '';
                        if (itemCustIds !== newCustIds || itemOptId !== optId) return item;
                        
                        return {
                            ...item,
                            customizations: (item.customizations || []).map((c) => 
                                c.id === customizationId ? { ...c, claim_upgrade: claim } : c
                            )
                        };
                    })
                }));
            },
        }),
        {
            name: 'ewwon-coco-cart',
        }
    )
);
