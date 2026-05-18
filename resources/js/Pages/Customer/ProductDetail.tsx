import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Product, PageProps } from '../../types';
import LandingLayout from '@/Layouts/LandingLayout';
import { useCartStore } from '../../store/useCartStore';
import { rupiah } from '../../lib/format';
import { ChevronLeft, ShoppingCart, ShieldCheck, Truck, RefreshCcw, Store, MessageCircle } from 'lucide-react';
import CartDrawer from '../../Components/Customer/CartDrawer';

interface ProductDetailProps extends PageProps {
    product: Product;
    reviews: any[];
    avgRating: number;
    reviewCount: number;
}

export default function ProductDetail({ product, reviews, avgRating, reviewCount }: ProductDetailProps) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = () => {
        addItem(product, quantity);
        setIsCartOpen(true);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex text-[#FF8A00]">
                {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={s <= rating ? 'opacity-100' : 'opacity-20'}>★</span>
                ))}
            </div>
        );
    };

    return (
        <LandingLayout>
            <Head title={`${product.name} - EWWON COCO`} />
            
            <div className="bg-white min-h-screen pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/shop" className="inline-flex items-center text-[#00C48C] hover:text-[#00a878] font-medium mb-8 transition-colors group">
                        <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Belanja
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                        {/* Image Section */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 aspect-square rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                                {(() => {
                                    let displayImg = product.image_url;
                                    if (!displayImg) {
                                        if (product.name.includes('Original')) displayImg = '/coconut_original.png';
                                        else if (product.name.includes('Jeruk')) displayImg = '/coconut_lime.png';
                                        else if (product.name.includes('Puding')) displayImg = '/coconut_pudding.png';
                                    }
                                    
                                    return displayImg ? (
                                        <img 
                                            src={displayImg} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-lg font-inter">Foto Produk</span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex flex-col">
                            {product.category && (
                                <span className="inline-block self-start px-3 py-1 bg-[#F0FAF6] text-[#00C48C] rounded-full text-xs font-bold mb-4">
                                    {product.category.name}
                                </span>
                            )}
                            <h1 className="font-poppins font-bold text-4xl text-[#1A1A1A] mb-2">{product.name}</h1>
                            
                            <div className="flex items-center space-x-3 mb-6">
                                {renderStars(avgRating)}
                                <span className="text-sm font-bold text-charcoal">{avgRating}</span>
                                <span className="text-sm text-gray-400 font-medium">({reviewCount} ulasan)</span>
                            </div>

                            <div className="flex items-center space-x-2 mb-6">
                                <span className="font-poppins font-bold text-3xl text-[#00C48C]">
                                    {rupiah(product.price)}
                                </span>
                                {product.stock > 0 ? (
                                    <span className="text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                        Tersedia ({product.stock} stok)
                                    </span>
                                ) : (
                                    <span className="text-sm text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                        Stok Habis
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-600 font-inter leading-relaxed mb-8">
                                {product.description || 'Produk berkualitas dari EWWON COCO. Segera pesan sebelum kehabisan!'}
                            </p>

                            {/* Merchant Info Card */}
                            {product.merchant && (
                                <Link 
                                    href={`/shop/${product.merchant.slug}`}
                                    className="flex items-center p-4 bg-gray-50 border border-gray-100 rounded-xl mb-8 hover:border-[#00C48C] transition-all"
                                >
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-[#FF8A00] mr-4 shadow-sm">
                                        <Store size={24} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Dijual oleh</div>
                                        <div className="font-poppins font-semibold text-[#1A1A1A]">{product.merchant.name}</div>
                                    </div>
                                </Link>
                            )}

                            {/* Add to Cart Actions */}
                            <div className="mt-auto space-y-4 pt-8 border-t border-gray-100">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg p-1">
                                        <button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-2 text-gray-500 hover:text-black transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center font-bold text-[#1A1A1A]">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="px-4 py-2 text-gray-500 hover:text-black transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleAddToCart}
                                        disabled={product.stock <= 0}
                                        className="flex-1 bg-[#00C48C] hover:bg-[#00a878] disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center shadow-md shadow-green-100"
                                    >
                                        <ShoppingCart size={20} className="mr-2" />
                                        Tambah ke Keranjang
                                    </button>
                                    <Link 
                                        href={route('chat.open', product.merchant_id)}
                                        className="p-4 bg-white border border-gray-200 text-charcoal hover:text-[#00C48C] hover:border-[#00C48C] rounded-lg transition-all flex items-center justify-center shadow-sm"
                                        title="Chat dengan Penjual"
                                    >
                                        <MessageCircle size={24} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="border-t border-gray-100 pt-16">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="font-poppins font-bold text-2xl text-charcoal">Ulasan Pelanggan</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {reviews.length > 0 ? reviews.map((review) => (
                                <div key={review.id} className="bg-gray-50 p-6 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center font-bold text-[#00C48C]">
                                                {review.customer?.avatar_url ? (
                                                    <img src={review.customer.avatar_url} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    review.customer?.name?.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-charcoal">{review.customer?.name}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">{new Date(review.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        {renderStars(review.rating)}
                                    </div>
                                    <p className="text-sm text-gray-600 font-inter italic">
                                        "{review.comment || 'Puas dengan produk ini!'}"
                                    </p>
                                </div>
                            )) : (
                                <div className="col-span-2 py-20 text-center text-gray-400 italic">
                                    Belum ada ulasan untuk produk ini.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </LandingLayout>
    );
}

