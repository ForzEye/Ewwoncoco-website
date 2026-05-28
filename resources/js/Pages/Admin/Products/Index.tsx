import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Product } from '../../../types';
import { rupiah, qty, angka } from '../../../lib/format';
import { confirmAction, toastSuccess } from '../../../lib/swal';
import { Plus, Edit2, Trash2, Search, Filter, ArrowUpRight, Package, AlertTriangle, ChefHat } from 'lucide-react';

interface ProductsIndexProps {
    products: Product[];
}

export default function Index({ products = [] }: ProductsIndexProps) {
    const deleteProduct = (id: number) => {
        confirmAction(
            'Hapus Menu?',
            'Apakah Anda yakin ingin menghapus menu ini dari katalog?',
            'Ya, Hapus'
        ).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.products.destroy', id), {
                    onSuccess: () => {
                        toastSuccess('Menu berhasil dihapus!');
                    }
                });
            }
        });
    };

    return (
        <AdminLayout title="Katalog Menu">
            <Head title="Katalog Produk - EWWON COCO" />

            <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight font-poppins">Produk & Menu</h1>
                    <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-[0.2em] mt-1">Total {angka(products?.length || 0)} item dalam katalog</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D0D0D0] group-focus-within:text-[#2D6A4F] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari menu..." 
                            className="w-full lg:w-72 pl-12 pr-6 py-3.5 bg-white border border-[#F0F0F0] rounded-2xl text-[13px] font-bold focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 outline-none transition-all placeholder:text-[#D0D0D0]"
                        />
                    </div>
                    
                    <Link 
                        href={route('admin.products.create')}
                        className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-7 py-3.5 rounded-2xl text-[13px] font-black shadow-lg shadow-[#2D6A4F]/15 transition-all flex items-center gap-3 group"
                    >
                        <Plus size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                        <span className="uppercase tracking-widest">Tambah Menu</span>
                    </Link>
                </div>
            </div>

            {/* Table Container — Premium Design */}
            <div className="bg-white rounded-[40px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#F8F8F8]">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Info Produk</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Kategori</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Harga</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Stok</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F8F8F8]">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-[#FAFAFA] transition-all group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-[#F9F9F9] border border-[#F0F0F0] overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#D0D0D0]">
                                                        <Package size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-black text-[#1A1A1A] tracking-tight">{product.name}</p>
                                                <p className="text-[10px] font-bold text-[#D0D0D0] mt-0.5 tracking-wider">
                                                    SKU: {product.slug ? product.slug.split('-')[0].toUpperCase() : product.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="px-3.5 py-1.5 bg-[#F5F5F5] text-[#8A8A8A] rounded-xl text-[10px] font-black uppercase tracking-wider group-hover:bg-[#F0FAF6] group-hover:text-[#2D6A4F] transition-all">
                                            {product.category?.name || 'Umum'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <p className="text-[14px] font-black text-[#1A1A1A] tracking-tighter">{rupiah(product.price)}</p>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className={`text-[13px] font-black ${product.stock <= product.min_stock ? 'text-red-500' : 'text-[#1A1A1A]'}`}>
                                                {qty(product.stock)} <span className="text-[10px] text-[#B5AFA6] ml-0.5">unit</span>
                                            </span>
                                            {product.stock <= product.min_stock && (
                                                <div className="flex items-center gap-1 mt-1 text-red-500">
                                                    <AlertTriangle size={10} />
                                                    <span className="text-[9px] font-black uppercase tracking-tighter">Stok Limit!</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                                            product.is_available ? 'bg-[#F0FAF6] text-[#2D6A4F]' : 'bg-red-50 text-red-500'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${product.is_available ? 'bg-[#2D6A4F]' : 'bg-red-500'}`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{product.is_available ? 'Aktif' : 'Draft'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link 
                                                href={route('admin.inventory.recipes.index')} 
                                                className="w-10 h-10 flex items-center justify-center bg-white border border-[#F0F0F0] text-[#A0A0A0] hover:text-amber-500 hover:border-amber-500 rounded-xl shadow-sm transition-all"
                                                title="Kelola Resep (BOM)"
                                            >
                                                <ChefHat size={16} />
                                            </Link>
                                            <Link 
                                                href={route('admin.products.edit', product.id)}
                                                className="w-10 h-10 flex items-center justify-center bg-white border border-[#F0F0F0] text-[#A0A0A0] hover:text-[#2D6A4F] hover:border-[#2D6A4F] rounded-xl shadow-sm transition-all"
                                                title="Edit Menu"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button 
                                                onClick={() => deleteProduct(product.id)}
                                                className="w-10 h-10 flex items-center justify-center bg-white border border-[#F0F0F0] text-[#A0A0A0] hover:text-red-500 hover:border-red-500 rounded-xl shadow-sm transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {products.length === 0 && (
                    <div className="p-20 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-[#F9F9F9] rounded-[32px] flex items-center justify-center text-[#D0D0D0] mb-6">
                            <Package size={40} />
                        </div>
                        <h3 className="text-lg font-black text-[#1A1A1A]">Belum Ada Menu</h3>
                        <p className="text-xs font-bold text-[#B5AFA6] mt-2 mb-8">Mulailah dengan menambahkan produk pertama Anda.</p>
                        <Link 
                            href={route('admin.products.create')}
                            className="bg-[#2D6A4F] text-white px-8 py-3.5 rounded-2xl text-[13px] font-black shadow-lg shadow-[#2D6A4F]/15 transition-all"
                        >
                            Buat Menu Sekarang
                        </Link>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
