import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { 
    Search, 
    Plus, 
    MapPin, 
    Store, 
    Phone, 
    Edit2, 
    Trash2, 
    X, 
    CheckCircle2, 
    AlertCircle,
    Navigation
} from 'lucide-react';
import { Branch, Merchant } from '../../types';

interface BranchesProps {
    branches: {
        data: (Branch & { merchant: Merchant })[];
        links: any[];
        total: number;
    };
    merchants: Merchant[];
    filters: {
        search?: string;
    };
}

import { confirmAction, toastSuccess } from '@/lib/swal';

export default function Branches({ branches, merchants, filters }: BranchesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<any>(null);

    const { data, setData, post, processing, reset, delete: destroy } = useForm({
        merchant_id: '',
        name: '',
        address: '',
        phone: '',
        is_active: true,
        lat: '',
        lng: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/super-admin/branches', { search }, { preserveState: true });
    };

    const handleOpenModal = (branch: any = null) => {
        if (branch) {
            setEditingBranch(branch);
            setData({
                merchant_id: branch.merchant_id.toString(),
                name: branch.name,
                address: branch.address,
                phone: branch.phone,
                is_active: branch.is_active,
                lat: branch.lat || '',
                lng: branch.lng || '',
            });
        } else {
            setEditingBranch(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBranch) {
            post(route('superadmin.branches.update', editingBranch.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    toastSuccess('Cabang berhasil diperbarui!');
                }
            });
        } else {
            post(route('superadmin.branches.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    toastSuccess('Cabang baru berhasil dibuat!');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        confirmAction(
            'Hapus Cabang?',
            'Apakah Anda yakin ingin menghapus cabang ini?',
            'Ya, Hapus'
        ).then((result) => {
            if (result.isConfirmed) {
                destroy(route('superadmin.branches.destroy', id), {
                    onSuccess: () => {
                        toastSuccess('Cabang berhasil dihapus!');
                    }
                });
            }
        });
    };

    return (
        <SuperAdminLayout>
            <Head title="Manajemen Cabang Global" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-poppins font-bold text-charcoal">Global Branch Network</h2>
                        <p className="text-gray-500 text-sm mt-1">Kelola seluruh jaringan outlet di bawah ekosistem Ewwon Coco.</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="px-6 py-3 bg-[#00C48C] text-white font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-[#00C48C]/20 hover:bg-[#00ab7a] transition-all"
                    >
                        <Plus size={20} />
                        <span>Tambah Cabang</span>
                    </button>
                </div>


                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Cari Nama Cabang..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </form>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Nama Cabang</th>
                                <th className="px-8 py-5">Merchant Parent</th>
                                <th className="px-8 py-5">Kontak & Lokasi</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {branches.data.map(branch => (
                                <tr key={branch.id} className="hover:bg-gray-50 transition-all group">
                                    <td className="px-8 py-5 font-bold text-charcoal text-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#F0FAF6] text-[#00C48C] flex items-center justify-center">
                                                <MapPin size={16} />
                                            </div>
                                            <span>{branch.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-2">
                                            <Store size={14} className="text-gray-300" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">{branch.merchant?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 space-y-1">
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Phone size={12} className="mr-2" />
                                            {branch.phone}
                                        </div>
                                        <div className="flex items-center text-[10px] text-gray-400">
                                            <Navigation size={12} className="mr-2" />
                                            {branch.address}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {branch.is_active ? (
                                            <span className="text-[#00C48C] text-[10px] font-black uppercase tracking-widest">Aktif</span>
                                        ) : (
                                            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">Tutup</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center space-x-2">
                                            <button 
                                                onClick={() => handleOpenModal(branch)}
                                                className="p-2 text-gray-400 hover:text-blue-500 transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(branch.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Branch Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-poppins font-bold text-charcoal">{editingBranch ? 'Update Cabang' : 'Registrasi Cabang Baru'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {!editingBranch && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pilih Merchant</label>
                                    <select 
                                        className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={data.merchant_id}
                                        onChange={e => setData('merchant_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Toko --</option>
                                        {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Cabang</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telepon Cabang</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alamat Lengkap</label>
                                <textarea 
                                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none h-24"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    required
                                />
                            </div>

                            {editingBranch && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Operasional</label>
                                    <div className="flex items-center space-x-4">
                                        <button 
                                            type="button"
                                            onClick={() => setData('is_active', true)}
                                            className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${data.is_active ? 'bg-[#F0FAF6] border-[#00C48C] text-[#00C48C]' : 'bg-white border-gray-100 text-gray-400'}`}
                                        >
                                            BUKA
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setData('is_active', false)}
                                            className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${!data.is_active ? 'bg-red-50 border-red-400 text-red-500' : 'bg-white border-gray-100 text-gray-400'}`}
                                        >
                                            TUTUP
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                {editingBranch ? 'Update Cabang' : 'Simpan Cabang Baru'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
