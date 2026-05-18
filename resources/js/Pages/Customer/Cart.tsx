import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import { useCartStore } from '../../store/useCartStore';
import { rupiah } from '../../lib/format';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Cart() {
    const { items, updateQuantity, removeItem, getTotal } = useCartStore();
    const [voucherCode, setVoucherCode] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <LandingLayout>
            <Head title="Keranjang Belanja - EWWON COCO" />
            
            <div className="bg-white min-h-screen pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-poppins font-bold text-3xl text-[#1A1A1A] mb-8">Keranjang Belanja</h1>

                    {items.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
                            <h2 className="font-poppins font-semibold text-xl text-[#1A1A1A] mb-2">Keranjang Anda kosong</h2>
                            <p className="text-gray-500 font-inter mb-6">Mulai belanja dan temukan produk terbaik untuk Anda.</p>
                            <Link href="/shop" className="bg-[#00C48C] hover:bg-[#00a878] text-white px-6 py-3 rounded-md font-semibold transition-colors">
                                Mulai Belanja
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Item List */}
                            <div className="lg:col-span-2 space-y-4">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex flex-col sm:flex-row gap-4 bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            {item.product.image_url ? (
                                                <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] line-clamp-2">
                                                        {item.product.name}
                                                    </h3>
                                                    <button 
                                                        onClick={() => removeItem(item.product.id)}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                                <div className="text-[#00C48C] font-bold text-lg mt-1">
                                                    {rupiah(item.product.price)}
                                                </div>
                                            </div>
                                            <div className="flex items-center mt-4 sm:mt-0">
                                                <span className="text-sm text-gray-500 font-inter mr-4">Kuantitas:</span>
                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                    <button 
                                                        onClick={() => {
                                                            if (item.quantity > 1) updateQuantity(item.product.id, item.quantity - 1);
                                                        }}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="px-3 py-1 text-sm font-medium w-10 text-center border-l border-r border-gray-300">
                                                        {item.quantity}
                                                    </span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-28">
                                    <h3 className="font-poppins font-semibold text-xl text-[#1A1A1A] mb-4">Ringkasan Belanja</h3>
                                    
                                    <div className="flex justify-between items-center mb-4 text-sm font-inter">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-semibold text-[#1A1A1A]">{rupiah(getTotal())}</span>
                                    </div>

                                    {/* Voucher Input */}
                                    <div className="mb-6 border-t border-b border-gray-200 py-4 mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Punya kode promo?</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={voucherCode}
                                                onChange={(e) => setVoucherCode(e.target.value)}
                                                placeholder="Masukkan kode voucher"
                                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#00C48C] focus:border-[#00C48C] outline-none"
                                            />
                                            <button className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">
                                                Terapkan
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-6">
                                        <span className="font-poppins font-semibold text-[#1A1A1A]">Total Akhir</span>
                                        <span className="font-poppins font-bold text-2xl text-[#00C48C]">{rupiah(getTotal())}</span>
                                    </div>

                                    <button 
                                        onClick={() => router.visit('/checkout')}
                                        className="w-full flex items-center justify-center bg-[#00C48C] hover:bg-[#00a878] text-white py-3 px-4 rounded-md font-semibold transition-colors"
                                    >
                                        Lanjut ke Pembayaran <ArrowRight size={18} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </LandingLayout>
    );
}
