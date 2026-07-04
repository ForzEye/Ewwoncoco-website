import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ChevronLeft, 
    Upload, 
    Check, 
    AlertCircle,
    Info,
    X,
    Plus,
    Trash2,
    UtensilsCrossed
} from 'lucide-react';
import { ProductCategory } from '../../../types';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
}

interface CreateProps {
    categories: ProductCategory[];
    ingredients: Ingredient[];
}

export default function Create({ categories, ingredients }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: null as File | null,
        recipes: [] as { ingredient_id: string; quantity: string }[],
        price_options: [] as { id: string; name: string; price: string; multiplier: string }[],
    });

    const [hasMultiplePricing, setHasMultiplePricing] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const addPriceOption = () => {
        setData('price_options', [
            ...data.price_options,
            { id: Math.random().toString(36).substring(2, 9), name: '', price: '', multiplier: '1' }
        ]);
    };

    const removePriceOption = (index: number) => {
        const newOptions = [...data.price_options];
        newOptions.splice(index, 1);
        setData('price_options', newOptions);
    };

    const updatePriceOption = (index: number, field: 'name' | 'price' | 'multiplier', value: string) => {
        const newOptions = [...data.price_options];
        newOptions[index][field] = value;
        setData('price_options', newOptions);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const addRecipeItem = () => {
        setData('recipes', [...data.recipes, { ingredient_id: '', quantity: '' }]);
    };

    const removeRecipeItem = (index: number) => {
        const newRecipes = [...data.recipes];
        newRecipes.splice(index, 1);
        setData('recipes', newRecipes);
    };

    const updateRecipeItem = (index: number, field: 'ingredient_id' | 'quantity', value: string) => {
        const newRecipes = [...data.recipes];
        newRecipes[index][field] = value;
        setData('recipes', newRecipes);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (hasMultiplePricing && data.price_options.length > 0) {
            data.price = data.price_options[0].price;
        } else {
            // @ts-ignore
            data.price_options = [];
        }

        post(route('admin.products.store'), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout title="Tambah Produk Baru">
            <Head title="Tambah Produk - EWWON COCO" />
            
            <div className="max-w-5xl">
                <Link 
                    href={route('admin.products.index')}
                    className="inline-flex items-center space-x-2 text-[#A0A0A0] hover:text-[#1A1A1A] transition-colors mb-8 group"
                >
                    <div className="w-8 h-8 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center group-hover:bg-[#2D6A4F] group-hover:text-white transition-all shadow-sm">
                        <ChevronLeft size={16} strokeWidth={3} />
                    </div>
                    <span className="text-[12px] font-black uppercase tracking-wider">Batal & Kembali</span>
                </Link>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left & Middle: Main Form & Recipes */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Section 1: Info Produk */}
                        <div className="bg-white p-10 rounded-[40px] border border-[#F0F0F0] shadow-sm space-y-8">
                            <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A] flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#F0FAF6] text-[#2D6A4F] rounded-xl flex items-center justify-center text-xs">1</div>
                                Informasi Produk
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Nama Menu</label>
                                    <input 
                                        type="text" 
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Misal: Coconut Original Grande"
                                        className={`w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-sm font-bold outline-none transition-all ${errors.name ? 'border-red-300 bg-red-50' : ''}`}
                                    />
                                    {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Deskripsi Singkat</label>
                                    <textarea 
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Jelaskan keunikan rasa produk ini..."
                                        className="w-full px-7 py-5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-sm font-bold outline-none transition-all min-h-[140px] resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Harga & Inventori */}
                        <div className="bg-white p-10 rounded-[40px] border border-[#F0F0F0] shadow-sm space-y-8">
                            <div className="flex items-center justify-between pb-4 border-b border-[#F8F8F8]">
                                <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A] flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xs">2</div>
                                    Harga & Inventori
                                </h3>
                                <label className="flex items-center space-x-3 cursor-pointer select-none">
                                    <input 
                                        type="checkbox"
                                        checked={hasMultiplePricing}
                                        onChange={e => {
                                            setHasMultiplePricing(e.target.checked);
                                            if (e.target.checked && data.price_options.length === 0) {
                                                setData('price_options', [
                                                    { id: Math.random().toString(36).substring(2, 9), name: 'Pcs', price: data.price, multiplier: '1' }
                                                ]);
                                            }
                                        }}
                                        className="rounded border-[#E8E8E8] text-[#2D6A4F] focus:ring-[#2D6A4F]/20 w-5 h-5"
                                    />
                                    <span className="text-[11px] font-black uppercase tracking-wider text-[#1A1A1A]">Pilihan Harga Ganda (Pcs / Kg)</span>
                                </label>
                            </div>
                            
                            {!hasMultiplePricing ? (
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Harga Satuan</label>
                                        <div className="relative group">
                                            <span className="absolute left-7 top-1/2 -translate-y-1/2 text-[#B5AFA6] font-black text-[13px] group-focus-within:text-[#2D6A4F] transition-colors">Rp</span>
                                            <input 
                                                type="number" 
                                                value={data.price}
                                                onChange={e => setData('price', e.target.value)}
                                                placeholder="0"
                                                className={`w-full pl-16 pr-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[15px] font-black outline-none transition-all ${errors.price ? 'border-red-300' : ''}`}
                                            />
                                        </div>
                                        {errors.price && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.price}</p>}
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Stok Awal</label>
                                        <input 
                                            type="number" 
                                            value={data.stock}
                                            onChange={e => setData('stock', e.target.value)}
                                            placeholder="0"
                                            className={`w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[15px] font-black outline-none transition-all ${errors.stock ? 'border-red-300' : ''}`}
                                        />
                                        {errors.stock && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.stock}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Daftar Pilihan Satuan & Harga</span>
                                        <button 
                                            type="button"
                                            onClick={addPriceOption}
                                            className="px-3 py-1.5 bg-[#2D6A4F] text-white text-[9px] font-black rounded-lg hover:bg-[#1B4332] transition-all flex items-center gap-1"
                                        >
                                            <Plus size={12} /> TAMBAH PILIHAN
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {data.price_options.map((opt, idx) => (
                                            <div key={opt.id} className="flex items-center gap-3 bg-[#F9F9F9] p-4 rounded-2xl border border-[#F0F0F0] animate-in slide-in-from-right-1 duration-200">
                                                <div className="flex-1 grid grid-cols-12 gap-3">
                                                    <div className="col-span-4 space-y-1.5">
                                                        <label className="text-[9px] font-black text-[#B5AFA6] uppercase tracking-wider ml-1">Nama Satuan</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="Misal: Pcs, Kg, Gelas"
                                                            value={opt.name}
                                                            onChange={e => updatePriceOption(idx, 'name', e.target.value)}
                                                            className="w-full px-4 py-2 bg-white border border-[#E8E8E8] rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-5 space-y-1.5">
                                                        <label className="text-[9px] font-black text-[#B5AFA6] uppercase tracking-wider ml-1">Harga (Rp)</label>
                                                        <input 
                                                            type="number"
                                                            placeholder="0"
                                                            value={opt.price}
                                                            onChange={e => updatePriceOption(idx, 'price', e.target.value)}
                                                            className="w-full px-4 py-2 bg-white border border-[#E8E8E8] rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-3 space-y-1.5">
                                                        <label className="text-[9px] font-black text-[#B5AFA6] uppercase tracking-wider ml-1">Pengali Stok</label>
                                                        <input 
                                                            type="number"
                                                            step="0.0001"
                                                            placeholder="1"
                                                            value={opt.multiplier}
                                                            onChange={e => updatePriceOption(idx, 'multiplier', e.target.value)}
                                                            className="w-full px-4 py-2 bg-white border border-[#E8E8E8] rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                {data.price_options.length > 1 && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => removePriceOption(idx)}
                                                        className="w-9 h-9 mt-4.5 flex items-center justify-center text-[#D0D0D0] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-8 pt-2">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Stok Awal (Unit Dasar)</label>
                                            <input 
                                                type="number" 
                                                value={data.stock}
                                                onChange={e => setData('stock', e.target.value)}
                                                placeholder="0"
                                                className={`w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[15px] font-black outline-none transition-all ${errors.stock ? 'border-red-300' : ''}`}
                                            />
                                            {errors.stock && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.stock}</p>}
                                            <span className="text-[9px] text-[#B5AFA6] font-medium ml-1 block">* Masukkan jumlah stok dalam unit dasar (multiplier = 1).</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Formula Resep (BOM) — SINKRONISASI BAHAN BAKU */}
                        <div className="bg-white p-10 rounded-[40px] border border-[#F0F0F0] shadow-sm space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A] flex items-center gap-3">
                                    <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-xs">3</div>
                                    Sinkronisasi Bahan Baku (Resep)
                                </h3>
                                <button 
                                    type="button"
                                    onClick={addRecipeItem}
                                    className="px-4 py-2 bg-[#2D6A4F] text-white text-[10px] font-black rounded-xl hover:bg-[#1B4332] transition-all flex items-center gap-2"
                                >
                                    <Plus size={14} /> TAMBAH BAHAN
                                </button>
                            </div>

                            <p className="text-xs text-[#B5AFA6] font-medium leading-relaxed italic">
                                * Tentukan bahan baku yang digunakan untuk menu ini. Stok bahan baku akan berkurang otomatis saat menu terjual.
                            </p>

                            <div className="space-y-4">
                                {data.recipes.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 animate-in slide-in-from-right-2 duration-300">
                                        <div className="flex-1 grid grid-cols-12 gap-4 bg-[#F9F9F9] p-4 rounded-2xl border border-[#F0F0F0]">
                                            <div className="col-span-7">
                                                <select 
                                                    className="w-full bg-white border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                                                    value={item.ingredient_id}
                                                    onChange={e => updateRecipeItem(index, 'ingredient_id', e.target.value)}
                                                >
                                                    <option value="">Pilih Bahan Baku...</option>
                                                    {ingredients.map(ing => (
                                                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-5 relative">
                                                <input 
                                                    type="number" 
                                                    step="0.0001"
                                                    placeholder="Jumlah"
                                                    className="w-full bg-white border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none pr-12"
                                                    value={item.quantity}
                                                    onChange={e => updateRecipeItem(index, 'quantity', e.target.value)}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#B5AFA6] uppercase tracking-tighter">
                                                    {ingredients.find(i => i.id.toString() === item.ingredient_id)?.unit || 'Unit'}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => removeRecipeItem(index)}
                                            className="w-12 h-12 flex items-center justify-center text-[#D0D0D0] hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}

                                {data.recipes.length === 0 && (
                                    <div className="py-10 border-2 border-dashed border-[#F0F0F0] rounded-[32px] flex flex-col items-center justify-center text-[#D0D0D0]">
                                        <UtensilsCrossed size={32} className="mb-3 opacity-20" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-center">Belum ada bahan baku ditambahkan.<br/>Klik tombol di atas untuk sinkronisasi stok.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Media & Category */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm space-y-6 sticky top-8">
                            <h3 className="font-poppins font-black text-[15px] text-[#1A1A1A] uppercase tracking-tighter ml-1">Visual Produk</h3>
                            <div className="relative aspect-square w-full bg-[#F9F9F9] rounded-[32px] border-2 border-dashed border-[#E8E8E8] flex flex-col items-center justify-center overflow-hidden group hover:border-[#2D6A4F] hover:bg-white transition-all cursor-pointer">
                                {preview ? (
                                    <>
                                        <img src={preview} className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => { setPreview(null); setData('image', null); }}
                                            className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur shadow-md rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <input 
                                            type="file" 
                                            onChange={handleImageChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                        />
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#B5AFA6] group-hover:text-[#2D6A4F] group-hover:scale-110 transition-all mb-3">
                                            <Upload size={20} />
                                        </div>
                                        <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] text-center px-6 leading-relaxed">Format JPG/PNG<br/>Maksimal 2MB</span>
                                    </>
                                )}
                            </div>
                            {errors.image && <p className="text-[10px] font-bold text-red-500 text-center">{errors.image}</p>}

                            <div className="pt-4 border-t border-[#F8F8F8] space-y-6">
                                <h3 className="font-poppins font-black text-[15px] text-[#1A1A1A] uppercase tracking-tighter ml-1">Kategori</h3>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {categories.map((cat) => (
                                        <label key={cat.id} className="relative group cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="category_id" 
                                                value={cat.id}
                                                checked={data.category_id == cat.id.toString()}
                                                onChange={e => setData('category_id', e.target.value)}
                                                className="peer absolute opacity-0" 
                                            />
                                            <div className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-2xl border-2 border-transparent peer-checked:border-[#2D6A4F]/30 peer-checked:bg-[#F0FAF6] peer-checked:text-[#2D6A4F] transition-all group-hover:bg-[#F0F0F0]">
                                                <span className="text-[12px] font-black">{cat.name}</span>
                                                <div className="w-4 h-4 rounded-full border-2 border-[#E8E8E8] peer-checked:border-[#2D6A4F] flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.category_id && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.category_id}</p>}
                            </div>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#1A1A1A] hover:bg-[#2D6A4F] text-white font-black py-6 rounded-[32px] shadow-xl shadow-gray-200 transition-all flex items-center justify-center space-x-3 group disabled:opacity-50"
                            >
                                <Check size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                                <span className="uppercase tracking-[0.2em] text-[13px]">Publikasikan Menu</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
