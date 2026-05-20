import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { 
    Search, 
    Store, 
    User, 
    Tag, 
    CheckCircle2, 
    AlertCircle,
    ToggleLeft,
    ToggleRight,
    MapPin
} from 'lucide-react';
import { Merchant } from '../../types';

interface MerchantsProps {
    merchants: {
        data: any[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
    };
}

import { confirmAction, toastSuccess } from '@/lib/swal';

export default function Merchants({ merchants, filters }: MerchantsProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/super-admin/merchants', { search }, { preserveState: true });
    };

    const handleToggleStatus = (id: number) => {
        confirmAction(
            'Ubah Status Merchant?',
            'Apakah Anda yakin ingin mengubah status aktif merchant ini?',
            'Ya, Ubah'
        ).then((result) => {
            if (result.isConfirmed) {
                router.post(route('superadmin.merchants.toggle', id), {}, {
                    onSuccess: () => {
                        toastSuccess('Status merchant berhasil diubah!');
                    }
                });
            }
        });
    };

    return (
        <SuperAdminLayout>
            <Head title="Manajemen Merchant" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-poppins font-bold text-charcoal">Merchants Repository</h2>
                    <p className="text-gray-500 text-sm mt-1">Daftar toko dan mitra yang terintegrasi di Ewwon Coco.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Cari Nama Merchant..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merchants.data.map((merchant: any) => (
                        <div key={merchant.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="h-24 bg-gray-50 p-6 flex items-start justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                    <Store size={100} />
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#00C48C] font-black text-2xl z-10">
                                    {merchant.name.charAt(0)}
                                </div>
                                <button 
                                    onClick={() => handleToggleStatus(merchant.id)}
                                    className={`p-2 rounded-xl transition-all z-10 ${merchant.is_active ? 'text-[#00C48C] bg-[#F0FAF6]' : 'text-red-400 bg-red-50'}`}
                                >
                                    {merchant.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                            </div>

                            <div className="p-6 flex-1 flex flex-col pt-10">
                                <div className="mb-4">
                                    <h3 className="font-poppins font-bold text-lg text-charcoal leading-tight">{merchant.name}</h3>
                                    <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase mt-1">
                                        <Tag size={12} className="mr-1" />
                                        {merchant.category}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                                        <User size={14} className="text-gray-300" />
                                        <span className="font-medium">{merchant.owner?.name}</span>
                                    </div>
                                    <div className="flex items-start space-x-3 text-xs text-gray-500">
                                        <MapPin size={14} className="text-gray-300 mt-0.5" />
                                        <span className="line-clamp-2">{merchant.address}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center">
                                        {merchant.is_active ? (
                                            <span className="flex items-center text-[#00C48C] text-[10px] font-black uppercase tracking-widest">
                                                <CheckCircle2 size={12} className="mr-1" /> AKTIF
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-400 text-[10px] font-black uppercase tracking-widest">
                                                <AlertCircle size={12} className="mr-1" /> NONAKTIF
                                            </span>
                                        )}
                                    </div>
                                    <Link 
                                        href={route('superadmin.merchants.show', merchant.id)}
                                        className="text-[10px] font-black text-gray-400 hover:text-charcoal uppercase tracking-widest transition-colors"
                                    >
                                        Lihat Detail
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SuperAdminLayout>
    );
}
