import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import POSLayout from '@/Layouts/POSLayout';
import { Product, ProductCategory } from '../../types';
import { usePOSStore } from '../../store/usePOSStore';
import { rupiah, qty, angka } from '../../lib/format';
import { 
    Search, 
    Plus, 
    Minus, 
    Trash2, 
    ShoppingCart, 
    User,
    CreditCard,
    ArrowRight,
    Store,
    Clock,
    Package,
    Receipt,
    Tag,
    X
} from 'lucide-react';
import PaymentModal from '../../Components/POS/PaymentModal';
import ReceiptModal from '../../Components/POS/ReceiptModal';
import { PosTransaction, PosShift, Branch } from '../../types';

interface POSScreenProps {
    products: Product[];
    categories: ProductCategory[];
    activeShift: PosShift & { branch: Branch };
    promotions: any[];
}

import { toastError, alertError } from '../../lib/swal';

export default function Screen({ products, categories, activeShift, promotions }: POSScreenProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState<PosTransaction | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [customerQuery, setCustomerQuery] = useState('');
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [usePoints, setUsePoints] = useState(false);
    const [transactionNotes, setTransactionNotes] = useState('');
    const [activeTab, setActiveTab] = useState<'menu' | 'cart'>('menu');
    const [orderChannel, setOrderChannel] = useState<'offline' | 'gofood' | 'grabfood' | 'shopeefood'>('offline');

    const {
        items, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart, 
        getTotal, 
        customerName, 
        setCustomerName,
        toggleUpgradeClaim,
        manualDiscountType,
        manualDiscountValue,
        discountReason,
        setManualDiscount,
        clearManualDiscount
    } = usePOSStore();

    const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
    const [posSelectedOptions, setPosSelectedOptions] = useState<Record<number, number[]>>({});
    const [posSelectedPriceOption, setPosSelectedPriceOption] = useState<any>(null);

    const [isManualDiscountModalOpen, setIsManualDiscountModalOpen] = useState(false);
    const [tempDiscountType, setTempDiscountType] = useState<'percent' | 'fixed'>('fixed');
    const [tempDiscountValue, setTempDiscountValue] = useState<string>('');
    const [tempDiscountReason, setTempDiscountReason] = useState('');

    const openManualDiscountModal = () => {
        setTempDiscountType(manualDiscountType || 'fixed');
        setTempDiscountValue(manualDiscountValue > 0 ? String(manualDiscountValue) : '');
        setTempDiscountReason(discountReason || '');
        setIsManualDiscountModalOpen(true);
    };

    const handleApplyManualDiscount = (e: React.FormEvent) => {
        e.preventDefault();
        const valueNum = Number(tempDiscountValue);
        if (isNaN(valueNum) || valueNum <= 0) {
            toastError('Jumlah potongan harus lebih besar dari 0.');
            return;
        }
        if (tempDiscountType === 'percent' && valueNum > 100) {
            toastError('Jumlah persen potongan maksimal adalah 100%.');
            return;
        }
        setManualDiscount(tempDiscountType, valueNum, tempDiscountReason.trim());
        setIsManualDiscountModalOpen(false);
    };

    const handleProductClick = (product: Product) => {
        if (
            (product.customizations && product.customizations.length > 0) ||
            (product.price_options && product.price_options.length > 0)
        ) {
            // Open customization modal
            const initial: Record<number, number[]> = {};
            if (product.customizations) {
                product.customizations.forEach((cust) => {
                    if (cust.type === 'single' && cust.options && cust.options.length > 0) {
                        initial[cust.id] = [cust.options[0].id];
                    } else {
                        initial[cust.id] = [];
                    }
                });
            }
            setPosSelectedOptions(initial);
            
            // Set the first price option as selected by default
            if (product.price_options && product.price_options.length > 0) {
                setPosSelectedPriceOption(product.price_options[0]);
            } else {
                setPosSelectedPriceOption(null);
            }

            setCustomizingProduct(product);
        } else {
            // Add immediately
            addItem(product);
        }
    };

    const handleConfirmCustomization = () => {
        if (!customizingProduct) return;
        const selectedList: any[] = [];
        if (customizingProduct.customizations) {
            customizingProduct.customizations.forEach((cust) => {
                const selectedIds = posSelectedOptions[cust.id] || [];
                if (cust.options) {
                    cust.options.forEach((opt) => {
                        if (selectedIds.includes(opt.id)) {
                            selectedList.push(opt);
                        }
                    });
                }
            });
        }
        addItem(customizingProduct, 1, '', selectedList, posSelectedPriceOption);
        setCustomizingProduct(null);
        setPosSelectedPriceOption(null);
    };

    const handleSearchCustomer = async () => {
        if (!customerQuery) return;
        setIsSearchingCustomer(true);
        try {
            const response = await axios.get(route('pos.find-customer'), {
                params: { query: customerQuery }
            });
            if (response.data.success) {
                setSelectedCustomer(response.data.data);
                setCustomerName(response.data.data.user_name);
            }
        } catch (error: any) {
            toastError(error.response?.data?.message || 'Customer tidak ditemukan');
        } finally {
            setIsSearchingCustomer(false);
        }
    };

    const activeUpgradePromos = useMemo(() => {
        if (!promotions) return [];
        let channelPromos = promotions.filter(p => {
            if (orderChannel === 'offline') {
                return p.applicable_on === 'offline' || p.applicable_on === 'all';
            } else {
                return p.applicable_on === orderChannel || p.applicable_on === 'all';
            }
        });
        if (selectedCustomer) {
            const isNewMember = (selectedCustomer.transaction_count || 0) === 0;
            if (!isNewMember) {
                channelPromos = channelPromos.filter(p => !p.is_new_member_only);
            }
        } else {
            channelPromos = channelPromos.filter(p => !p.is_new_member_only);
        }
        return channelPromos.filter(p => p.type === 'upgrade');
    }, [promotions, orderChannel, selectedCustomer]);

    const activeBogoPromos = useMemo(() => {
        if (!promotions) return [];
        let channelPromos = promotions.filter(p => {
            if (orderChannel === 'offline') {
                return p.applicable_on === 'offline' || p.applicable_on === 'all';
            } else {
                return p.applicable_on === orderChannel || p.applicable_on === 'all';
            }
        });
        if (selectedCustomer) {
            const isNewMember = (selectedCustomer.transaction_count || 0) === 0;
            if (!isNewMember) {
                channelPromos = channelPromos.filter(p => !p.is_new_member_only);
            }
        } else {
            channelPromos = channelPromos.filter(p => !p.is_new_member_only);
        }
        return channelPromos.filter(p => p.type === 'bogo');
    }, [promotions, orderChannel, selectedCustomer]);

    const getItemTotalPrice = (item: any) => {
        const itemPrice = item.selected_price_option ? Number(item.selected_price_option.price) : Number(item.product.price);
        const customizationsPrice = (item.customizations || []).reduce((sum: number, opt: any) => {
            const hasUpgrade = activeUpgradePromos.some(p => Number(p.upgrade_to_option_id) === Number(opt.id));
            const isClaimed = opt.claim_upgrade === true;
            return sum + (hasUpgrade && isClaimed ? 0 : Number(opt.price));
        }, 0);
        return (itemPrice + customizationsPrice) * item.quantity;
    };

    const cartTotal = useMemo(() => {
        return items.reduce((sum, item) => sum + getItemTotalPrice(item), 0);
    }, [items, activeUpgradePromos]);

    const calculatedManualDiscount = useMemo(() => {
        if (!manualDiscountType || manualDiscountValue <= 0) return 0;
        if (manualDiscountType === 'percent') {
            return Math.floor((cartTotal * manualDiscountValue) / 100);
        }
        return manualDiscountValue;
    }, [cartTotal, manualDiscountType, manualDiscountValue]);

    const cartTotalAfterManual = useMemo(() => {
        return Math.max(0, cartTotal - calculatedManualDiscount);
    }, [cartTotal, calculatedManualDiscount]);

    const pointsDiscount = useMemo(() => {
        if (!selectedCustomer || !usePoints) return 0;
        const balance = selectedCustomer.balance || 0;
        if (balance < 10) return 0;
        return Math.min(balance, Math.floor(cartTotalAfterManual / 1000)) * 1000;
    }, [selectedCustomer, usePoints, cartTotalAfterManual]);

    const grandTotal = useMemo(() => {
        return Math.max(0, cartTotalAfterManual - pointsDiscount);
    }, [cartTotalAfterManual, pointsDiscount]);

    const freeBogoItems = useMemo(() => {
        const isOjol = ['gofood', 'grabfood', 'shopeefood'].includes(orderChannel);
        if (!selectedCustomer && !isOjol) return [];
        if (activeBogoPromos.length === 0 || items.length === 0) return [];
        
        const specificBogoPromos = activeBogoPromos.filter(p => p.buy_product_id !== null && p.buy_product_id !== undefined);
        const globalBogoPromo = activeBogoPromos.find(p => p.buy_product_id === null || p.buy_product_id === undefined);

        const freeItemsMap: { [productId: number]: { product: Product; quantity: number; promoName: string } } = {};

        items.forEach(item => {
            const productId = Number(item.product.id);
            const qty = item.quantity;

            let promo = specificBogoPromos.find(p => Number(p.buy_product_id) === productId);
            if (!promo && globalBogoPromo) {
                promo = globalBogoPromo;
            }

            if (promo) {
                const buyQty = Number(promo.buy_quantity) || 1;
                const getQty = Number(promo.get_quantity) || 1;
                const multiplier = Math.floor(qty / buyQty);
                let freeQty = multiplier * getQty;

                if (promo.max_free_qty) {
                    freeQty = Math.min(freeQty, Number(promo.max_free_qty));
                }

                if (freeQty > 0) {
                    const freeProductId = promo.get_product_id ? Number(promo.get_product_id) : productId;
                    const freeProd = products.find(p => Number(p.id) === freeProductId);
                    if (freeProd) {
                        if (freeItemsMap[freeProductId]) {
                            freeItemsMap[freeProductId].quantity += freeQty;
                            if (promo.max_free_qty) {
                                freeItemsMap[freeProductId].quantity = Math.min(freeItemsMap[freeProductId].quantity, Number(promo.max_free_qty));
                            }
                        } else {
                            freeItemsMap[freeProductId] = {
                                product: freeProd,
                                quantity: freeQty,
                                promoName: promo.name
                            };
                        }
                    }
                }
            }
        });

        return Object.values(freeItemsMap);
    }, [items, activeBogoPromos, products, selectedCustomer, orderChannel]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
            return matchesSearch && matchesCategory;
        });
    }, [products, search, selectedCategory]);

    const handleProcessPayment = async (data: { payment_method: 'cash' | 'qris' | 'tester' | 'gofood' | 'grabfood' | 'shopeefood', amount_paid: number }) => {
        setIsProcessing(true);
        try {
            const response = await axios.post(route('pos.store'), {
                items: items,
                customer_name: customerName,
                customer_id: selectedCustomer?.user_id,
                use_points: usePoints,
                payment_method: data.payment_method,
                amount_paid: data.amount_paid,
                notes: transactionNotes,
                manual_discount_type: manualDiscountType,
                manual_discount_value: manualDiscountValue,
                discount_reason: discountReason
            }, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (response.data.success) {
                setOrderChannel('offline');
                setLastOrder(response.data.transaction);
                clearCart();
                clearManualDiscount();
                setSelectedCustomer(null);
                setCustomerQuery('');
                setUsePoints(false);
                setTransactionNotes('');
                setIsPaymentOpen(false);
                setIsReceiptOpen(true);
            }
        } catch (error: any) {
            console.error(error);
            const errMsg = error.response?.data?.message || 'Terjadi kesalahan saat memproses transaksi.';
            alertError('Pembayaran Gagal', errMsg);
        } finally {
            setIsProcessing(false);
        }
    };

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <POSLayout>
            <Head title="Kasir - EWWON COCO" />
            
            <div className="flex flex-col lg:flex-row h-full overflow-hidden pb-[64px] lg:pb-0 relative">
                {/* Left: Product Selection */}
                <div className={`flex-1 flex flex-col min-w-0 h-full ${activeTab === 'menu' ? 'flex' : 'hidden'} lg:flex`}>
                    {/* Branch & Shift Bar */}
                    <div className="px-4 lg:px-6 py-2.5 lg:py-3 bg-white border-b border-[#E8E4DD] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] flex items-center justify-center">
                                <Store size={18} className="text-[#2D6A4F]" />
                            </div>
                            <div>
                                <p className="text-[8px] font-bold text-[#B5AFA6] uppercase tracking-[0.15em]">Cabang Aktif</p>
                                <p className="text-sm font-black text-[#1A1A1A] tracking-tight">{activeShift.branch?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[8px] font-bold text-[#B5AFA6] uppercase tracking-[0.15em]">Shift Dimulai</p>
                                <p className="text-sm font-black text-[#D97706] tracking-tight">{new Date(activeShift.opened_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Clock size={18} className="text-[#D97706]" />
                            </div>
                        </div>
                    </div>

                    {/* Search & Categories */}
                    <div className="px-4 lg:px-6 pt-4 lg:pt-5 pb-3 lg:pb-4 space-y-3 lg:space-y-4 bg-[#F5F3EF]">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C4BEB5] group-focus-within:text-[#2D6A4F] transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="Cari menu favorit..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E8E4DD] rounded-2xl text-sm text-[#1A1A1A] placeholder:text-[#C4BEB5] focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F]/30 transition-all font-medium shadow-sm"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button 
                                onClick={() => setSelectedCategory(null)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[11px] font-bold transition-all duration-200 ${
                                    selectedCategory === null 
                                    ? 'bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/15' 
                                    : 'bg-white border border-[#E8E4DD] text-[#8A8379] hover:border-[#C4BEB5] hover:text-[#1A1A1A]'
                                }`}
                            >
                                Semua Menu
                            </button>
                            {categories.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[11px] font-bold transition-all duration-200 ${
                                        selectedCategory === cat.id 
                                        ? 'bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/15' 
                                        : 'bg-white border border-[#E8E4DD] text-[#8A8379] hover:border-[#C4BEB5] hover:text-[#1A1A1A]'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid — Premium Warm Cards */}
                    <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4 items-stretch bg-[#F5F3EF] content-start">
                        {filteredProducts.map(product => {
                            let localImg = product.image_url;
                            if (product.name.includes('Original')) localImg = '/coconut_original.png';
                            if (product.name.includes('Jeruk')) localImg = '/coconut_lime.png';
                            if (product.name.includes('Puding')) localImg = '/coconut_pudding.png';

                            const inCartQty = items.filter(i => i.product.id === product.id).reduce((s, i) => s + i.quantity, 0);

                            return (
                                <button 
                                    key={product.id}
                                    onClick={() => handleProductClick(product)}
                                    className={`relative bg-white p-3.5 rounded-3xl border-2 transition-all duration-300 text-left flex flex-col h-full group overflow-hidden ${
                                        inCartQty > 0 
                                            ? 'border-[#2D6A4F] shadow-[0_4px_20px_rgba(45,106,79,0.1)]' 
                                            : 'border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1'
                                    }`}
                                >
                                    {/* Cart quantity badge */}
                                    {inCartQty > 0 && (
                                        <div className="absolute top-3 right-3 z-20 w-7 h-7 bg-[#2D6A4F] rounded-xl flex items-center justify-center shadow-md shadow-[#2D6A4F]/20">
                                            <span className="text-[11px] font-black text-white">{angka(inCartQty)}</span>
                                        </div>
                                    )}

                                    <div className="aspect-square w-full rounded-2xl bg-[#F5F3EF] overflow-hidden mb-3.5 relative">
                                        {localImg ? (
                                            <img src={localImg} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-12 h-12 text-[#E8E4DD]" />
                                            </div>
                                        )}
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-[#2D6A4F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                            <div className="bg-white p-2.5 rounded-2xl shadow-lg">
                                                <Plus className="text-[#2D6A4F]" size={20} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-[12px] font-black text-[#1A1A1A] line-clamp-2 mb-2 font-poppins leading-snug group-hover:text-[#2D6A4F] transition-colors">{product.name}</h4>
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-[13px] font-black text-[#2D6A4F]">{rupiah(product.price)}</span>
                                        <span className={`text-[9px] font-bold ${product.stock < 10 ? 'text-red-500 bg-red-50 px-1.5 py-0.5 rounded' : 'text-[#C4BEB5]'}`}>
                                            {product.stock < 10 ? `Sisa ${qty(product.stock)}` : `stk ${qty(product.stock)}`}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Cart Panel — Warm White */}
                <div className={`flex-1 lg:flex-none lg:w-[480px] flex flex-col bg-white lg:border-l border-[#E8E4DD] relative h-full ${activeTab === 'cart' ? 'flex' : 'hidden'} lg:flex`}>
                    {/* Customer Info & Loyalty */}
                    <div className="p-3.5 border-b border-[#E8E4DD] space-y-3 flex-shrink-0">
                        {/* Order Channel Selector */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Store size={12} className="text-[#B5AFA6]" />
                                <span className="text-[9px] font-black text-[#B5AFA6] uppercase tracking-[0.15em]">Saluran Pembelian (Order Channel)</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                                {(['offline', 'gofood', 'grabfood', 'shopeefood'] as const).map(channel => {
                                    const labels = {
                                        offline: 'Offline',
                                        gofood: 'GoFood',
                                        grabfood: 'GrabFood',
                                        shopeefood: 'ShopeeFood'
                                    };
                                    const emojis = {
                                        offline: '🏠',
                                        gofood: '🛵',
                                        grabfood: '🟢',
                                        shopeefood: '🍊'
                                    };
                                    const activeColors = {
                                        offline: 'border-[#2D6A4F] bg-[#E8F5E9] text-[#2D6A4F]',
                                        gofood: 'border-[#ED1C24] bg-[#FDF0F1] text-[#ED1C24]',
                                        grabfood: 'border-[#00B14F] bg-[#F0FAF4] text-[#00B14F]',
                                        shopeefood: 'border-[#EE4D2D] bg-[#FEF0ED] text-[#EE4D2D]'
                                    };
                                    const isActive = orderChannel === channel;
                                    return (
                                        <button
                                            key={channel}
                                            type="button"
                                            onClick={() => {
                                                setOrderChannel(channel);
                                                // If we switch to ojol, set the customer name automatically
                                                if (channel !== 'offline' && (!customerName || ['GoFood', 'GrabFood', 'ShopeeFood'].includes(customerName))) {
                                                    setCustomerName(labels[channel]);
                                                } else if (channel === 'offline' && ['GoFood', 'GrabFood', 'ShopeeFood'].includes(customerName)) {
                                                    setCustomerName('');
                                                }
                                            }}
                                            className={`py-1.5 px-0.5 text-center rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                                                isActive 
                                                    ? activeColors[channel]
                                                    : 'border-[#E8E4DD] text-[#B5AFA6] hover:border-[#C4BEB5] hover:text-[#8A8379]'
                                            }`}
                                        >
                                            <span className="text-sm leading-none">{emojis[channel]}</span>
                                            <span className="text-[8px] font-black uppercase tracking-[0.02em]">{labels[channel]}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-0.5">
                                <User size={12} className="text-[#B5AFA6]" />
                                <span className="text-[9px] font-black text-[#B5AFA6] uppercase tracking-[0.15em]">Informasi Pelanggan</span>
                            </div>
                            
                            <div className="flex gap-1.5">
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Cari Email / No. HP..."
                                        value={customerQuery}
                                        onChange={(e) => setCustomerQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomer()}
                                        className="w-full bg-[#F5F3EF] border border-[#E8E4DD] rounded-xl px-3 py-1.5 text-xs font-bold placeholder:text-[#C4BEB5] focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F]/30 transition-all"
                                    />
                                    {isSearchingCustomer && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-[#2D6A4F]/20 border-t-[#2D6A4F] rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={handleSearchCustomer}
                                    className="px-3 py-1.5 bg-white border border-[#E8E4DD] text-[#2D6A4F] rounded-xl hover:bg-[#E8F5E9] transition-all"
                                >
                                    <Search size={14} />
                                </button>
                            </div>

                            {selectedCustomer ? (
                                <div className="bg-[#E8F5E9] p-2.5 rounded-xl border border-[#2D6A4F]/10 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#2D6A4F]/5 rounded-full group-hover:scale-110 transition-transform" />
                                    <div className="flex justify-between items-start mb-1 relative z-10">
                                        <div>
                                            <p className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-wider">{selectedCustomer.user_name}</p>
                                            <p className="text-[10px] text-[#2D6A4F]/70 font-bold">{selectedCustomer.user_phone}</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSelectedCustomer(null);
                                                setCustomerName('');
                                                setUsePoints(false);
                                            }}
                                            className="text-[#2D6A4F]/40 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2D6A4F]/10 relative z-10">
                                        <div className="flex items-center gap-1.5">
                                            <Tag size={10} className="text-[#2D6A4F]" />
                                            <span className="text-[10px] font-black text-[#2D6A4F]">{angka(selectedCustomer.balance)} Poin</span>
                                        </div>
                                        {selectedCustomer.balance >= 10 && (
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <span className="text-[9px] font-black text-[#2D6A4F] uppercase">Gunakan Poin</span>
                                                <div className="relative">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only" 
                                                        checked={usePoints}
                                                        onChange={(e) => setUsePoints(e.target.checked)}
                                                    />
                                                    <div className={`w-8 h-4 rounded-full transition-colors ${usePoints ? 'bg-[#2D6A4F]' : 'bg-[#C4BEB5]'}`}>
                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${usePoints ? 'left-4.5' : 'left-0.5'}`} />
                                                    </div>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className={`flex items-center gap-2 p-2.5 rounded-xl border border-dashed transition-all ${!customerName.trim() ? 'bg-red-50 border-red-300' : 'bg-[#F5F3EF] border-[#E8E4DD]'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all ${!customerName.trim() ? 'bg-red-100/50 border-red-200 text-red-500' : 'bg-white border-[#E8E4DD] text-[#C4BEB5]'}`}>
                                        <User size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 transition-all ${!customerName.trim() ? 'text-red-500' : 'text-[#B5AFA6]'}`}>Nama Pelanggan {!customerName.trim() && '(Wajib)'}</p>
                                        <input 
                                            type="text" 
                                            placeholder="Masukkan Nama Pelanggan..."
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="w-full border-none bg-transparent focus:ring-0 font-black text-[#1A1A1A] p-0 text-xs placeholder:text-[#C4BEB5]"
                                        />
                                    </div>
                                </div>
                            )}

                            {items.length > 0 && !selectedCustomer && promotions && promotions.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-2 flex gap-2 items-start mt-1">
                                    <Tag className="text-amber-600 flex-shrink-0 mt-0.5" size={12} />
                                    <div>
                                        <p className="text-[9px] font-black text-amber-800 uppercase tracking-wider">Promo BOGO Tersedia!</p>
                                        <p className="text-[9px] text-amber-700/90 mt-0.5 leading-relaxed font-bold">
                                            Masukkan email/No. HP member untuk mengaktifkan promo otomatis.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Header */}
                    <div className="px-4 pt-2.5 pb-1.5 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Receipt size={14} className="text-[#B5AFA6]" />
                            <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em]">Pesanan</span>
                        </div>
                        {items.length > 0 && (
                            <span className="text-[10px] font-black text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded-lg">{angka(itemCount)} item</span>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-4 py-1.5 space-y-2">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-6 min-h-[160px]">
                                <div className="w-16 h-16 bg-[#F5F3EF] rounded-3xl flex items-center justify-center text-[#E8E4DD] mb-3 rotate-6">
                                    <ShoppingCart size={28} />
                                </div>
                                <p className="font-black text-[#1A1A1A] text-xs">Keranjang kosong</p>
                                <p className="text-[10px] text-[#B5AFA6] mt-1 max-w-[200px] leading-relaxed">
                                    Pilih menu dari panel kiri untuk memulai transaksi baru.
                                </p>
                            </div>
                        ) : (
                            <>
                                {items.map((item, idx) => {
                                    const itemKey = item.product.id + '-' + (item.selected_price_option?.id || '') + '-' + (item.customizations || []).map(c => c.id).sort().join(',');
                                    const itemTotalPrice = getItemTotalPrice(item);

                                    return (
                                        <div key={itemKey} className="flex items-start gap-3 bg-[#FAFAF8] p-3 rounded-2xl border border-[#F0EDE8] hover:bg-[#F5F3EF] transition-colors">
                                            <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-[#E8E4DD] mt-0.5">
                                                <img 
                                                    src={item.product.name.includes('Original') ? '/coconut_original.png' : (item.product.name.includes('Jeruk') ? '/coconut_lime.png' : (item.product.name.includes('Puding') ? '/coconut_pudding.png' : item.product.image_url || '/coconut_original.png'))} 
                                                    className="w-full h-full object-cover" 
                                                    alt=""
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-[13px] font-black text-[#1A1A1A] font-poppins leading-tight break-words">
                                                    {item.product.name}
                                                    {item.selected_price_option && (
                                                        <span className="text-[10px] text-[#2D6A4F] font-black ml-1.5 px-2 py-0.5 bg-[#E8F5E9] rounded-md">
                                                            {item.selected_price_option.name}
                                                        </span>
                                                    )}
                                                </h5>
                                                {item.customizations && item.customizations.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                                        {item.customizations.map(c => {
                                                            const hasUpgrade = activeUpgradePromos.some(p => Number(p.upgrade_to_option_id) === Number(c.id));
                                                            const isClaimed = c.claim_upgrade === true;
                                                            if (hasUpgrade) {
                                                                 return (
                                                                    <div key={c.id} className="w-full flex flex-col bg-white/70 p-2 rounded-xl border border-[#E8E4DD] mt-1 shadow-sm">
                                                                        <span className="text-[11px] text-[#1A1A1A] font-black">
                                                                            • {c.name} {isClaimed && ' (Upgrade Free)'}
                                                                        </span>
                                                                        <label className="inline-flex items-center gap-2 cursor-pointer mt-1.5 select-none" onClick={(e) => e.stopPropagation()}>
                                                                            <input 
                                                                                type="checkbox" 
                                                                                checked={isClaimed}
                                                                                onChange={(e) => toggleUpgradeClaim(item.product.id, c.id, e.target.checked, item.customizations, item.selected_price_option)}
                                                                                className="w-4.5 h-4.5 text-[#2D6A4F] border-[#C4BEB5] rounded focus:ring-0 focus:ring-offset-0"
                                                                            />
                                                                            <span className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-wider">Klaim Upgrade</span>
                                                                        </label>
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <span key={c.id} className="inline-block text-[11px] text-[#6E685E] font-medium bg-[#F5F3EF] px-2.5 py-1 rounded-lg border border-[#E8E4DD]/50">
                                                                    {c.name}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                <p className="text-[12px] text-[#2D6A4F] font-black mt-2">{rupiah(itemTotalPrice)}</p>
                                            </div>
                                            <div className="flex items-center bg-white rounded-xl p-0.5 border border-[#E8E4DD] shadow-sm flex-shrink-0 mt-0.5">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, item.quantity - 1, item.customizations, item.selected_price_option); }} 
                                                    className="w-8 h-8 flex items-center justify-center text-[#C4BEB5] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Minus size={13} strokeWidth={2.5} />
                                                </button>
                                                <span className="w-6 text-center text-xs font-black text-[#1A1A1A]">{angka(item.quantity)}</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, item.quantity + 1, item.customizations, item.selected_price_option); }} 
                                                    className="w-8 h-8 flex items-center justify-center text-[#C4BEB5] hover:text-[#2D6A4F] hover:bg-[#E8F5E9] rounded-xl transition-all"
                                                >
                                                    <Plus size={13} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {freeBogoItems.map((freeItem, idx) => (
                                    <div key={`free-${freeItem.product.id}`} className="flex items-center gap-2 bg-[#E8F5E9]/50 p-2 rounded-xl border border-dashed border-[#2D6A4F]/20 relative overflow-hidden transition-all duration-200">
                                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-[#E8E4DD]">
                                            <img 
                                                src={freeItem.product.name.includes('Original') ? '/coconut_original.png' : (freeItem.product.name.includes('Jeruk') ? '/coconut_lime.png' : (freeItem.product.name.includes('Puding') ? '/coconut_pudding.png' : freeItem.product.image_url || '/coconut_original.png'))} 
                                                className="w-full h-full object-cover" 
                                                alt=""
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="bg-[#2D6A4F] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Gratis BOGO</span>
                                                <span className="text-[9px] text-[#2D6A4F] font-bold truncate max-w-[120px]">{freeItem.promoName}</span>
                                            </div>
                                            <h5 className="text-[11px] font-black text-[#1A1A1A] truncate font-poppins">{freeItem.product.name}</h5>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-400 line-through">{rupiah(freeItem.product.price * freeItem.quantity)}</span>
                                            <span className="text-xs font-black text-[#2D6A4F]">{angka(freeItem.quantity)}x</span>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Checkout Footer */}
                    <div className="p-3.5 bg-[#FAFAF8] border-t border-[#E8E4DD] space-y-2.5 flex-shrink-0">
                        {/* Transaction Note Input */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-[#8A8379] uppercase tracking-[0.1em] block mb-0.5">Catatan Transaksi</label>
                            <input 
                                type="text"
                                placeholder="Tulis catatan (misal: Tester untuk tamu, dll)..."
                                value={transactionNotes}
                                onChange={(e) => setTransactionNotes(e.target.value)}
                                className="w-full bg-white border border-[#E8E4DD] rounded-xl px-2.5 py-1.5 text-xs font-medium placeholder:text-[#C4BEB5] focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F]/30 transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex items-center justify-between py-1 bg-white border border-[#E8E4DD] rounded-xl px-2.5 shadow-sm">
                            <span className="text-[9px] font-bold text-[#8A8379] uppercase tracking-[0.15em] block">Potongan Manual</span>
                            <button
                                type="button"
                                onClick={openManualDiscountModal}
                                className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${
                                    calculatedManualDiscount > 0
                                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                        : 'bg-[#F5F3EF] text-[#2D6A4F] border-[#E8E4DD] hover:bg-[#E8E4DD]'
                                }`}
                            >
                                {calculatedManualDiscount > 0 ? 'Edit Potongan' : 'Tambah Potongan'}
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-[#B5AFA6] uppercase tracking-[0.12em]">Subtotal</span>
                                <span className="text-xs font-black text-[#8A8379]">{rupiah(cartTotal)}</span>
                            </div>
                            {calculatedManualDiscount > 0 && (
                                <div className="flex justify-between items-center bg-red-50/50 p-2 rounded-xl border border-red-100/40">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-red-600 uppercase tracking-[0.12em]">
                                            Potongan Manual ({manualDiscountType === 'percent' ? `${manualDiscountValue}%` : 'Nominal'})
                                        </span>
                                        <span className="text-[8px] text-gray-500 font-bold max-w-[120px] truncate">{discountReason}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-black text-red-600">-{rupiah(calculatedManualDiscount)}</span>
                                        <button 
                                            type="button"
                                            onClick={clearManualDiscount} 
                                            className="text-gray-400 hover:text-red-600 p-0.5 rounded transition-colors"
                                            title="Hapus diskon"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {pointsDiscount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-[#D97706] uppercase tracking-[0.12em]">Potongan Poin</span>
                                    <span className="text-xs font-black text-[#D97706] animate-pulse">-{rupiah(pointsDiscount)}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-2.5 border-t-2 border-dashed border-[#E8E4DD]">
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[8px] font-bold text-[#2D6A4F] uppercase tracking-[0.2em] block mb-0.5">Grand Total</span>
                                    <span className="text-[22px] font-black text-[#1A1A1A] tracking-tighter font-poppins leading-none">{rupiah(grandTotal)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1.5">
                            <button 
                                onClick={clearCart}
                                disabled={items.length === 0}
                                className="w-11 h-11 bg-white text-red-400 rounded-xl flex items-center justify-center hover:bg-[#FAFAF8] hover:text-red-500 border border-[#E8E4DD] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                                title="Kosongkan Keranjang"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button 
                                onClick={() => setIsPaymentOpen(true)}
                                disabled={items.length === 0 || !customerName.trim()}
                                className="flex-1 bg-gradient-to-r from-[#2D6A4F] to-[#40916C] hover:from-[#1B4332] hover:to-[#2D6A4F] disabled:from-[#E8E4DD] disabled:to-[#E8E4DD] disabled:text-[#B5AFA6] text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-[#2D6A4F]/15 group disabled:shadow-none"
                            >
                                <CreditCard size={16} className="group-hover:rotate-6 transition-transform" />
                                <span className="text-xs uppercase tracking-[0.1em]">Bayar Sekarang</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Nav Bar for Mobile/Tablet */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8E4DD] px-4 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-[64px]">
                    <button 
                        onClick={() => setActiveTab('menu')}
                        className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all duration-200 ${
                            activeTab === 'menu' 
                                ? 'text-[#2D6A4F]' 
                                : 'text-[#8A8379] hover:text-[#1A1A1A]'
                        }`}
                    >
                        <div className={`p-1 rounded-lg transition-all ${activeTab === 'menu' ? 'bg-[#E8F5E9]' : ''}`}>
                            <Store size={20} className={activeTab === 'menu' ? 'stroke-[2.5]' : ''} />
                        </div>
                        <span className="text-[9px] font-black tracking-wider uppercase font-poppins">Menu</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('cart')}
                        className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all duration-200 relative ${
                            activeTab === 'cart' 
                                ? 'text-[#2D6A4F]' 
                                : 'text-[#8A8379] hover:text-[#1A1A1A]'
                        }`}
                    >
                        <div className={`p-1 rounded-lg transition-all relative ${activeTab === 'cart' ? 'bg-[#E8F5E9]' : ''}`}>
                            <ShoppingCart size={20} className={activeTab === 'cart' ? 'stroke-[2.5]' : ''} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-sm">
                                    {itemCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[9px] font-black tracking-wider uppercase font-poppins">Keranjang</span>
                    </button>
                </div>
            </div>

            <PaymentModal 
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                total={grandTotal}
                onConfirm={handleProcessPayment}
                processing={isProcessing}
                defaultMethod={orderChannel === 'offline' ? 'cash' : orderChannel}
                items={items}
                freeBogoItems={freeBogoItems}
                activeUpgradePromos={activeUpgradePromos}
            />

            <ReceiptModal 
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                order={lastOrder}
            />

            {/* POS Customization Modal */}
            {customizingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#E8E4DD] flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-[#E8E4DD] bg-[#F5F3EF]">
                            <h3 className="text-lg font-black text-[#1A1A1A] font-poppins">{customizingProduct.name}</h3>
                            <p className="text-xs text-[#8A8379] font-medium mt-1">Sesuaikan pesanan pelanggan</p>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Pilihan Satuan / Harga */}
                            {customizingProduct.price_options && customizingProduct.price_options.length > 0 && (
                                <div className="space-y-2.5 pb-4 border-b border-[#E8E4DD]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-[#B5AFA6] uppercase tracking-wider">Pilih Satuan / Ukuran</span>
                                        <span className="text-[9px] font-bold bg-[#E8F5E9] text-[#2D6A4F] px-2 py-0.5 rounded">Wajib</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {customizingProduct.price_options.map((opt) => {
                                            const isSelected = posSelectedPriceOption?.id === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setPosSelectedPriceOption(opt)}
                                                    className={`p-3 rounded-2xl border-2 font-bold text-left transition-all flex flex-col justify-between h-20 ${
                                                        isSelected 
                                                            ? 'border-[#2D6A4F] bg-[#E8F5E9] text-[#2D6A4F]' 
                                                            : 'border-[#E8E4DD] bg-white text-[#8A8379] hover:border-[#C4BEB5]'
                                                    }`}
                                                >
                                                    <span className="text-xs">{opt.name}</span>
                                                    <span className="text-[11px] font-black text-[#2D6A4F]">{rupiah(opt.price)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {customizingProduct.customizations?.map((cust) => (
                                <div key={cust.id} className="space-y-2.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-[#B5AFA6] uppercase tracking-wider">{cust.name}</span>
                                        <span className="text-[9px] font-bold bg-[#E8F5E9] text-[#2D6A4F] px-2 py-0.5 rounded">
                                            {cust.type === 'single' ? 'Pilih Satu' : 'Pilih Banyak'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {cust.options?.map((opt) => {
                                            const isSelected = (posSelectedOptions[cust.id] || []).includes(opt.id);
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = posSelectedOptions[cust.id] || [];
                                                        if (cust.type === 'single') {
                                                            setPosSelectedOptions({ ...posSelectedOptions, [cust.id]: [opt.id] });
                                                        } else {
                                                            if (current.includes(opt.id)) {
                                                                setPosSelectedOptions({ ...posSelectedOptions, [cust.id]: current.filter(id => id !== opt.id) });
                                                            } else {
                                                                setPosSelectedOptions({ ...posSelectedOptions, [cust.id]: [...current, opt.id] });
                                                            }
                                                        }
                                                    }}
                                                    className={`p-3 rounded-2xl border-2 font-bold text-left transition-all flex flex-col justify-between h-20 ${
                                                        isSelected 
                                                            ? 'border-[#2D6A4F] bg-[#E8F5E9] text-[#2D6A4F]' 
                                                            : 'border-[#E8E4DD] bg-white text-[#8A8379] hover:border-[#C4BEB5]'
                                                    }`}
                                                >
                                                    <span className="text-xs">{opt.name}</span>
                                                    {Number(opt.price) > 0 && (
                                                        <span className="text-[11px] font-black text-[#2D6A4F]">+{rupiah(opt.price)}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Footer */}
                        <div className="p-6 border-t border-[#E8E4DD] bg-[#F5F3EF] flex gap-3">
                            <button
                                type="button"
                                onClick={() => setCustomizingProduct(null)}
                                className="flex-1 py-3.5 bg-white border border-[#E8E4DD] text-[#8A8379] font-bold rounded-2xl hover:bg-gray-100 transition-all text-sm uppercase tracking-wider"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmCustomization}
                                className="flex-1 py-3.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-2xl transition-all text-sm uppercase tracking-wider"
                            >
                                Konfirmasi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Discount Modal */}
            {isManualDiscountModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#F5F3EF] rounded-[2rem] w-full max-w-md p-6 shadow-2xl border border-[#E8E4DD] animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center border-b border-[#E8E4DD] pb-4 mb-4">
                            <div>
                                <h3 className="font-poppins font-black text-[#1A1A1A]">Potongan Manual</h3>
                                <p className="text-[10px] font-bold text-[#B5AFA6] uppercase tracking-[0.1em]">Input Diskon Khusus POS</p>
                            </div>
                            <button 
                                onClick={() => setIsManualDiscountModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E8E4DD]/40 text-[#B5AFA6] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleApplyManualDiscount} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Tipe Potongan</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTempDiscountType('fixed')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                            tempDiscountType === 'fixed'
                                                ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/10'
                                                : 'bg-white border-[#E8E4DD] text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        Nominal (Rp)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTempDiscountType('percent')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                            tempDiscountType === 'percent'
                                                ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/10'
                                                : 'bg-white border-[#E8E4DD] text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        Persentase (%)
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Jumlah Potongan</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={tempDiscountType === 'percent' ? 100 : undefined}
                                    placeholder={tempDiscountType === 'percent' ? 'Contoh: 10' : 'Contoh: 5000'}
                                    value={tempDiscountValue}
                                    onChange={(e) => setTempDiscountValue(e.target.value)}
                                    className="w-full bg-white border border-[#E8E4DD] rounded-xl px-4 py-3 text-sm font-black focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 outline-none transition-all shadow-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Alasan / Catatan (Wajib)</label>
                                <textarea
                                    placeholder="Alasan memberikan diskon (contoh: Diskon Rekan Owner, Diskon Promo Ultah, dll)..."
                                    value={tempDiscountReason}
                                    onChange={(e) => setTempDiscountReason(e.target.value)}
                                    className="w-full bg-white border border-[#E8E4DD] rounded-xl px-4 py-3 text-xs font-medium focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 outline-none transition-all shadow-sm min-h-[80px] resize-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsManualDiscountModalOpen(false)}
                                    className="flex-1 py-3.5 font-bold text-xs text-[#8A8379] hover:bg-[#E8E4DD]/40 rounded-xl transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-3.5 bg-gradient-to-r from-[#2D6A4F] to-[#40916C] hover:from-[#1B4332] hover:to-[#2D6A4F] text-white text-xs font-black rounded-xl shadow-lg transition-all"
                                >
                                    Terapkan Potongan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </POSLayout>
    );
}
