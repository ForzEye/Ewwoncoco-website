import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { 
    ChevronLeft, 
    Store, 
    User, 
    MapPin, 
    Package, 
    Activity,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Phone
} from 'lucide-react';
import { rupiah } from '../../lib/format';

interface MerchantDetailProps {
    merchant: any;
}

export default function MerchantDetail({ merchant }: MerchantDetailProps) {
    return (
        <SuperAdminLayout>
            <Head title={`Detail Merchant - ${merchant.name}`} />

            <div className="mb-8">
                <Link 
                    href={route('superadmin.merchants')}
                    className="flex items-center text-sm font-bold text-gray-500 hover:text-[#00C48C] transition-colors"
                >
                    <ChevronLeft size={18} className="mr-1" />
                    Kembali ke Daftar Merchant
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Profile Card */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-24 h-24 rounded-3xl bg-[#F0FAF6] text-[#00C48C] flex items-center justify-center text-4xl font-black shadow-inner">
                                {merchant.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-poppins font-bold text-charcoal">{merchant.name}</h2>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{merchant.category}</p>
                            </div>
                            {merchant.is_active ? (
                                <span className="px-4 py-1.5 bg-[#F0FAF6] text-[#00C48C] rounded-full text-[10px] font-black uppercase tracking-widest flex items-center">
                                    <CheckCircle2 size={12} className="mr-1.5" /> Merchant Aktif
                                </span>
                            ) : (
                                <span className="px-4 py-1.5 bg-red-50 text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center">
                                    <AlertCircle size={12} className="mr-1.5" /> Nonaktif
                                </span>
                            )}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-50">
                            <div className="flex items-start space-x-3">
                                <User size={18} className="text-gray-300 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pemilik</p>
                                    <p className="text-sm font-bold text-charcoal">{merchant.owner?.name}</p>
                                    <p className="text-xs text-gray-500">{merchant.owner?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Phone size={18} className="text-gray-300 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kontak</p>
                                    <p className="text-sm font-bold text-charcoal">{merchant.phone || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <MapPin size={18} className="text-gray-300 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alamat Pusat</p>
                                    <p className="text-sm font-bold text-charcoal leading-relaxed">{merchant.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1A1A1A] p-8 rounded-3xl text-white space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-gray-500 uppercase">Bergabung Sejak</p>
                            <Calendar size={16} className="text-[#00C48C]" />
                        </div>
                        <p className="text-xl font-bold">{new Date(merchant.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                {/* Right: Lists & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Produk</p>
                                <p className="text-xl font-black text-charcoal">{merchant.products?.length || 0}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Cabang</p>
                                <p className="text-xl font-black text-charcoal">{merchant.branches?.length || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Branches List */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-poppins font-bold text-lg text-charcoal">Daftar Cabang</h3>
                            <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-full">{merchant.branches?.length || 0} OUTLET</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {merchant.branches?.length > 0 ? merchant.branches.map((branch: any) => (
                                <div key={branch.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#00C48C]">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-charcoal">{branch.name}</p>
                                            <p className="text-xs text-gray-400">{branch.address}</p>
                                        </div>
                                    </div>
                                    {branch.is_active ? (
                                        <span className="text-[10px] font-bold text-[#00C48C] uppercase">Buka</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-red-400 uppercase">Tutup</span>
                                    )}
                                </div>
                            )) : (
                                <div className="p-10 text-center text-gray-400 text-sm italic">Belum ada cabang terdaftar.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
