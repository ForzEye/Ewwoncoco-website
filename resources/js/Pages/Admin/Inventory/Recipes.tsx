import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { qty } from '../../../lib/format';
import { 
    Plus, 
    Trash2, 
    Search, 
    X,
    CheckCircle2,
    UtensilsCrossed,
    ChefHat,
    ChevronDown,
    ChevronUp,
    Info
} from 'lucide-react';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
}

interface Recipe {
    id: number;
    product_id: number;
    ingredient_id: number;
    quantity: number;
    ingredient: Ingredient;
}

interface Product {
    id: number;
    name: string;
    image_url: string;
    price: number;
    category: { name: string };
    recipes: Recipe[];
}

interface RecipesProps {
    products: Product[];
    ingredients: Ingredient[];
}

export default function Recipes({ products, ingredients }: RecipesProps) {
    const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, delete: destroy, processing, reset, errors } = useForm({
        product_id: '',
        ingredient_id: '',
        quantity: '',
    });

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleExpand = (productId: number) => {
        setExpandedProduct(expandedProduct === productId ? null : productId);
    };

    const openAddModal = (product: Product) => {
        setSelectedProduct(product);
        setData('product_id', product.id.toString());
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.inventory.recipes.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset('ingredient_id', 'quantity');
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus bahan ini dari resep?')) {
            destroy(route('admin.inventory.recipes.destroy', id));
        }
    };

    return (
        <AdminLayout title="Manajemen Resep (BOM)">
            <Head title="Resep Produk - EWWON COCO" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-poppins font-black text-[#1A1A1A] tracking-tight">Formula & Resep</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Tentukan bahan baku untuk setiap menu untuk pemotongan stok otomatis.</p>
                    </div>
                    <div className="bg-blue-50 px-5 py-3 rounded-2xl flex items-center gap-3 border border-blue-100">
                        <Info size={18} className="text-blue-500" />
                        <p className="text-[10px] font-bold text-blue-700 leading-tight">
                            Stok bahan baku akan terpotong secara otomatis<br/>setiap kali produk ini terjual di POS/Online.
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-3xl border border-[#F0F0F0] shadow-sm flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Cari nama menu / produk..."
                            className="w-full pl-12 pr-4 py-3 bg-[#F5F3EF]/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Product List */}
                <div className="space-y-4">
                    {filteredProducts.map((product) => (
                        <div 
                            key={product.id} 
                            className={`bg-white rounded-[32px] border border-[#F0F0F0] overflow-hidden transition-all duration-300 ${expandedProduct === product.id ? 'shadow-xl ring-2 ring-[#2D6A4F]/10' : 'hover:shadow-md'}`}
                        >
                            <div 
                                className="p-6 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleExpand(product.id)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#F5F3EF]">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ChefHat size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-poppins font-black text-[#1A1A1A]">{product.name}</h3>
                                        <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest mt-0.5">
                                            {product.category?.name || 'Uncategorized'} • {product.recipes.length} Bahan Baku
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openAddModal(product); }}
                                        className="bg-[#2D6A4F] text-white px-5 py-2.5 rounded-xl font-bold text-[10px] flex items-center gap-2 hover:bg-[#1B4332] transition-all shadow-md shadow-[#2D6A4F]/20"
                                    >
                                        <Plus size={14} /> TAMBAH BAHAN
                                    </button>
                                    <div className="w-10 h-10 bg-[#F5F3EF] rounded-xl flex items-center justify-center text-gray-400">
                                        {expandedProduct === product.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {expandedProduct === product.id && (
                                <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                                    <div className="bg-[#FAFAF8] rounded-[24px] border border-[#F0F0F0] overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="border-b border-[#F0F0F0]">
                                                <tr className="text-[9px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">
                                                    <th className="px-6 py-4 text-center w-16">#</th>
                                                    <th className="px-6 py-4">Bahan Baku</th>
                                                    <th className="px-6 py-4 text-center">Jumlah Konsumsi</th>
                                                    <th className="px-6 py-4 text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#F0F0F0]">
                                                {product.recipes.map((recipe, idx) => (
                                                    <tr key={recipe.id} className="hover:bg-white transition-all">
                                                        <td className="px-6 py-4 text-center font-bold text-gray-400 text-xs">{idx + 1}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-white border border-[#F0F0F0] rounded-lg flex items-center justify-center text-[#2D6A4F]">
                                                                    <UtensilsCrossed size={14} />
                                                                </div>
                                                                <span className="font-bold text-[#1A1A1A] text-sm">{recipe.ingredient.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="font-mono font-black text-[#2D6A4F]">{qty(recipe.quantity)}</span>
                                                            <span className="text-[10px] font-black text-gray-400 ml-1.5 uppercase tracking-tighter">{recipe.ingredient.unit}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button 
                                                                onClick={() => handleDelete(recipe.id)}
                                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {product.recipes.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-8 text-center">
                                                            <p className="text-xs text-gray-400 font-medium italic">Resep belum ditentukan. Penjualan produk ini tidak akan memotong stok bahan baku.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Add Recipe Item */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-[#F0F0F0] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#E8F5E9] text-[#2D6A4F] rounded-xl flex items-center justify-center">
                                    <Plus size={20} />
                                </div>
                                <h3 className="font-poppins font-black text-xl text-[#1A1A1A]">Tambah Bahan Resep</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#F5F3EF] rounded-2xl transition-all">
                                <X size={20} className="text-[#B5AFA6]" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="bg-[#F5F3EF] p-4 rounded-2xl mb-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0">
                                    {selectedProduct.image_url ? (
                                        <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ChefHat size={20} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest">Produk Jadi</p>
                                    <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">{selectedProduct.name}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Pilih Bahan Baku</label>
                                <select 
                                    className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none appearance-none"
                                    value={data.ingredient_id}
                                    onChange={e => setData('ingredient_id', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Bahan...</option>
                                    {ingredients.map(i => (
                                        <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Jumlah Pemakaian (per 1 unit produk)</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        step="0.0001"
                                        className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none pr-16"
                                        placeholder="0.00"
                                        value={data.quantity}
                                        onChange={e => setData('quantity', e.target.value)}
                                        required
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest">
                                            {ingredients.find(i => i.id.toString() === data.ingredient_id)?.unit || 'Unit'}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[9px] text-[#2D6A4F] font-bold mt-1 italic ml-1">* Contoh: Jika 1 Coco Shake butuh 200ml air kelapa, masukkan 200.</p>
                            </div>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="w-full py-5 bg-[#2D6A4F] text-white font-black rounded-2xl shadow-xl shadow-[#2D6A4F]/20 hover:bg-[#1B4332] transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                SIMPAN KE FORMULA
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
