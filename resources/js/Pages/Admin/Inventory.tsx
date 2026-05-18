import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Package, AlertTriangle, RefreshCw, Filter, Search, Plus, ArrowUpRight, Box, Boxes, ChevronRight } from 'lucide-react';

const inventory = [
    { name: 'Kelapa Muda (Buah)', stock: 120, unit: 'pcs', status: 'In Stock', color: 'bg-[#F0FAF6] text-[#2D6A4F] border-[#2D6A4F]/10' },
    { name: 'Gula Cair', stock: 15, unit: 'Liter', status: 'Low Stock', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { name: 'Susu Kental Manis', stock: 45, unit: 'Kaleng', status: 'In Stock', color: 'bg-[#F0FAF6] text-[#2D6A4F] border-[#2D6A4F]/10' },
    { name: 'Jeruk Nipis', stock: 5, unit: 'kg', status: 'Critical', color: 'bg-red-50 text-red-600 border-red-100' },
    { name: 'Cup 16oz', stock: 500, unit: 'pcs', status: 'In Stock', color: 'bg-[#F0FAF6] text-[#2D6A4F] border-[#2D6A4F]/10' },
    { name: 'Sedotan Bambu', stock: 200, unit: 'pcs', status: 'In Stock', color: 'bg-[#F0FAF6] text-[#2D6A4F] border-[#2D6A4F]/10' },
];

export default function Inventory() {
    return (
        <AdminLayout title="Kontrol Inventaris">
            <Head title="Stok Bahan Baku - EWWON COCO" />
            
            <div className="space-y-10">
                {/* Header Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight font-poppins">Stok Bahan Baku</h2>
                        <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-[0.2em] mt-1">Pantau ketersediaan logistik outlet</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D0D0D0] group-focus-within:text-[#2D6A4F] transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Cari bahan baku..." 
                                className="w-full lg:w-72 pl-12 pr-6 py-3.5 bg-white border border-[#F0F0F0] rounded-2xl text-[13px] font-bold focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 outline-none transition-all placeholder:text-[#D0D0D0]"
                            />
                        </div>
                        
                        <button className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-7 py-3.5 rounded-2xl text-[13px] font-black shadow-lg shadow-[#2D6A4F]/15 transition-all flex items-center gap-3 group">
                            <Plus size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                            <span className="uppercase tracking-widest">Update Stok</span>
                        </button>
                    </div>
                </div>

                {/* Alerts Area — Sophisticated Warning */}
                <div className="bg-[#FFF8F0] border border-[#FFE8CC] p-8 rounded-[40px] flex items-center justify-between group overflow-hidden relative shadow-sm">
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="w-14 h-14 bg-white text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/5 group-hover:rotate-6 transition-transform">
                            <AlertTriangle size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="font-poppins font-black text-[#1A1A1A] text-[16px]">Peringatan Logistik</h4>
                            <p className="text-[12px] font-bold text-amber-700/70 mt-1 max-w-lg leading-relaxed">Sistem mendeteksi 2 bahan baku berada di bawah batas minimum. Segera lakukan pengadaan untuk menjaga kelancaran produksi.</p>
                        </div>
                    </div>
                    <button className="relative z-10 px-6 py-3 bg-white border border-[#FFE8CC] rounded-2xl text-[11px] font-black text-amber-600 hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 group/btn">
                        Lihat Detail <ChevronRight size={14} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <Boxes className="absolute -right-8 -bottom-8 w-40 h-40 text-amber-500/5 -rotate-12" />
                </div>

                {/* Inventory Table — Premium Design */}
                <div className="bg-white rounded-[40px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#F8F8F8]">
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Nama Bahan Baku</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Sisa Stok</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Satuan</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F8F8F8]">
                                {inventory.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-[#FAFAFA] transition-all group">
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-5">
                                                <div className="w-11 h-11 bg-[#F9F9F9] border border-[#F0F0F0] rounded-xl flex items-center justify-center text-[#A0A0A0] group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    <Box size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-black text-[#1A1A1A] tracking-tight">{item.name}</p>
                                                    <p className="text-[10px] font-bold text-[#D0D0D0] mt-0.5 uppercase tracking-wider">Ref: {item.name.substring(0,3).toUpperCase()}-{idx+101}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <span className="text-[15px] font-black text-[#1A1A1A] tracking-tighter">{item.stock}</span>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <span className="text-[11px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">{item.unit}</span>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 ${item.color}`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{item.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="w-10 h-10 flex items-center justify-center bg-white border border-[#F0F0F0] text-[#A0A0A0] hover:text-[#2D6A4F] hover:border-[#2D6A4F] rounded-xl shadow-sm transition-all">
                                                    <RefreshCw size={16} strokeWidth={2.5} />
                                                </button>
                                                <button className="w-10 h-10 flex items-center justify-center bg-white border border-[#F0F0F0] text-[#A0A0A0] hover:text-[#1A1A1A] hover:border-[#1A1A1A] rounded-xl shadow-sm transition-all">
                                                    <ArrowUpRight size={16} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Stock Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    <div className="bg-[#1A1A1A] p-10 rounded-[40px] text-white shadow-xl shadow-gray-200">
                        <Boxes className="w-10 h-10 text-[#00C48C] mb-6" />
                        <h4 className="font-poppins font-black text-[18px] mb-2 tracking-tight">Stock Efficiency</h4>
                        <p className="text-[11px] font-medium text-white/50 leading-relaxed uppercase tracking-widest">Optimalkan pengiriman bahan baku dari supplier setiap hari Selasa dan Jumat untuk mendapatkan harga grosir terbaik.</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#2D6A4F] to-[#40916C] p-10 rounded-[40px] text-white shadow-xl shadow-[#2D6A4F]/15">
                        <AlertTriangle className="w-10 h-10 text-white/30 mb-6" />
                        <h4 className="font-poppins font-black text-[18px] mb-2 tracking-tight">Waste Management</h4>
                        <p className="text-[11px] font-medium text-white/70 leading-relaxed uppercase tracking-widest">Gunakan metode FIFO (First In First Out) pada buah kelapa untuk memastikan kesegaran menu tetap terjaga.</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
