import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { rupiah } from '../../lib/format';
import { ShoppingCart } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function TopSelling() {
    const { auth } = usePage<PageProps>().props;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products/top-selling')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    return (
        <section id="top-selling" className="section-py bg-gray-50 border-t border-border-base">
            <div className="container-max section-px">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="max-w-2xl">
                        <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Menu Favorit</h2>
                        <h3 className="text-3xl md:text-4xl font-heading font-bold text-charcoal">
                            Paling Banyak Dipesan
                        </h3>
                    </div>
                    <Link href={route('shop')} className="btn-outline shrink-0">
                        Lihat Semua Menu
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card p-4 animate-pulse flex flex-col gap-4">
                                <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-10 bg-gray-200 rounded w-10"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="card group overflow-hidden flex flex-col bg-white border border-gray-100 hover:shadow-2xl hover:shadow-green-100/50 transition-all duration-500">
                                <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
                                    <Link href={`/products/${product.slug}`} className="block w-full h-full">
                                        {product.image_url ? (
                                            <img 
                                                src={product.image_url} 
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl">
                                                {product.name.toLowerCase().includes('puding') ? '🍮' : '🥥'}
                                            </div>
                                        )}
                                    </Link>
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                        <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Favorit</span>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <Link href={`/products/${product.slug}`}>
                                        <h4 className="font-heading font-black text-xl text-charcoal mb-3 group-hover:text-primary transition-colors">
                                            {product.name}
                                        </h4>
                                    </Link>
                                    <p className="text-sm text-gray-muted leading-relaxed line-clamp-2 mb-8 flex-1">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="font-bold text-primary text-xl">
                                            {rupiah(product.price)}
                                        </span>
                                        <Link 
                                            href={auth.user ? route('shop') : route('login')}
                                            className="w-10 h-10 rounded-lg bg-gray-100 text-charcoal hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                                            title="Pesan Sekarang"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
