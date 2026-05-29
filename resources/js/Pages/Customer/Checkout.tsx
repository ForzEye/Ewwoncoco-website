import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import { useCartStore } from '../../store/useCartStore';
import { rupiah } from '../../lib/format';
import { MapPin, Truck, Wallet, CheckCircle } from 'lucide-react';

import { toastWarning } from '../../lib/swal';

interface CheckoutProps {
    promotions?: any[];
    branches?: any[];
}

export default function Checkout({ promotions = [], branches = [] }: CheckoutProps) {
    const { items, getTotal, clearCart } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);

    const currentBranch = React.useMemo(() => {
        if (!branches || branches.length === 0) return null;
        const cartBranchId = items[0]?.product.branch_id;
        return branches.find(b => Number(b.id) === Number(cartBranchId)) || branches[0];
    }, [items, branches]);

    const freeBogoItems = React.useMemo(() => {
        if (!promotions || promotions.length === 0 || items.length === 0) return [];
        
        const specificBogoPromos = promotions.filter(p => p.buy_product_id !== null && p.buy_product_id !== undefined);
        const globalBogoPromo = promotions.find(p => p.buy_product_id === null || p.buy_product_id === undefined);

        const freeItemsMap: { [productId: number]: { product: any; quantity: number; promoName: string } } = {};

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
                const freeQty = multiplier * getQty;

                if (freeQty > 0) {
                    const freeProductId = promo.get_product_id ? Number(promo.get_product_id) : productId;
                    const freeProd = promo.get_product || item.product; // Fallback
                    if (freeProd) {
                        if (freeItemsMap[freeProductId]) {
                            freeItemsMap[freeProductId].quantity += freeQty;
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
    }, [items, promotions]);

    const { data, setData, post, processing, errors } = useForm({
        address: '',
        lat: -6.2, // Default Jakarta
        lng: 106.8, // Default Jakarta
        delivery_provider: 'gosend',
        delivery_type: 'delivery', // 'delivery' or 'pickup'
        payment_method: 'qris',
        items: [] as any[],
    });

    const [deliveryQuote, setDeliveryQuote] = useState<{fee: number, distance: number, estimated_minutes: number} | null>(null);
    const [isFetchingQuote, setIsFetchingQuote] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Sync items from Zustand to Inertia form
        setData('items', items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            notes: item.notes,
            customizations: (item.customizations || []).map(c => ({
                name: c.name,
                price: Number(c.price)
            }))
        })));
    }, [items]);

    useEffect(() => {
        if (isMounted && items.length > 0) {
            fetchQuote();
        }
    }, [data.delivery_provider, data.lat, data.lng, isMounted]);

    const fetchQuote = async () => {
        setIsFetchingQuote(true);
        try {
            // In real app, we get branch_id from products in cart
            const branchId = items[0]?.product.branch_id || 1; 
            const response = await fetch(`/api/delivery/quote?branch_id=${branchId}&destination_lat=${data.lat}&destination_lng=${data.lng}&provider=${data.delivery_provider}`);
            const result = await response.json();
            setDeliveryQuote(result);
        } catch (error) {
            console.error('Failed to fetch delivery quote', error);
        } finally {
            setIsFetchingQuote(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation for delivery
        if (data.delivery_type === 'delivery' && !data.address) {
            toastWarning('Silakan isi alamat pengiriman.');
            return;
        }

        post('/checkout', {
            onSuccess: () => {
                clearCart();
            }
        });
    };

    if (!isMounted) return null;

    const actualDeliveryFee = data.delivery_type === 'pickup' ? 0 : (deliveryQuote?.fee || 0);
    const finalTotal = getTotal() + actualDeliveryFee;

    return (
        <LandingLayout>
            <Head title="Checkout - EWWON COCO" />
            
            <div className="bg-gray-50 min-h-screen pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-poppins font-bold text-3xl text-[#1A1A1A] mb-8">Checkout</h1>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Kiri */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Metode Pengambilan */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] mb-4 flex items-center">
                                    <Truck className="text-[#00C48C] mr-2" size={20} />
                                    Pilih Cara Mendapatkan Pesanan
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setData('delivery_type', 'delivery')}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${data.delivery_type === 'delivery' ? 'border-[#00C48C] bg-[#F0FAF6]' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <Truck size={24} className={data.delivery_type === 'delivery' ? 'text-[#00C48C]' : 'text-gray-400'} />
                                        <span className={`text-sm font-bold ${data.delivery_type === 'delivery' ? 'text-[#1A1A1A]' : 'text-gray-500'}`}>Diantar (Delivery)</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setData('delivery_type', 'pickup')}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${data.delivery_type === 'pickup' ? 'border-[#00C48C] bg-[#F0FAF6]' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <CheckCircle size={24} className={data.delivery_type === 'pickup' ? 'text-[#00C48C]' : 'text-gray-400'} />
                                        <span className={`text-sm font-bold ${data.delivery_type === 'pickup' ? 'text-[#1A1A1A]' : 'text-gray-500'}`}>Ambil Sendiri (Pick-up)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Alamat Pengiriman (Hanya jika delivery) */}
                            {data.delivery_type === 'delivery' ? (
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] mb-4 flex items-center">
                                        <MapPin className="text-[#00C48C] mr-2" size={20} />
                                        Alamat Pengiriman
                                    </h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Detail Alamat</label>
                                        <textarea 
                                            rows={3}
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-[#00C48C] focus:border-[#00C48C] outline-none font-inter"
                                            placeholder="Masukkan alamat lengkap pengiriman..."
                                            required={data.delivery_type === 'delivery'}
                                        ></textarea>
                                    </div>
                                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center text-gray-500 text-sm">
                                        <MapPin size={16} className="mr-2" /> Pilih Titik di Peta (Google Maps placeholder)
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] mb-4 flex items-center">
                                        <MapPin className="text-[#00C48C] mr-2" size={20} />
                                        Lokasi Pengambilan
                                    </h3>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <p className="font-poppins font-bold text-[#1A1A1A]">
                                            {currentBranch ? currentBranch.name : 'Outlet EWWON COCO'}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {currentBranch ? currentBranch.address : 'Alamat Pengambilan'}
                                        </p>
                                        <p className="text-[10px] font-black text-[#00C48C] uppercase tracking-widest mt-3 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-[#00C48C] rounded-full"></div>
                                            Tersedia untuk Diambil
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Pilihan Kurir (Hanya jika delivery) */}
                            {data.delivery_type === 'delivery' && (
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] mb-4 flex items-center">
                                        <Truck className="text-[#00C48C] mr-2" size={20} />
                                        Pilih Layanan Pengiriman
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <label className={`cursor-pointer border rounded-lg p-4 flex flex-col justify-between transition-colors ${data.delivery_provider === 'gosend' ? 'border-[#00C48C] bg-[#F0FAF6]' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <input 
                                                    type="radio" 
                                                    name="delivery_provider" 
                                                    value="gosend"
                                                    checked={data.delivery_provider === 'gosend'}
                                                    onChange={e => setData('delivery_provider', e.target.value)}
                                                    className="mt-1 text-[#00C48C] focus:ring-[#00C48C]"
                                                />
                                                <span className="font-poppins font-bold text-[#1A1A1A]">GoSend</span>
                                            </div>
                                            <div className="text-sm text-gray-500 font-inter mb-2">
                                                {isFetchingQuote ? 'Menghitung...' : `Estimasi ${deliveryQuote?.estimated_minutes || 0} menit`}
                                            </div>
                                            <div className="font-semibold text-[#00C48C]">{isFetchingQuote ? '...' : rupiah(actualDeliveryFee)}</div>
                                        </label>
                                        
                                        <label className={`cursor-pointer border rounded-lg p-4 flex flex-col justify-between transition-colors ${data.delivery_provider === 'grabexpress' ? 'border-[#00C48C] bg-[#F0FAF6]' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <input 
                                                    type="radio" 
                                                    name="delivery_provider" 
                                                    value="grabexpress"
                                                    checked={data.delivery_provider === 'grabexpress'}
                                                    onChange={e => setData('delivery_provider', e.target.value)}
                                                    className="mt-1 text-[#00C48C] focus:ring-[#00C48C]"
                                                />
                                                <span className="font-poppins font-bold text-[#1A1A1A]">GrabExpress</span>
                                            </div>
                                            <div className="text-sm text-gray-500 font-inter mb-2">
                                                {isFetchingQuote ? 'Menghitung...' : `Estimasi ${Math.max(1, (deliveryQuote?.estimated_minutes || 0) - 5)} menit`}
                                            </div>
                                            <div className="font-semibold text-[#00C48C]">{isFetchingQuote ? '...' : rupiah(actualDeliveryFee)}</div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Metode Pembayaran */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] mb-4 flex items-center">
                                    <Wallet className="text-[#00C48C] mr-2" size={20} />
                                    Metode Pembayaran
                                </h3>
                                <div className="space-y-3">
                                    <label className={`cursor-pointer border rounded-lg p-4 flex items-center transition-colors ${data.payment_method === 'qris' ? 'border-[#00C48C] bg-[#F0FAF6]' : 'border-gray-200'}`}>
                                        <input 
                                            type="radio" 
                                            name="payment_method" 
                                            value="qris"
                                            checked={data.payment_method === 'qris'}
                                            onChange={e => setData('payment_method', e.target.value)}
                                            className="text-[#00C48C] focus:ring-[#00C48C]"
                                        />
                                        <span className="ml-3 font-poppins font-semibold text-[#1A1A1A]">QRIS Statis</span>
                                    </label>

                                    <label className={`cursor-pointer border rounded-lg p-4 flex items-center transition-colors ${data.payment_method === 'cash' ? 'border-[#00C48C] bg-[#F0FAF6]' : 'border-gray-200'}`}>
                                        <input 
                                            type="radio" 
                                            name="payment_method" 
                                            value="manual_transfer"
                                            checked={data.payment_method === 'manual_transfer'}
                                            onChange={e => setData('payment_method', e.target.value)}
                                            className="text-[#00C48C] focus:ring-[#00C48C]"
                                        />
                                        <span className="ml-3 font-poppins font-semibold text-[#1A1A1A]">Transfer Manual (Upload Bukti)</span>
                                    </label>
                                </div>

                                {/* Placeholder QR Code */}
                                {data.payment_method === 'qris' && (
                                    <div className="mt-4 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                        <div className="w-48 h-48 bg-gray-200 mx-auto mb-4 rounded-md flex items-center justify-center border-2 border-dashed border-gray-400">
                                            <span className="text-gray-500 font-inter text-sm">QR Code Merchant<br/>(Akan Tampil Disini)</span>
                                        </div>
                                        <p className="text-sm text-gray-600 font-inter">Silakan scan kode QR di atas untuk melakukan pembayaran. Bukti transfer dapat diunggah setelah pesanan dibuat.</p>
                                    </div>
                                )}

                                {data.payment_method === 'manual_transfer' && (
                                    <div className="mt-4 p-6 bg-[#F0FAF6] border border-[#00C48C] rounded-lg">
                                        <h4 className="font-poppins font-semibold text-[#1A1A1A] mb-2">Informasi Transfer</h4>
                                        <p className="text-sm text-gray-600 font-inter mb-2">Silakan transfer ke rekening berikut:</p>
                                        <div className="bg-white p-3 rounded border border-gray-200 text-sm font-mono mb-3">
                                            BANK BCA: 1234567890<br/>
                                            A/N: EWWON COCO
                                        </div>
                                        <p className="text-xs text-gray-500 font-inter italic">Catatan: Pesanan akan diproses setelah bukti transfer dikonfirmasi oleh admin.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ringkasan Kanan */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm sticky top-28">
                                <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] mb-4">Ringkasan Pesanan</h3>
                                
                                <div className="space-y-3 mb-4">
                                    {items.map(item => {
                                        const sumToppings = (item.customizations || []).reduce((s, c) => s + Number(c.price), 0);
                                        const itemTotal = (Number(item.product.price) + sumToppings) * item.quantity;
                                        const itemKey = item.product.id + '-' + (item.customizations || []).map(c => c.id).sort().join(',');
                                        return (
                                            <div key={itemKey} className="flex flex-col text-sm font-inter">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 truncate mr-2">{item.quantity}x {item.product.name}</span>
                                                    <span className="font-medium text-[#1A1A1A] flex-shrink-0">{rupiah(itemTotal)}</span>
                                                </div>
                                                {item.customizations && item.customizations.length > 0 && (
                                                    <div className="text-[11px] text-gray-400 font-inter pl-4">
                                                        {item.customizations.map(c => c.name).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {freeBogoItems.map((freeItem, idx) => (
                                        <div key={`free-${freeItem.product.id}`} className="flex flex-col text-sm font-inter bg-green-50/50 p-2.5 rounded-xl border border-dashed border-green-200">
                                            <div className="flex justify-between">
                                                <span className="text-green-700 font-semibold truncate mr-2">
                                                    {freeItem.quantity}x {freeItem.product.name} (Gratis BOGO)
                                                </span>
                                                <span className="font-medium text-green-700 flex-shrink-0">Rp 0</span>
                                            </div>
                                            <div className="text-[10px] text-green-600 font-medium mt-0.5">
                                                Promo: {freeItem.promoName}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-200 pt-4 space-y-2 mb-4 text-sm font-inter">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{rupiah(getTotal())}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{data.delivery_type === 'pickup' ? 'Biaya Pengambilan' : `Ongkos Kirim (${deliveryQuote?.distance} km)`}</span>
                                        <span className={`font-medium ${data.delivery_type === 'pickup' ? 'text-[#00C48C]' : 'text-red-500'}`}>
                                            {data.delivery_type === 'pickup' ? 'GRATIS' : `+${rupiah(actualDeliveryFee)}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="font-poppins font-semibold text-[#1A1A1A]">Total Bayar</span>
                                        <span className="font-poppins font-bold text-xl text-[#00C48C]">{rupiah(finalTotal)}</span>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={processing || items.length === 0}
                                    className="w-full flex items-center justify-center bg-[#00C48C] hover:bg-[#00a878] disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-semibold transition-colors"
                                >
                                    <CheckCircle size={18} className="mr-2" /> Konfirmasi Pesanan
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </LandingLayout>
    );
}
