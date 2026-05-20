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
    Tag
} from 'lucide-react';
import PaymentModal from '../../Components/POS/PaymentModal';
import ReceiptModal from '../../Components/POS/ReceiptModal';
import { PosTransaction, PosShift, Branch } from '../../types';

interface POSScreenProps {
    products: Product[];
    categories: ProductCategory[];
    activeShift: PosShift & { branch: Branch };
}

import { toastError, alertError } from '../../lib/swal';

export default function Screen({ products, categories, activeShift }: POSScreenProps) {
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

    const { 
        items, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart, 
        getTotal, 
        customerName, 
        setCustomerName 
    } = usePOSStore();

    const handleSearchCustomer = async () => {
        if (!customerQuery) return;
        setIsSearchingCustomer(true);
        try {
            const response = await axios.get(route('api.points.find-customer'), {
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

    const grandTotal = getTotal();

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
            return matchesSearch && matchesCategory;
        });
    }, [products, search, selectedCategory]);

    const handleProcessPayment = async (data: { payment_method: 'cash' | 'qris', amount_paid: number }) => {
        setIsProcessing(true);
        try {
            const response = await axios.post(route('pos.store'), {
                items: items,
                customer_name: customerName,
                customer_id: selectedCustomer?.user_id,
                use_points: usePoints,
                payment_method: data.payment_method,
                amount_paid: data.amount_paid
            });

            if (response.data.success) {
                setLastOrder(response.data.transaction);
                clearCart();
                setSelectedCustomer(null);
                setCustomerQuery('');
                setUsePoints(false);
                setIsPaymentOpen(false);
                setIsReceiptOpen(true);
            }
        } catch (error) {
            console.error(error);
            alertError('Pembayaran Gagal', 'Terjadi kesalahan saat memproses transaksi.');
        } finally {
            setIsProcessing(false);
        }
    };

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <POSLayout>
            <Head title="Kasir - EWWON COCO" />
            
            <div className="flex h-full">
                {/* Left: Product Selection */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Branch & Shift Bar */}
                    <div className="px-6 py-3 bg-white border-b border-[#E8E4DD] flex items-center justify-between">
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
                    <div className="px-6 pt-5 pb-4 space-y-4 bg-[#F5F3EF]">
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
                    <div className="flex-1 overflow-y-auto px-6 pb-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 items-start bg-[#F5F3EF] content-start">
                        {filteredProducts.map(product => {
                            let localImg = product.image_url;
                            if (product.name.includes('Original')) localImg = '/coconut_original.png';
                            if (product.name.includes('Jeruk')) localImg = '/coconut_lime.png';
                            if (product.name.includes('Puding')) localImg = '/coconut_pudding.png';

                            const inCart = items.find(i => i.product.id === product.id);

                            return (
                                <button 
                                    key={product.id}
                                    onClick={() => addItem(product)}
                                    className={`relative bg-white p-3.5 rounded-3xl border-2 transition-all duration-300 text-left flex flex-col h-fit group overflow-hidden ${
                                        inCart 
                                            ? 'border-[#2D6A4F] shadow-[0_4px_20px_rgba(45,106,79,0.1)]' 
                                            : 'border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1'
                                    }`}
                                >
                                    {/* Cart quantity badge */}
                                    {inCart && (
                                        <div className="absolute top-3 right-3 z-20 w-7 h-7 bg-[#2D6A4F] rounded-xl flex items-center justify-center shadow-md shadow-[#2D6A4F]/20">
                                            <span className="text-[11px] font-black text-white">{angka(inCart.quantity)}</span>
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
                <div className="w-[400px] flex flex-col bg-white border-l border-[#E8E4DD] relative">
                    {/* Customer Info & Loyalty */}
                    <div className="p-5 border-b border-[#E8E4DD] space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <User size={14} className="text-[#B5AFA6]" />
                                <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em]">Informasi Pelanggan</span>
                            </div>
                            
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Cari Email / No. HP..."
                                        value={customerQuery}
                                        onChange={(e) => setCustomerQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomer()}
                                        className="w-full bg-[#F5F3EF] border border-[#E8E4DD] rounded-xl px-4 py-2.5 text-xs font-bold placeholder:text-[#C4BEB5] focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F]/30 transition-all"
                                    />
                                    {isSearchingCustomer && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-[#2D6A4F]/20 border-t-[#2D6A4F] rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={handleSearchCustomer}
                                    className="px-4 py-2.5 bg-white border border-[#E8E4DD] text-[#2D6A4F] rounded-xl hover:bg-[#E8F5E9] transition-all"
                                >
                                    <Search size={16} />
                                </button>
                            </div>

                            {selectedCustomer ? (
                                <div className="bg-[#E8F5E9] p-4 rounded-2xl border border-[#2D6A4F]/10 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#2D6A4F]/5 rounded-full group-hover:scale-110 transition-transform" />
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <div>
                                            <p className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-wider">{selectedCustomer.user_name}</p>
                                            <p className="text-[11px] text-[#2D6A4F]/70 font-bold">{selectedCustomer.user_phone}</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSelectedCustomer(null);
                                                setCustomerName('Pelanggan Umum');
                                                setUsePoints(false);
                                            }}
                                            className="text-[#2D6A4F]/40 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2D6A4F]/10 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <Tag size={12} className="text-[#2D6A4F]" />
                                            <span className="text-[11px] font-black text-[#2D6A4F]">{angka(selectedCustomer.balance)} Poin</span>
                                        </div>
                                        {selectedCustomer.balance >= 10 && (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <span className="text-[10px] font-black text-[#2D6A4F] uppercase">Gunakan Poin</span>
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
                                <div className="flex items-center gap-3 bg-[#F5F3EF] p-4 rounded-2xl border border-[#E8E4DD] border-dashed">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-[#E8E4DD]">
                                        <User size={20} className="text-[#C4BEB5]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-[#B5AFA6] uppercase tracking-wider mb-0.5">Nama Pelanggan</p>
                                        <input 
                                            type="text" 
                                            placeholder="Pelanggan Umum"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="w-full border-none bg-transparent focus:ring-0 font-black text-[#1A1A1A] p-0 text-sm placeholder:text-[#C4BEB5]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Header */}
                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Receipt size={14} className="text-[#B5AFA6]" />
                            <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em]">Pesanan</span>
                        </div>
                        {items.length > 0 && (
                            <span className="text-[10px] font-black text-[#2D6A4F] bg-[#E8F5E9] px-2.5 py-1 rounded-lg">{angka(itemCount)} item</span>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2.5">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-16">
                                <div className="w-20 h-20 bg-[#F5F3EF] rounded-3xl flex items-center justify-center text-[#E8E4DD] mb-5 rotate-6">
                                    <ShoppingCart size={36} />
                                </div>
                                <p className="font-black text-[#1A1A1A] text-sm">Keranjang kosong</p>
                                <p className="text-[11px] text-[#B5AFA6] mt-2 max-w-[200px] leading-relaxed">
                                    Pilih menu dari panel kiri untuk memulai transaksi baru.
                                </p>
                            </div>
                        ) : (
                            items.map((item, idx) => (
                                <div key={item.product.id} className="flex items-center gap-3 bg-[#FAFAF8] p-3 rounded-2xl border border-[#F0EDE8] hover:bg-[#F5F3EF] transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-[#E8E4DD]">
                                        <img 
                                            src={item.product.name.includes('Original') ? '/coconut_original.png' : (item.product.name.includes('Jeruk') ? '/coconut_lime.png' : (item.product.name.includes('Puding') ? '/coconut_pudding.png' : item.product.image_url || '/coconut_original.png'))} 
                                            className="w-full h-full object-cover" 
                                            alt=""
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-[12px] font-black text-[#1A1A1A] truncate font-poppins">{item.product.name}</h5>
                                        <p className="text-[11px] text-[#2D6A4F] font-black">{rupiah(item.product.price * item.quantity)}</p>
                                    </div>
                                    <div className="flex items-center bg-white rounded-xl p-0.5 border border-[#E8E4DD] shadow-sm">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, item.quantity - 1); }} 
                                            className="w-8 h-8 flex items-center justify-center text-[#C4BEB5] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Minus size={13} strokeWidth={2.5} />
                                        </button>
                                        <span className="w-7 text-center text-[12px] font-black text-[#1A1A1A]">{angka(item.quantity)}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, item.quantity + 1); }} 
                                            className="w-8 h-8 flex items-center justify-center text-[#C4BEB5] hover:text-[#2D6A4F] hover:bg-[#E8F5E9] rounded-lg transition-all"
                                        >
                                            <Plus size={13} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Checkout Footer */}
                    <div className="p-5 bg-[#FAFAF8] border-t border-[#E8E4DD] space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-[#B5AFA6] uppercase tracking-[0.12em]">Subtotal</span>
                                <span className="text-sm font-black text-[#8A8379]">{rupiah(getTotal())}</span>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t-2 border-dashed border-[#E8E4DD]">
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[9px] font-bold text-[#2D6A4F] uppercase tracking-[0.2em] block mb-1">Grand Total</span>
                                    <span className="text-[28px] font-black text-[#1A1A1A] tracking-tighter font-poppins leading-none">{rupiah(getTotal())}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={clearCart}
                                disabled={items.length === 0}
                                className="w-14 h-14 bg-white text-red-400 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white border border-[#E8E4DD] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                                title="Kosongkan Keranjang"
                            >
                                <Trash2 size={20} />
                            </button>
                            <button 
                                onClick={() => setIsPaymentOpen(true)}
                                disabled={items.length === 0}
                                className="flex-1 bg-gradient-to-r from-[#2D6A4F] to-[#40916C] hover:from-[#1B4332] hover:to-[#2D6A4F] disabled:from-[#E8E4DD] disabled:to-[#E8E4DD] disabled:text-[#B5AFA6] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-[#2D6A4F]/15 group disabled:shadow-none"
                            >
                                <CreditCard size={20} className="group-hover:rotate-6 transition-transform" />
                                <span className="text-sm uppercase tracking-[0.1em]">Bayar Sekarang</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentModal 
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                total={getTotal()}
                onConfirm={handleProcessPayment}
                processing={isProcessing}
            />

            <ReceiptModal 
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                order={lastOrder}
            />
        </POSLayout>
    );
}
