import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Merchant, Product, PageProps } from '../../types';
import LandingLayout from '@/Layouts/LandingLayout';
import ProductCard from '../../Components/Customer/ProductCard';
import CartDrawer from '../../Components/Customer/CartDrawer';
import { MapPin, Clock, Phone, ChevronLeft } from 'lucide-react';

interface MerchantDetailProps extends PageProps {
    merchant: Merchant;
    products: Product[];
}

export default function MerchantDetail({ merchant, products }: MerchantDetailProps) {
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <LandingLayout>
            <Head title={`${merchant.name} - EWWON COCO`} />
            
            <div className="bg-white min-h-screen pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/shop" className="inline-flex items-center text-[#00C48C] hover:text-[#00a878] font-medium mb-6 transition-colors">
                        <ChevronLeft size={20} className="mr-1" />
                        Kembali ke Belanja
                    </Link>

                    {/* Merchant Header */}
                    <div className="bg-[#1A1A1A] rounded-xl p-8 text-white mb-10 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="inline-block px-3 py-1 bg-[#FF8A00] rounded-full text-xs font-bold mb-4">
                                {merchant.category}
                            </div>
                            <h1 className="font-poppins font-bold text-4xl mb-4">{merchant.name}</h1>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300 font-inter mt-6 border-t border-gray-700 pt-6">
                                <div className="flex items-start">
                                    <MapPin size={18} className="mr-2 text-[#00C48C] flex-shrink-0 mt-0.5" />
                                    <span>{merchant.address}</span>
                                </div>
                                <div className="flex items-start">
                                    <Clock size={18} className="mr-2 text-[#00C48C] flex-shrink-0 mt-0.5" />
                                    <span>Buka Setiap Hari</span>
                                </div>
                                <div className="flex items-start">
                                    <Phone size={18} className="mr-2 text-[#00C48C] flex-shrink-0 mt-0.5" />
                                    <span>{merchant.phone}</span>
                                </div>
                            </div>
                        </div>
                        {/* Decorative blob */}
                        <div className="absolute -right-20 -bottom-40 w-96 h-96 bg-[#00C48C] rounded-full opacity-20 blur-3xl"></div>
                    </div>

                    {/* Products Grid */}
                    <div className="mb-8">
                        <h2 className="font-poppins font-semibold text-2xl text-[#1A1A1A] mb-6">Produk Kami</h2>
                        {products.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 font-inter">Toko ini belum memiliki produk aktif.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </LandingLayout>
    );
}
