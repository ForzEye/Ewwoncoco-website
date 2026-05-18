import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { rupiah, angka } from '../../lib/format';
import { 
    Sparkles, 
    ShoppingBag, 
    Clock, 
    ArrowRight, 
    CheckCircle, 
    AlertCircle,
    TrendingUp,
    Users
} from 'lucide-react';

interface CashierDashboardProps {
    branch: any;
    stats: {
        today_sales: number;
        today_orders: number;
        online_pending: number;
    };
    currentShift: any;
    recentTransactions: any[];
}

export default function Dashboard({ branch, stats, currentShift, recentTransactions }: CashierDashboardProps) {
    return (
        <AdminLayout title="Dashboard Kasir">
            <Head title="Dashboard Kasir - EWWON COCO" />

            {/* Welcome Section */}
            <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight font-poppins">Halo, Selamat Bekerja! 👋</h1>
                    <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-[0.2em] mt-1">
                        Cabang: <span className="text-[#2D6A4F]">{branch.name}</span>
                    </p>
                </div>
                
                <Link 
                    href="/pos"
                    className="flex items-center gap-3 px-6 py-3.5 bg-[#2D6A4F] text-white rounded-2xl font-black text-[13px] hover:bg-[#1B4332] transition-all shadow-xl shadow-[#2D6A4F]/20 group"
                >
                    <Sparkles size={18} fill="currentColor" />
                    <span className="uppercase tracking-widest">Buka Layar POS</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-8 rounded-[32px] border border-[#F0F0F0] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingUp size={80} />
                    </div>
                    <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] mb-3">Penjualan Hari Ini</p>
                    <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tighter">{rupiah(stats.today_sales)}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#00C48C] bg-[#F0FAF6] px-2 py-1 rounded-lg w-fit">
                        <TrendingUp size={12} />
                        <span>Dari {angka(stats.today_orders)} transaksi</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-[#F0F0F0] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <ShoppingBag size={80} />
                    </div>
                    <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] mb-3">Pesanan Online Pending</p>
                    <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tighter">{angka(stats.online_pending)} Pesanan</h3>
                    <Link href="/pos/online-orders" className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black text-[#2D6A4F] hover:underline">
                        Periksa Pesanan <ArrowRight size={12} />
                    </Link>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-[#F0F0F0] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Clock size={80} />
                    </div>
                    <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] mb-3">Status Shift</p>
                    {currentShift ? (
                        <div>
                            <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">Shift Aktif</h3>
                            <p className="text-[11px] text-[#8A8A8A] font-medium mt-1">Mulai: {new Date(currentShift.opened_at).toLocaleTimeString()}</p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xl font-black text-red-500 tracking-tight">Shift Belum Dibuka</h3>
                            <Link href="/pos/shifts" className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black text-red-500 hover:underline">
                                Buka Shift Sekarang <ArrowRight size={12} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Recent Transactions */}
                <div className="bg-white rounded-[40px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-[#F8F8F8] flex items-center justify-between">
                        <h3 className="font-poppins font-black text-[16px] text-[#1A1A1A]">Transaksi Terakhir</h3>
                        <Link href="/pos/history" className="text-[11px] font-black text-[#2D6A4F] hover:underline">Lihat Semua</Link>
                    </div>
                    <div className="divide-y divide-[#F8F8F8]">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-[#FAFAFA] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#F9F9F9] flex items-center justify-center text-[#2D6A4F]">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-black text-[#1A1A1A]">{tx.transaction_number}</p>
                                        <p className="text-[10px] font-bold text-[#B5AFA6] mt-0.5">{new Date(tx.transaction_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <p className="text-[14px] font-black text-[#1A1A1A]">{rupiah(tx.total)}</p>
                            </div>
                        ))}
                        {recentTransactions.length === 0 && (
                            <div className="p-10 text-center">
                                <p className="text-[12px] font-bold text-[#B5AFA6]">Belum ada transaksi hari ini.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Important Information / Reminders */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#2D6A4F] to-[#40916C] p-8 rounded-[32px] text-white shadow-xl shadow-[#2D6A4F]/20 relative overflow-hidden">
                        <Sparkles size={120} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
                        <h3 className="text-xl font-black mb-2">Tips Layanan Cepat</h3>
                        <p className="text-[13px] opacity-80 leading-relaxed max-w-sm">Pastikan untuk selalu mengecek pesanan online secara berkala agar pelanggan tidak menunggu lama!</p>
                        <button className="mt-6 px-5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-[11px] font-black transition-all">Pelajari Selengkapnya</button>
                    </div>

                    <div className="bg-[#FFF9F2] border border-[#FFE4C4] p-8 rounded-[32px] relative overflow-hidden group">
                        <AlertCircle size={24} className="text-[#FF8A00] mb-4" />
                        <h3 className="text-[16px] font-black text-[#1A1A1A] mb-1">Pengingat Stok</h3>
                        <p className="text-[12px] text-[#8A8A8A] font-medium leading-relaxed">Jangan lupa melaporkan jika ada bahan baku yang hampir habis kepada Admin melalui chat.</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
