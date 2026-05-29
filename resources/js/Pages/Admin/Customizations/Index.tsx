import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Sliders, Plus, Edit2, Trash2, X, Check, HelpCircle, Utensils, CheckSquare, Square } from 'lucide-react';
import { rupiah } from '@/lib/format';
import { confirmAction, toastSuccess } from '@/lib/swal';

interface Product {
    id: number;
    name: string;
    price: number;
}

interface CustomizationOption {
    id: number;
    customization_id: number;
    name: string;
    price: number;
}

interface Customization {
    id: number;
    name: string;
    type: 'single' | 'multiple';
    is_required: boolean;
    is_active: boolean;
    options: CustomizationOption[];
    products: Product[];
}

interface IndexProps {
    customizations: Customization[];
    products: Product[];
}

export default function Index({ customizations, products }: IndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        type: 'single' as 'single' | 'multiple',
        is_required: 1, // 1 = true, 0 = false
        options: [{ name: '', price: '0' }] as { name: string; price: string }[],
        product_ids: [] as number[],
    });

    const handleOpenCreate = () => {
        setEditingId(null);
        reset();
        setShowModal(true);
    };

    const handleOpenEdit = (customization: Customization) => {
        setEditingId(customization.id);
        setData({
            name: customization.name,
            type: customization.type,
            is_required: customization.is_required ? 1 : 0,
            options: customization.options.map(o => ({
                name: o.name,
                price: Math.round(Number(o.price)).toString(),
            })),
            product_ids: customization.products.map(p => p.id),
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clean options and parse prices
        const payload = {
            ...data,
            is_required: data.is_required === 1,
            options: data.options.filter(o => o.name.trim() !== '').map(o => ({
                name: o.name,
                price: parseFloat(o.price) || 0,
            })),
        };

        if (editingId) {
            post(route('admin.customizations.update', editingId), {
                data: payload,
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                    toastSuccess('Kustomisasi berhasil diperbarui!');
                }
            } as any);
        } else {
            post(route('admin.customizations.store'), {
                data: payload,
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                    toastSuccess('Kustomisasi baru berhasil dibuat!');
                }
            } as any);
        }
    };

    const handleDelete = (id: number) => {
        confirmAction(
            'Hapus Kustomisasi?',
            'Apakah Anda yakin ingin menghapus grup kustomisasi ini? Opsi dan topping di dalamnya akan dihapus permanen.',
            'Ya, Hapus'
        ).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.customizations.destroy', id), {
                    onSuccess: () => {
                        toastSuccess('Kustomisasi berhasil dihapus!');
                    }
                });
            }
        });
    };

    const addOption = () => {
        setData('options', [...data.options, { name: '', price: '0' }]);
    };

    const removeOption = (index: number) => {
        if (data.options.length === 1) return;
        const newOptions = [...data.options];
        newOptions.splice(index, 1);
        setData('options', newOptions);
    };

    const updateOption = (index: number, field: 'name' | 'price', value: string) => {
        const newOptions = [...data.options];
        newOptions[index][field] = value;
        setData('options', newOptions);
    };

    const toggleProduct = (productId: number) => {
        if (data.product_ids.includes(productId)) {
            setData('product_ids', data.product_ids.filter(id => id !== productId));
        } else {
            setData('product_ids', [...data.product_ids, productId]);
        }
    };

    return (
        <AdminLayout title="Produk & Menu">
            <Head title="Kustomisasi & Topping - EWWON COCO" />
            
            <div className="space-y-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight font-poppins">Kustomisasi Topping</h2>
                        <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-[0.2em] mt-1">
                            Atur add-ons, takaran es, gula, dan topping berbayar untuk produk Anda
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleOpenCreate}
                            className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-7 py-3.5 rounded-2xl text-[13px] font-black shadow-lg shadow-[#2D6A4F]/15 transition-all flex items-center gap-3 group"
                        >
                            <Plus size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                            <span className="uppercase tracking-widest">Tambah Kustomisasi</span>
                        </button>
                    </div>
                </div>

                {/* Customizations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {customizations.map((c) => (
                        <div 
                            key={c.id} 
                            className="bg-white rounded-[40px] border border-[#F0F0F0] shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-[#2D6A4F]/5 transition-all flex flex-col justify-between"
                        >
                            <div className="p-8 space-y-6">
                                {/* Badge & Title */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#F0FAF6] text-[#2D6A4F] flex items-center justify-center">
                                            <Sliders size={20} strokeWidth={2.2} />
                                        </div>
                                        <div>
                                            <h4 className="text-[16px] font-black text-[#1A1A1A] tracking-tight">{c.name}</h4>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                                                    c.type === 'single' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                    {c.type === 'single' ? 'Pilihan Tunggal' : 'Pilihan Ganda'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                                                    c.is_required ? 'bg-[#F0FAF6] text-[#2D6A4F]' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {c.is_required ? 'Wajib' : 'Opsional'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Options and Prices List */}
                                <div className="space-y-2.5">
                                    <span className="text-[9px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Pilihan & Topping</span>
                                    <div className="bg-[#F9F9F9] border border-[#F0F0F0] rounded-2xl p-4 space-y-2 max-h-[160px] overflow-y-auto">
                                        {c.options.map((opt) => (
                                            <div key={opt.id} className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-gray-700">{opt.name}</span>
                                                <span className="font-black text-[#2D6A4F]">
                                                    {opt.price > 0 ? `+${rupiah(opt.price)}` : 'Gratis'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Connected Menus */}
                                <div className="space-y-2.5">
                                    <span className="text-[9px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Menu Terhubung</span>
                                    <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                                        {c.products.length > 0 ? (
                                            c.products.map((p) => (
                                                <span 
                                                    key={p.id} 
                                                    className="px-2.5 py-1 bg-white border border-[#E8E8E8] text-[9.5px] font-bold text-gray-600 rounded-lg"
                                                >
                                                    {p.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[9.5px] font-bold text-gray-400 italic ml-1">Belum dihubungkan ke menu apa pun</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-8 pt-4 border-t border-[#F8F8F8] flex items-center justify-between bg-gray-50/50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#B5AFA6] flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00C48C]"></div>
                                    Aktif di Apps & POS
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleOpenEdit(c)}
                                        className="w-9 h-9 flex items-center justify-center bg-white border border-[#F0F0F0] text-[#A0A0A0] hover:text-[#2D6A4F] hover:border-[#2D6A4F] rounded-xl shadow-sm transition-all"
                                    >
                                        <Edit2 size={14} strokeWidth={2.5} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(c.id)}
                                        className="w-9 h-9 flex items-center justify-center bg-white border border-[#F0F0F0] text-[#A0A0A0] hover:text-red-500 hover:border-red-500 rounded-xl shadow-sm transition-all"
                                    >
                                        <Trash2 size={14} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Dotted Create Card */}
                    <button 
                        onClick={handleOpenCreate}
                        className="bg-[#FDFDFD] rounded-[40px] border-4 border-dashed border-[#F0F0F0] flex flex-col items-center justify-center p-10 group hover:border-[#2D6A4F]/30 hover:bg-white transition-all min-h-[350px]"
                    >
                        <div className="w-16 h-16 bg-white border border-[#F0F0F0] rounded-3xl flex items-center justify-center text-[#D0D0D0] group-hover:text-[#2D6A4F] group-hover:scale-110 group-hover:rotate-6 transition-all mb-6 shadow-sm">
                            <Sliders size={32} strokeWidth={2} />
                        </div>
                        <h4 className="text-[16px] font-black text-[#1A1A1A] tracking-tight mb-2">Buat Kustomisasi Baru</h4>
                        <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-widest text-center px-4 leading-relaxed">
                            Tambah variasi topping, takaran kemanisan, atau ukuran cup
                        </p>
                    </button>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-[#F0FAF6]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#2D6A4F] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#2D6A4F]/15">
                                    <Sliders size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#1A1A1A]">
                                        {editingId ? 'Edit Kustomisasi' : 'Buat Kustomisasi Baru'}
                                    </h3>
                                    <p className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-widest">
                                        Atur add-ons takaran menu untuk pembeli
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Grup Kustomisasi Nama */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nama Grup Kustomisasi</label>
                                <input 
                                    type="text"
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#2D6A4F]/5 outline-none transition-all"
                                    placeholder="Contoh: Pilihan Topping, Pilih Level Kemanisan"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name}</p>}
                            </div>

                            {/* Tipe Pilihan & Wajib Toggle */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Tipe Pilihan</label>
                                    <select 
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#2D6A4F]/5 outline-none"
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value as any)}
                                    >
                                        <option value="single">Pilihan Tunggal (Satu Saja / Radio)</option>
                                        <option value="multiple">Pilihan Ganda (Bisa Banyak / Checkbox Toppings)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status Pengisian</label>
                                    <select 
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#2D6A4F]/5 outline-none"
                                        value={data.is_required}
                                        onChange={e => setData('is_required', parseInt(e.target.value))}
                                    >
                                        <option value={1}>Wajib Diisi oleh Pelanggan</option>
                                        <option value={0}>Opsional / Tidak Wajib</option>
                                    </select>
                                </div>
                            </div>

                            {/* Opsi & Harga Tambahan */}
                            <div className="space-y-4 pt-4 border-t border-[#F5F5F5]">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Butir Pilihan / Toppings</label>
                                    <button 
                                        type="button"
                                        onClick={addOption}
                                        className="px-3.5 py-1.5 bg-[#F0FAF6] hover:bg-[#2D6A4F] text-[#2D6A4F] hover:text-white transition-all text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1.5"
                                    >
                                        <Plus size={12} strokeWidth={3} /> Tambah Opsi
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    {data.options.map((option, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <div className="flex-1 grid grid-cols-12 gap-3 bg-[#F9F9F9] p-3.5 rounded-2xl border border-[#F0F0F0]">
                                                <div className="col-span-8">
                                                    <input 
                                                        type="text"
                                                        placeholder="Nama Opsi (misal: Grass Jelly, Less Ice)"
                                                        className="w-full bg-white border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2D6A4F]/10 px-4 py-2.5"
                                                        value={option.name}
                                                        onChange={e => updateOption(index, 'name', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-4 relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#C4C4C4]">+</span>
                                                    <input 
                                                        type="number"
                                                        placeholder="Harga"
                                                        className="w-full bg-white border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2D6A4F]/10 pl-6 pr-4 py-2.5"
                                                        value={option.price}
                                                        onChange={e => updateOption(index, 'price', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                className="w-10 h-10 flex items-center justify-center text-[#D0D0D0] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-transparent"
                                                disabled={data.options.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {errors.options && <p className="text-red-500 text-xs font-bold">{errors.options}</p>}
                            </div>

                            {/* Hubungkan Ke Menu/Produk */}
                            <div className="space-y-4 pt-4 border-t border-[#F5F5F5]">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    Terapkan Pada Menu (Hubungkan Produk)
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto p-1.5">
                                    {products.map((prod) => {
                                        const isSelected = data.product_ids.includes(prod.id);
                                        return (
                                            <div 
                                                key={prod.id}
                                                onClick={() => toggleProduct(prod.id)}
                                                className={`flex items-center justify-between p-4 bg-[#F9F9F9] rounded-2xl border-2 transition-all cursor-pointer ${
                                                    isSelected ? 'border-[#2D6A4F]/30 bg-[#F0FAF6] text-[#2D6A4F]' : 'border-transparent hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Utensils size={14} className={isSelected ? 'text-[#2D6A4F]' : 'text-gray-400'} />
                                                    <span className="text-xs font-black">{prod.name}</span>
                                                </div>
                                                <div>
                                                    {isSelected ? (
                                                        <CheckSquare size={16} strokeWidth={2.5} />
                                                    ) : (
                                                        <Square size={16} className="text-gray-300" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions buttons */}
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl text-[13px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className="flex-[2] py-4 bg-[#2D6A4F] text-white font-black rounded-2xl text-[13px] uppercase tracking-widest hover:bg-[#1B4332] transition-all shadow-xl shadow-[#2D6A4F]/20 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : editingId ? 'Perbarui Kustomisasi' : 'Simpan Kustomisasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
