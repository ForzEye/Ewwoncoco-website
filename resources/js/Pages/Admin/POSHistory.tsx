import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ShoppingBag, Calendar, User, CreditCard, ChevronRight, Download, Search, Filter, ArrowUpRight, Monitor } from 'lucide-react';
import { rupiah, tanggalWaktu } from '../../lib/format';

const transactions = [
    { id: 'POS-20260513-A1', time: '14:30', items: 3, total: 54000, cashier: 'Kasir Utama', method: 'Cash' },
    { id: 'POS-20260513-A2', time: '14:45', items: 1, total: 18000, cashier: 'Kasir Utama', method: 'QRIS' },
    { id: 'POS-20260513-A3', time: '15:10', items: 2, total: 36000, cashier: 'Kasir Utama', method: 'Cash' },
    { id: 'POS-20260513-A4', time: '15:25', items: 5, total: 115000, cashier: 'Kasir Utama', method: 'QRIS' },
];

export default function POSHistory() {
    return (
        <AdminLayout title="Log Transaksi Kasir">
            <Head title="Riwayat POS - EWWON COCO" />
            
            <div className="space-y-10">
                {/* Header Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight font-poppins">Riwayat POS</h2>
                        <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-[0.2em] mt-1">Audit transaksi harian secara detail</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-3 px-6 py-3.5 bg-white border border-[#F0F0F0] rounded-2xl text-[12px] font-black text-[#8A8A8A] hover:text-[#2D6A4F] transition-all shadow-sm">
                            <Download size={18} strokeWidth={2.5} />
                            <span className="uppercase tracking-widest">Export PDF</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid — Glassmorphism Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-[#2D6A4F]/5 transition-all group">
                        <div className="w-12 h-12 bg-[#F0FAF6] text-[#2D6A4F] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Monitor size={24} strokeWidth={2.5} />
                        </div>
                        <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Volume POS</p>
                        <h3 className="text-[24px] font-black text-[#1A1A1A] font-poppins tracking-tighter">42 <span className="text-[11px] font-bold text-[#B5AFA6] tracking-normal">Transaksi</span></h3>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <CreditCard size={24} strokeWidth={2.5} />
                        </div>
                        <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">POS Revenue (Cash)</p>
                        <h3 className="text-[24px] font-black text-[#1A1A1A] font-poppins tracking-tighter">{rupiah(1250000)}</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all group">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Sparkles size={24} strokeWidth={2.5} />
                        </div>
                        <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">POS Revenue (QRIS)</p>
                        <h3 className="text-[24px] font-black text-[#1A1A1A] font-poppins tracking-tighter">{rupiah(850000)}</h3>
                    </div>
                </div>

                {/* History Container — Sophisticated List */}
                <div className="bg-white rounded-[48px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                    <div className="p-10 border-b border-[#F8F8F8] flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#F9F9F9] rounded-xl flex items-center justify-center text-[#2D6A4F]">
                                <Calendar size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A]">Arsip Transaksi</h3>
                                <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-widest mt-1">Hari Ini: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D0D0D0] group-focus-within:text-[#2D6A4F] transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Cari ID Transaksi..." 
                                className="w-full md:w-64 pl-10 pr-6 py-3 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[12px] font-black outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-[#F8F8F8]">
                        {transactions.map((trx) => (
                            <div key={trx.id} className="p-8 flex items-center justify-between hover:bg-[#FAFAFA] transition-all cursor-pointer group relative overflow-hidden">
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="w-14 h-14 bg-[#F9F9F9] rounded-2xl flex items-center justify-center text-[#B5AFA6] group-hover:bg-[#F0FAF6] group-hover:text-[#2D6A4F] transition-all duration-500 shadow-sm">
                                        <ShoppingBag size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-black text-[#1A1A1A] tracking-tighter font-mono">{trx.id}</p>
                                        <div className="flex items-center gap-6 mt-1.5">
                                            <span className="text-[10px] font-bold text-[#B5AFA6] flex items-center gap-2 uppercase tracking-widest">
                                                <Clock size={12} strokeWidth={3} className="text-[#D0D0D0]" /> {trx.time}
                                            </span>
                                            <span className="text-[10px] font-bold text-[#B5AFA6] flex items-center gap-2 uppercase tracking-widest">
                                                <User size={12} strokeWidth={3} className="text-[#D0D0D0]" /> {trx.cashier}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-10 relative z-10">
                                    <div className="text-right">
                                        <p className="text-[16px] font-black text-[#1A1A1A] tracking-tighter">{rupiah(trx.total)}</p>
                                        <div className="flex items-center justify-end gap-3 mt-1.5">
                                            <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">{trx.items} Items</span>
                                            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${
                                                trx.method === 'Cash' ? 'bg-[#F0FAF6] text-[#2D6A4F] border-[#2D6A4F]/10' : 'bg-blue-50 text-blue-500 border-blue-500/10'
                                            }`}>
                                                {trx.method}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-[#F0F0F0] flex items-center justify-center text-[#D0D0D0] group-hover:bg-[#2D6A4F] group-hover:text-white group-hover:border-[#2D6A4F] group-hover:shadow-lg group-hover:shadow-[#2D6A4F]/20 transition-all">
                                        <ChevronRight size={20} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-[#FAFAFA] text-center border-t border-[#F8F8F8]">
                        <button className="text-[11px] font-black text-[#B5AFA6] uppercase tracking-[0.3em] hover:text-[#1A1A1A] transition-colors flex items-center justify-center gap-2 mx-auto group">
                            Muat Semua Riwayat <ArrowUpRight size={14} strokeWidth={3} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function Clock({ size, className, strokeWidth }: { size?: number, className?: string, strokeWidth?: number }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || "2.5"} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
