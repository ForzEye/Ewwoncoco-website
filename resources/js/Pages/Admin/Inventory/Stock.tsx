import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { rupiah, qty, tanggalWaktu } from '../../../lib/format';
import { 
    Plus, 
    ArrowUpRight, 
    RefreshCcw, 
    Search, 
    X,
    CheckCircle2,
    Store,
    AlertTriangle,
    History,
    Edit2,
    Trash2
} from 'lucide-react';
import { confirmAction, toastSuccess } from '@/lib/swal';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
}

interface Branch {
    id: number;
    name: string;
}

interface BranchIngredient {
    id: number;
    ingredient_id: number;
    stock: number;
    min_stock: number;
    average_cost: number;
    ingredient: Ingredient;
}

interface StockMovement {
    id: number;
    branch_id: number;
    ingredient_id: number;
    type: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    notes?: string;
    created_at: string;
    ingredient?: Ingredient;
    branch?: Branch;
}

interface StockProps {
    branches: Branch[];
    selectedBranchId: number;
    ingredients: Ingredient[];
    stockData: BranchIngredient[];
    stockMovements: StockMovement[];
}

export default function Stock({ branches, selectedBranchId, ingredients, stockData, stockMovements }: StockProps) {
    const { auth } = usePage<any>().props;
    const isKasir = auth.user?.role === 'kasir';
    const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');

    const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<BranchIngredient | null>(null);

    const stockInForm = useForm({
        branch_id: selectedBranchId,
        ingredient_id: '',
        quantity: '',
        cost_per_unit: '',
        notes: '',
    });

    const adjustForm = useForm({
        branch_id: selectedBranchId,
        ingredient_id: '',
        actual_stock: '',
        notes: '',
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BranchIngredient | null>(null);

    const editForm = useForm({
        stock: '',
        min_stock: '',
        average_cost: '',
    });

    const handleBranchChange = (branchId: number) => {
        const routeName = isKasir ? 'pos.inventory.stock.index' : 'admin.inventory.stock.index';
        router.get(route(routeName), { branch_id: branchId }, { preserveState: true });
    };

    const openStockIn = () => {
        stockInForm.reset();
        setIsStockInModalOpen(true);
    };

    const openAdjust = (item: BranchIngredient) => {
        setSelectedIngredient(item);
        adjustForm.setData({
            branch_id: selectedBranchId,
            ingredient_id: item.ingredient_id.toString(),
            actual_stock: Number(item.stock).toString(),
            notes: '',
        });
        setIsAdjustModalOpen(true);
    };

    const openEdit = (item: BranchIngredient) => {
        setEditingItem(item);
        editForm.setData({
            stock: Number(item.stock).toString(),
            min_stock: Number(item.min_stock).toString(),
            average_cost: Number(item.average_cost).toString(),
        });
        setIsEditModalOpen(true);
    };

    const handleStockInSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const routeName = isKasir ? 'pos.inventory.stock.in' : 'admin.inventory.stock.in';
        stockInForm.post(route(routeName), {
            onSuccess: () => {
                setIsStockInModalOpen(false);
                stockInForm.reset();
            }
        });
    };

    const handleAdjustSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const routeName = isKasir ? 'pos.inventory.stock.adjust' : 'admin.inventory.stock.adjust';
        adjustForm.post(route(routeName), {
            onSuccess: () => {
                setIsAdjustModalOpen(false);
                adjustForm.reset();
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            editForm.post(route('admin.inventory.stock.update', editingItem.id), {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    toastSuccess('Stok cabang berhasil diperbarui!');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        confirmAction(
            'Hapus Stok Cabang?',
            'Apakah Anda yakin ingin menghapus bahan baku ini dari cabang ini? Histori transaksi stok akan disesuaikan.',
            'Ya, Hapus'
        ).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.inventory.stock.destroy', id), {
                    onSuccess: () => {
                        toastSuccess('Stok cabang berhasil dihapus!');
                    }
                });
            }
        });
    };

    return (
        <AdminLayout title="Manajemen Stok Cabang">
            <Head title="Stok Cabang - EWWON COCO" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-poppins font-black text-[#1A1A1A] tracking-tight">Stok Bahan Baku</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Pantau dan update ketersediaan bahan per cabang.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={openStockIn}
                            className="bg-[#2D6A4F] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-[#1B4332] transition-all shadow-lg shadow-[#2D6A4F]/20"
                        >
                            <Plus size={18} />
                            Barang Masuk
                        </button>
                    </div>
                </div>

                {/* Branch Selector & Search */}
                <div className="bg-white p-6 rounded-[32px] border border-[#F0F0F0] shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-center gap-3 bg-[#F5F3EF] px-5 py-3 rounded-2xl w-full md:w-auto">
                        <Store size={18} className="text-[#2D6A4F]" />
                        <select 
                            className="bg-transparent border-none text-sm font-bold text-[#1A1A1A] focus:ring-0 outline-none pr-8 cursor-pointer"
                            value={selectedBranchId}
                            onChange={(e) => handleBranchChange(parseInt(e.target.value))}
                        >
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Cari bahan di cabang ini..."
                            className="w-full pl-12 pr-4 py-3 bg-[#F5F3EF]/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Tab Selectors */}
                {!isKasir && (
                    <div className="flex gap-6 border-b border-[#F0F0F0] mb-2 px-2">
                        <button
                            onClick={() => setActiveTab('stock')}
                            className={`pb-4 text-sm font-black transition-all border-b-2 ${
                                activeTab === 'stock'
                                    ? 'border-[#2D6A4F] text-[#2D6A4F]'
                                    : 'border-transparent text-[#8A8A8A] hover:text-[#1A1A1A]'
                            }`}
                        >
                            Stok Saat Ini
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`pb-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 ${
                                activeTab === 'history'
                                    ? 'border-[#2D6A4F] text-[#2D6A4F]'
                                    : 'border-transparent text-[#8A8A8A] hover:text-[#1A1A1A]'
                            }`}
                        >
                            <History size={16} />
                            Riwayat & Monitoring Stok
                        </button>
                    </div>
                )}

                {activeTab === 'stock' ? (
                    /* Stock Table */
                    <div className="bg-white rounded-[32px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#FAFAF8] border-b border-[#F0F0F0]">
                                <tr className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">
                                    <th className="px-8 py-5">Nama Bahan</th>
                                    <th className="px-8 py-5 text-center">Stok Saat Ini</th>
                                    <th className="px-8 py-5 text-right">Harga Rata-rata (HPP)</th>
                                    <th className="px-8 py-5 text-center">Status</th>
                                    <th className="px-8 py-5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F0F0]">
                                {stockData.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#FAFAF8] transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#1A1A1A]">{item.ingredient?.name ?? 'Tidak Ada'}</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5">{item.ingredient?.unit ?? ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-mono font-black text-lg text-[#1A1A1A] leading-none">{qty(item.stock)}</span>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{item.ingredient?.unit ?? ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="font-bold text-[#2D6A4F]">{rupiah(item.average_cost)}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                {Number(item.stock) <= Number(item.min_stock) ? (
                                                    <span className="px-3 py-1 bg-red-50 text-red-500 text-[9px] font-black rounded-full border border-red-100 flex items-center gap-1">
                                                        <AlertTriangle size={12} /> MENIPIS
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full border border-green-100 flex items-center gap-1">
                                                        <CheckCircle2 size={12} /> AMAN
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openAdjust(item)}
                                                    className="px-4 py-2 bg-[#F5F3EF] text-[#1A1A1A] text-[10px] font-black rounded-xl hover:bg-[#E8E4DD] transition-all flex items-center gap-2"
                                                >
                                                    <RefreshCcw size={14} /> ADJ
                                                </button>
                                                {!isKasir && (
                                                    <>
                                                        <button 
                                                            onClick={() => openEdit(item)}
                                                            className="p-2 text-gray-400 hover:text-[#2D6A4F] hover:bg-green-50 rounded-xl transition-all"
                                                            title="Edit Detail Stok"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Hapus Stok Cabang"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* History Table */
                    <div className="bg-white rounded-[32px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#FAFAF8] border-b border-[#F0F0F0]">
                                <tr className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">
                                    <th className="px-8 py-5">Waktu</th>
                                    <th className="px-8 py-5">Bahan Baku</th>
                                    <th className="px-8 py-5 text-center">Tipe</th>
                                    <th className="px-8 py-5 text-right">Jumlah</th>
                                    <th className="px-8 py-5">Catatan & Pengubah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F0F0]">
                                {stockMovements.map((movement) => (
                                    <tr key={movement.id} className="hover:bg-[#FAFAF8] transition-all">
                                        <td className="px-8 py-5 text-xs text-gray-500 font-medium">
                                            {tanggalWaktu(movement.created_at)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#1A1A1A]">{movement.ingredient?.name ?? 'Tidak Ada'}</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5">{movement.ingredient?.unit ?? ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                {movement.type === 'IN' && (
                                                    <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full border border-green-100">
                                                        BARANG MASUK
                                                    </span>
                                                )}
                                                {movement.type === 'OUT' && (
                                                    <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-[9px] font-black rounded-full border border-orange-100">
                                                        PENGGUNAAN
                                                    </span>
                                                )}
                                                {movement.type === 'ADJUST' && (
                                                    <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-[9px] font-black rounded-full border border-purple-100">
                                                        PENYESUAIAN
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`font-mono font-bold ${
                                                movement.type === 'IN' ? 'text-green-600' :
                                                movement.type === 'OUT' ? 'text-red-500' : 'text-purple-600'
                                            }`}>
                                                {movement.quantity > 0 ? '+' : ''}{qty(movement.quantity)} {movement.ingredient?.unit ?? ''}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs text-[#1A1A1A] font-medium max-w-xs truncate">
                                            {movement.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                                {stockMovements.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-400 text-sm font-medium">
                                            Belum ada riwayat pergerakan stok untuk cabang ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stock In Modal */}
            {isStockInModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-[#F0F0F0] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <ArrowUpRight size={20} />
                                </div>
                                <h3 className="font-poppins font-black text-xl text-[#1A1A1A]">Barang Masuk</h3>
                            </div>
                            <button onClick={() => setIsStockInModalOpen(false)} className="p-2 hover:bg-[#F5F3EF] rounded-2xl transition-all">
                                <X size={20} className="text-[#B5AFA6]" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleStockInSubmit} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Pilih Bahan</label>
                                <select 
                                    className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none appearance-none"
                                    value={stockInForm.data.ingredient_id}
                                    onChange={e => stockInForm.setData('ingredient_id', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Bahan Baku...</option>
                                    {ingredients.map(i => (
                                        <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Jumlah</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                                        value={stockInForm.data.quantity}
                                        onChange={e => stockInForm.setData('quantity', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Harga per Unit</label>
                                    <input 
                                        type="number"
                                        className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                                        value={stockInForm.data.cost_per_unit}
                                        onChange={e => stockInForm.setData('cost_per_unit', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Catatan</label>
                                <textarea 
                                    className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none h-24"
                                    placeholder="Contoh: Pembelian dari Supplier Kelapa Jaya"
                                    value={stockInForm.data.notes}
                                    onChange={e => stockInForm.setData('notes', e.target.value)}
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                disabled={stockInForm.processing}
                                className="w-full py-5 bg-[#2D6A4F] text-white font-black rounded-2xl shadow-xl shadow-[#2D6A4F]/20 hover:bg-[#1B4332] transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                SIMPAN STOK MASUK
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Adjust Modal */}
            {isAdjustModalOpen && selectedIngredient && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-[#F0F0F0] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                    <RefreshCcw size={20} />
                                </div>
                                <h3 className="font-poppins font-black text-xl text-[#1A1A1A]">Opname Stok</h3>
                            </div>
                            <button onClick={() => setIsAdjustModalOpen(false)} className="p-2 hover:bg-[#F5F3EF] rounded-2xl transition-all">
                                <X size={20} className="text-[#B5AFA6]" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAdjustSubmit} className="p-8 space-y-6">
                            <div className="bg-[#F5F3EF] p-4 rounded-2xl mb-4">
                                <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest">Bahan Baku</p>
                                <p className="text-sm font-bold text-[#1A1A1A] mt-1">{selectedIngredient.ingredient?.name ?? 'Tidak Ada'}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Stok Saat Ini (Sistem): {qty(selectedIngredient.stock)} {selectedIngredient.ingredient?.unit ?? ''}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Stok Aktual di Cabang</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                                    value={adjustForm.data.actual_stock}
                                    onChange={e => adjustForm.setData('actual_stock', e.target.value)}
                                    required
                                />
                                <p className="text-[9px] text-[#2D6A4F] font-bold mt-1 italic">* Masukkan jumlah fisik yang ada di toko saat ini.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Alasan Penyesuaian</label>
                                <textarea 
                                    className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none h-24"
                                    placeholder="Contoh: Barang rusak atau susut alami"
                                    value={adjustForm.data.notes}
                                    onChange={e => adjustForm.setData('notes', e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                disabled={adjustForm.processing}
                                className="w-full py-5 bg-[#1A1A1A] text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                UPDATE STOK FISIK
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal (Admin Only) */}
            {isEditModalOpen && editingItem && !isKasir && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-[#F0F0F0] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                    <Edit2 size={20} />
                                </div>
                                <h3 className="font-poppins font-black text-xl text-[#1A1A1A]">Edit Stok Cabang</h3>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-[#F5F3EF] rounded-2xl transition-all">
                                <X size={20} className="text-[#B5AFA6]" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} className="p-8 space-y-5">
                            <div className="bg-[#F5F3EF] p-4 rounded-2xl mb-2">
                                <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest">Bahan Baku</p>
                                <p className="text-sm font-bold text-[#1A1A1A] mt-1">{editingItem.ingredient?.name ?? 'Tidak Ada'}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Satuan: {editingItem.ingredient?.unit ?? ''}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Stok Saat Ini</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                                    value={editForm.data.stock}
                                    onChange={e => editForm.setData('stock', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Stok Minimum</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                                        value={editForm.data.min_stock}
                                        onChange={e => editForm.setData('min_stock', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">HPP rata-rata (Rp)</label>
                                    <input 
                                        type="number"
                                        className="w-full px-5 py-4 bg-[#F5F3EF] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                                        value={editForm.data.average_cost}
                                        onChange={e => editForm.setData('average_cost', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={editForm.processing}
                                className="w-full py-5 bg-[#2D6A4F] text-white font-black rounded-2xl shadow-xl shadow-[#2D6A4F]/20 hover:bg-[#1B4332] transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                SIMPAN PERUBAHAN
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
