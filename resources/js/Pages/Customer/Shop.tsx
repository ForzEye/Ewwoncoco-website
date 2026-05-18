import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Merchant, Product, PageProps } from '../../types';
import LandingLayout from '@/Layouts/LandingLayout';
import ProductCard from '../../Components/Customer/ProductCard';
import CartDrawer from '../../Components/Customer/CartDrawer';
import { Search, Store } from 'lucide-react';

interface ShopProps extends PageProps {
    merchants: Merchant[];
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        // ... pagination props
    };
}

export default function Shop({ merchants, products }: ShopProps) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.data.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <LandingLayout>
            <Head title="Belanja Online - EWWON COCO" />
            
            <div className="bg-white min-h-screen pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header & Search */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="font-poppins font-bold text-3xl text-[#1A1A1A]">Belanja</h1>
                            <p className="text-gray-500 font-inter mt-1">Temukan produk terbaik dari berbagai toko kami</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <input 
                                type="text"
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#00C48C] focus:border-[#00C48C] outline-none"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar: Merchants */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 sticky top-28">
                                <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] mb-4 flex items-center">
                                    <Store size={20} className="mr-2 text-[#FF8A00]" />
                                    Daftar Toko
                                </h3>
                                <div className="space-y-3">
                                    {merchants.map(merchant => (
                                        <a 
                                            key={merchant.id} 
                                            href={`/shop/${merchant.slug}`}
                                            className="block p-3 bg-white rounded border border-gray-200 hover:border-[#00C48C] transition-colors"
                                        >
                                            <div className="font-medium text-[#1A1A1A]">{merchant.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">{merchant.category}</div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content: Products */}
                        <div className="lg:col-span-3">
                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <p className="text-gray-500 font-inter">Tidak ada produk yang ditemukan.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {filteredProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Floating Cart Button (Mobile) */}
            <button 
                onClick={() => setIsCartOpen(true)}
                className="fixed bottom-6 right-6 lg:hidden bg-[#00C48C] text-white p-4 rounded-full shadow-lg z-30"
            >
                <Store size={24} />
            </button>
        </LandingLayout>
    );
}
