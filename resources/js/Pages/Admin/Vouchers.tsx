import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Ticket, Plus, Search, Copy, Edit2, Trash2, Sparkles, Gift, X, Check } from 'lucide-react';
import { rupiah } from '@/lib/format';

interface Voucher {
    id: number;
    name: string;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    min_purchase: number;
    max_discount: number | null;
    usage_limit: number | null;
    used_count: number;
    expires_at: string | null;
    is_active: boolean;
    is_online_only: boolean;
}

interface VouchersProps {
    vouchers: Voucher[];
}

import { confirmAction, toastSuccess } from '@/lib/swal';

export default function Vouchers({ vouchers }: VouchersProps) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        code: '',
        discount_type: 'percent',
        discount_value: '',
        min_purchase: '0',
        max_discount: '',
        usage_limit: '',
        expires_at: '',
        is_online_only: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('vouchers.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
                toastSuccess('Voucher berhasil dibuat!');
            }
        });
    };

    const toggleStatus = (id: number) => {
        post(route('vouchers.toggle', id), {
            onSuccess: () => {
                toastSuccess('Status kupon diperbarui!');
            }
        });
    };

    const deleteVoucher = (id: number) => {
        confirmAction('Hapus Voucher?', 'Apakah Anda yakin ingin menghapus kupon voucher ini?', 'Ya, Hapus').then((result) => {
            if (result.isConfirmed) {
                destroy(route('vouchers.destroy', id), {
                    onSuccess: () => {
                        toastSuccess('Voucher berhasil dihapus!');
                    }
                });
            }
        });
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toastSuccess('Kode disalin!');
    };

    return (
        <AdminLayout title="Promo & Marketing">
            <Head title="Kupon & Voucher - EWWON COCO" />
            
            <div className="space-y-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight font-poppins">Kupon Belanja</h2>
                        <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-[0.2em] mt-1">Tingkatkan konversi dengan penawaran menarik</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowModal(true)}
                            className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-7 py-3.5 rounded-2xl text-[13px] font-black shadow-lg shadow-[#2D6A4F]/15 transition-all flex items-center gap-3 group"
                        >
                            <Plus size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                            <span className="uppercase tracking-widest">Buat Kupon</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vouchers.map((v) => (
                        <div key={v.id} className="bg-white rounded-[40px] border border-[#F0F0F0] shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-[#2D6A4F]/5 transition-all relative">
                            <div className="absolute top-[80px] -left-3 w-6 h-6 bg-[#FDFDFD] border border-[#F0F0F0] rounded-full z-10"></div>
                            <div className="absolute top-[80px] -right-3 w-6 h-6 bg-[#FDFDFD] border border-[#F0F0F0] rounded-full z-10"></div>

                            <div className={`p-8 pb-4 flex items-center justify-between ${v.is_active ? 'bg-[#F0FAF6]' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center transition-transform group-hover:rotate-[-6deg] ${
                                        v.is_active ? 'bg-white text-[#2D6A4F]' : 'bg-white text-[#D0D0D0]'
                                    }`}>
                                        <Ticket size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <span className="text-[14px] font-black text-[#1A1A1A] font-mono tracking-tighter">{v.code}</span>
                                        <p className="text-[9px] font-black text-[#B5AFA6] uppercase tracking-widest mt-0.5">{v.is_active ? 'Aktif' : 'Nonaktif'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => copyCode(v.code)}
                                    className="w-10 h-10 flex items-center justify-center bg-white/50 backdrop-blur rounded-xl text-[#A0A0A0] hover:text-[#2D6A4F] transition-all"
                                >
                                    <Copy size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                            
                            <div className="p-8 pt-10 space-y-8">
                                <div>
                                    <h4 className="text-[16px] font-black text-[#1A1A1A] tracking-tight">{v.name}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2.5 py-1 bg-[#F5F5F5] text-[#8A8A8A] rounded-lg text-[9px] font-black uppercase tracking-wider">
                                            {v.discount_type === 'percent' ? 'Diskon %' : 'Potongan Harga'}
                                        </span>
                                        <span className="text-[11px] font-black text-[#2D6A4F]">
                                            {v.discount_type === 'percent' ? `${v.discount_value}%` : rupiah(v.discount_value)}
                                        </span>
                                        {v.is_online_only && (
                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-wider">Online Only</span>
                                        )}
                                    </div>
                                </div>
                                
                                {v.usage_limit && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Kuota Terpakai</span>
                                            <span className="text-[12px] font-black text-[#1A1A1A]">{v.used_count} <span className="text-[#D0D0D0] font-bold">/ {v.usage_limit}</span></span>
                                        </div>
                                        <div className="w-full h-2.5 bg-[#F9F9F9] rounded-full overflow-hidden border border-[#F0F0F0]">
                                            <div 
                                                className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                                    v.is_active ? 'bg-gradient-to-r from-[#2D6A4F] to-[#40916C]' : 'bg-[#D0D0D0]'
                                                }`} 
                                                style={{ width: `${(v.used_count / v.usage_limit) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between pt-2 border-t border-[#F8F8F8]">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${v.is_active ? 'bg-[#00C48C]' : 'bg-red-400'}`}></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#B5AFA6]">{v.is_active ? 'Active' : 'Disabled'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => toggleStatus(v.id)}
                                            className="w-9 h-9 flex items-center justify-center bg-white border border-[#F0F0F0] text-[#A0A0A0] hover:text-[#2D6A4F] hover:border-[#2D6A4F] rounded-xl shadow-sm transition-all"
                                        >
                                            <Check size={14} strokeWidth={2.5} />
                                        </button>
                                        <button 
                                            onClick={() => deleteVoucher(v.id)}
                                            className="w-9 h-9 flex items-center justify-center bg-white border border-[#F0F0F0] text-[#A0A0A0] hover:text-red-500 hover:border-red-500 rounded-xl shadow-sm transition-all"
                                        >
                                            <Trash2 size={14} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-[#FDFDFD] rounded-[40px] border-4 border-dashed border-[#F0F0F0] flex flex-col items-center justify-center p-10 group hover:border-[#2D6A4F]/30 hover:bg-white transition-all min-h-[350px]"
                    >
                        <div className="w-16 h-16 bg-white border border-[#F0F0F0] rounded-3xl flex items-center justify-center text-[#D0D0D0] group-hover:text-[#2D6A4F] group-hover:scale-110 group-hover:rotate-6 transition-all mb-6 shadow-sm">
                            <Gift size={32} strokeWidth={2} />
                        </div>
                        <h4 className="text-[16px] font-black text-[#1A1A1A] tracking-tight mb-2">Buat Promo Baru</h4>
                        <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-widest text-center px-4 leading-relaxed">Tambah voucher diskon atau cashback untuk pelanggan</p>
                    </button>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-[#F0FAF6]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#2D6A4F] text-white rounded-2xl flex items-center justify-center">
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#1A1A1A]">Buat Voucher Baru</h3>
                                    <p className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-widest">Atur penawaran promo terbaik Anda</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nama Voucher</label>
                                    <input 
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#2D6A4F]/5"
                                        placeholder="Contoh: Diskon Grand Opening"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Kode Voucher</label>
                                    <input 
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#2D6A4F]/5 font-mono uppercase"
                                        placeholder="COCOPROMO2026"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value)}
                                        required
                                    />
                                    {errors.code && <p className="text-red-500 text-xs font-bold">{errors.code}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Tipe Diskon</label>
                                    <select 
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#2D6A4F]/5"
                                        value={data.discount_type}
                                        onChange={e => setData('discount_type', e.target.value as any)}
                                    >
                                        <option value="percent">Persentase (%)</option>
                                        <option value="fixed">Nominal Tetap (Rp)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nilai Diskon</label>
                                    <input 
                                        type="number"
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#2D6A4F]/5"
                                        placeholder={data.discount_type === 'percent' ? '10' : '5000'}
                                        value={data.discount_value}
                                        onChange={e => setData('discount_value', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Min. Belanja (Rp)</label>
                                    <input 
                                        type="number"
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#2D6A4F]/5"
                                        value={data.min_purchase}
                                        onChange={e => setData('min_purchase', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Max. Potongan (Optional)</label>
                                    <input 
                                        type="number"
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#2D6A4F]/5"
                                        value={data.max_discount}
                                        onChange={e => setData('max_discount', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Batas Penggunaan</label>
                                    <input 
                                        type="number"
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#2D6A4F]/5"
                                        placeholder="100"
                                        value={data.usage_limit}
                                        onChange={e => setData('usage_limit', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Tanggal Berakhir</label>
                                    <input 
                                        type="date"
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#2D6A4F]/5"
                                        value={data.expires_at}
                                        onChange={e => setData('expires_at', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-6 bg-blue-50 rounded-[32px] border border-blue-100">
                                <input 
                                    type="checkbox"
                                    id="is_online_only"
                                    className="w-5 h-5 text-[#2D6A4F] focus:ring-[#2D6A4F] border-gray-300 rounded"
                                    checked={data.is_online_only}
                                    onChange={e => setData('is_online_only', e.target.checked)}
                                />
                                <label htmlFor="is_online_only" className="text-xs font-black text-blue-700 uppercase tracking-widest cursor-pointer">
                                    Hanya Untuk Pesanan Online
                                </label>
                            </div>

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
                                    {processing ? 'Menyimpan...' : 'Simpan Voucher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
