import React from 'react';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { rupiah } from '../../lib/format';
import { ShoppingCart } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden group">
            {/* Image Placeholder */}
            <div className="bg-gray-100 aspect-square w-full relative flex items-center justify-center overflow-hidden">
                <Link href={`/products/${product.slug}`} className="w-full h-full">
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
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium bg-gray-100">No Image</div>
                        );
                    })()}
                </Link>
                {product.category && (
                    <span className="absolute top-2 left-2 bg-[#FF8A00] text-white text-xs font-semibold px-2 py-1 rounded-md">
                        {product.category.name}
                    </span>
                )}
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
                <Link href={`/products/${product.slug}`}>
                    <h4 className="font-poppins font-semibold text-[16px] text-[#1A1A1A] mb-1 line-clamp-2 hover:text-[#00C48C] transition-colors">
                        {product.name}
                    </h4>
                </Link>
                <p className="font-inter text-sm text-gray-500 mb-3 flex-grow line-clamp-2">
                    {product.description || 'Tidak ada deskripsi'}
                </p>
                <div className="flex items-end justify-between mt-auto">
                    <div>
                        <span className="font-poppins font-bold text-[#00C48C] text-lg block">
                            {rupiah(product.price)}
                        </span>
                        <span className="text-xs text-gray-400 mt-1 block">
                            Sisa stok: {product.stock}
                        </span>
                    </div>
                    <button
                        onClick={() => addItem(product, 1)}
                        disabled={!product.is_available || product.stock <= 0}
                        className="bg-[#00C48C] hover:bg-[#00a878] disabled:bg-gray-300 text-white p-2 rounded-md transition-colors flex items-center justify-center"
                        title="Tambah ke Keranjang"
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
