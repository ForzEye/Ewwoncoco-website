import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Package, 
    X,
    CheckCircle2,
    Layers
} from 'lucide-react';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
    created_at: string;
}

interface IngredientsProps {
    ingredients: Ingredient[];
}

export default function Ingredients({ ingredients }: IngredientsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        unit: 'pcs',
    });

    const filteredIngredients = ingredients.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingIngredient(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (ingredient: Ingredient) => {
        setEditingIngredient(ingredient);
        setData({
            name: ingredient.name,
            unit: ingredient.unit,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingIngredient) {
            post(route('admin.inventory.ingredients.update', editingIngredient.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        } else {
            post(route('admin.inventory.ingredients.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus bahan baku ini? Ini juga akan menghapus data stok terkait.')) {
            destroy(route('admin.inventory.ingredients.destroy', id));
        }
    };

    return (
        <AdminLayout title="Master Bahan Baku">
            <Head title="Inventory - EWWON COCO" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-poppins font-black text-[#1A1A1A] tracking-tight">Master Bahan</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Kelola daftar bahan mentah dan kemasan Anda.</p>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="bg-[#2D6A4F] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-[#1B4332] transition-all shadow-lg shadow-[#2D6A4F]/20"
                    >
                        <Plus size={18} />
                        Tambah Bahan
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-3xl border border-[#F0F0F0] shadow-sm flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Cari nama bahan..."
                            className="w-full pl-12 pr-4 py-3 bg-[#F5F3EF]/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[32px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#FAFAF8] border-b border-[#F0F0F0]">
                            <tr className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">
                                <th className="px-8 py-5">Nama Bahan</th>
                                <th className="px-8 py-5">Satuan</th>
                                <th className="px-8 py-5">Dibuat Pada</th>
                                <th className="px-8 py-5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F0F0]">
                            {filteredIngredients.map((item) => (
                                <tr key={item.id} className="hover:bg-[#FAFAF8] transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#F5F3EF] rounded-xl flex items-center justify-center text-[#2D6A4F] group-hover:bg-[#2D6A4F] group-hover:text-white transition-all">
                                                <Package size={20} />
                                            </div>
                                            <span className="font-bold text-[#1A1A1A]">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase">
                                            {item.unit}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs text-gray-500 font-medium">
                                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => openEditModal(item)}
                                                className="p-2 text-gray-400 hover:text-[#2D6A4F] hover:bg-[#E8F5E9] rounded-xl transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredIngredients.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center text-gray-300">
                                            <Layers size={48} className="mb-4 opacity-20" />
                                            <p className="text-sm font-medium">Belum ada bahan baku yang terdaftar.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-[#F0F0F0] flex items-center justify-between">
                            <h3 className="font-poppins font-black text-xl text-[#1A1A1A]">
                                {editingIngredient ? 'Edit Bahan' : 'Bahan Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#F5F3EF] rounded-2xl transition-all">
                                <X size={20} className="text-[#B5AFA6]" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Nama Bahan</label>
                                <input 
                                    type="text"
                                    className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                                    placeholder="Contoh: Kelapa Muda"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Satuan</label>
                                <select 
                                    className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none appearance-none"
                                    value={data.unit}
                                    onChange={e => setData('unit', e.target.value)}
                                >
                                    <option value="pcs">Pcs (Buah)</option>
                                    <option value="ml">ml (Mililiter)</option>
                                    <option value="gr">gr (Gram)</option>
                                    <option value="kg">kg (Kilogram)</option>
                                    <option value="liter">Liter</option>
                                    <option value="box">Box / Dus</option>
                                </select>
                            </div>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="w-full py-5 bg-[#2D6A4F] text-white font-black rounded-2xl shadow-xl shadow-[#2D6A4F]/20 hover:bg-[#1B4332] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <CheckCircle2 size={18} />
                                {editingIngredient ? 'SIMPAN PERUBAHAN' : 'TAMBAH BAHAN'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
