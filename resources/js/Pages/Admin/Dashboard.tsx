import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import StatCard from '../../Components/Admin/StatCard';
import AIInsights from '../../Components/Admin/AIInsights';
import { 
    DollarSign, 
    ShoppingBag, 
    Clock, 
    Package,
    TrendingUp,
    Store,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Ticket,
    Unlock,
    Power,
    User as UserIcon,
    AlertCircle
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { rupiah, angka } from '../../lib/format';

interface DashboardProps {
    stats: {
        total_revenue: number;
        total_orders: number;
        pending_orders: number;
        total_products: number;
    };
    todayStats: {
        revenue: number;
        orders: number;
        voids: number;
    };
    chartData: any[];
    branches: any[];
    activeShifts: any[];
    insights: any[];
}

export default function Dashboard({ stats, todayStats, chartData, branches, activeShifts, insights }: DashboardProps) {
    const handleUnlock = (shiftId: number) => {
        if (confirm('Buka kunci shift ini? Kasir akan bisa melakukan transaksi kembali.')) {
            router.post(route('admin.shifts.unlock', shiftId));
        }
    };

    const handleForceClose = (shiftId: number) => {
        if (confirm('Tutup paksa shift ini? Kasir akan dikeluarkan dari terminal POS.')) {
            router.post(route('admin.shifts.force_close', shiftId));
        }
    };
    return (
        <AdminLayout title="Ringkasan Bisnis">
            <Head title="Admin Dashboard - EWWON COCO" />
            
            <div className="mb-8">
                <AIInsights insights={insights} />
            </div>
            
            {/* Today's Pulse — NEW (Resets Daily) */}
            <div className="mb-10 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-[#2D6A4F] rounded-full"></div>
                    <div>
                        <h2 className="font-poppins font-black text-[22px] text-[#1A1A1A] tracking-tight">Performa Hari Ini</h2>
                        <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-widest">Data otomatis reset pada jam 00:00</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-[#2D6A4F] to-[#40916C] p-8 rounded-[40px] text-white shadow-xl shadow-[#2D6A4F]/10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Omzet Hari Ini</p>
                            <h3 className="text-[32px] font-black tracking-tighter font-poppins">{rupiah(todayStats.revenue)}</h3>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                                <TrendingUp size={12} />
                                Update Otomatis
                            </div>
                        </div>
                        <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 -rotate-12" />
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm flex items-center justify-between group hover:border-[#2D6A4F]/20 transition-all">
                        <div>
                            <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] mb-1">Total Pesanan</p>
                            <h3 className="text-[28px] font-black text-[#1A1A1A] tracking-tighter font-poppins">{angka(todayStats.orders)}</h3>
                            <p className="text-[10px] font-bold text-[#2D6A4F] mt-1">Selesai diproses</p>
                        </div>
                        <div className="w-14 h-14 bg-[#F5F3EF] rounded-2xl flex items-center justify-center text-[#2D6A4F] group-hover:scale-110 transition-transform">
                            <ShoppingBag size={28} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm flex items-center justify-between group hover:border-red-100 transition-all">
                        <div>
                            <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] mb-1">Void Kasir</p>
                            <h3 className="text-[28px] font-black text-red-500 tracking-tighter font-poppins">{angka(todayStats.voids)}</h3>
                            <p className="text-[10px] font-bold text-red-400 mt-1">Percobaan pembatalan</p>
                        </div>
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <AlertCircle size={28} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-[#B5AFA6] rounded-full"></div>
                <div>
                    <h2 className="font-poppins font-black text-[22px] text-[#1A1A1A] tracking-tight">Akumulasi Bisnis</h2>
                    <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-widest">Statistik keseluruhan waktu</p>
                </div>
            </div>
            
            {/* Statistics Row — Premium Glass Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-7 rounded-[32px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-[#00C48C]/5 transition-all group">
                    <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 bg-[#F0FAF6] text-[#2D6A4F] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <DollarSign size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-[#00C48C] bg-[#F0FAF6] px-2 py-1 rounded-full">
                            <ArrowUpRight size={12} />
                            12.5%
                        </div>
                    </div>
                    <p className="text-[11px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Pendapatan Total</p>
                    <h3 className="text-[24px] font-black text-[#1A1A1A] tracking-tighter font-poppins">{rupiah(stats.total_revenue)}</h3>
                </div>

                <div className="bg-white p-7 rounded-[32px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                    <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShoppingBag size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                            <ArrowUpRight size={12} />
                            4.2%
                        </div>
                    </div>
                    <p className="text-[11px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Total Pesanan</p>
                    <h3 className="text-[24px] font-black text-[#1A1A1A] tracking-tighter font-poppins">{angka(stats.total_orders)}</h3>
                </div>

                <div className="bg-white p-7 rounded-[32px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all group">
                    <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                    </div>
                    <p className="text-[11px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Pesanan Pending</p>
                    <h3 className="text-[24px] font-black text-[#1A1A1A] tracking-tighter font-poppins">{angka(stats.pending_orders)}</h3>
                </div>

                <div className="bg-white p-7 rounded-[32px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all group">
                    <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Package size={24} />
                        </div>
                    </div>
                    <p className="text-[11px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Katalog Produk</p>
                    <h3 className="text-[24px] font-black text-[#1A1A1A] tracking-tighter font-poppins">{angka(stats.total_products)}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart — Sophisticated Area Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A] tracking-tight">Tren Penjualan</h3>
                            <p className="text-[11px] font-bold text-[#B5AFA6] mt-1 uppercase tracking-wider">Performa 7 hari terakhir</p>
                        </div>
                        <button className="p-2 hover:bg-[#F5F5F5] rounded-xl transition-all text-[#B5AFA6]">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.12}/>
                                        <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F8F8F8" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#B5AFA6', fontSize: 11, fontWeight: 700}}
                                    dy={15}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#B5AFA6', fontSize: 11, fontWeight: 700}}
                                    tickFormatter={(val) => `Rp ${val/1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        borderRadius: '20px', 
                                        border: '1px solid #F0F0F0', 
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                                        fontFamily: 'Inter',
                                        fontSize: '12px',
                                        fontWeight: '700'
                                    }}
                                    cursor={{stroke: '#2D6A4F', strokeWidth: 1, strokeDasharray: '4 4'}}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="sales" 
                                    stroke="#2D6A4F" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorSales)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Outlet Status & Recent Activity */}
                <div className="flex flex-col gap-8">
                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A] tracking-tight">Status Cabang</h3>
                            <div className="w-8 h-8 bg-[#F0FAF6] rounded-xl flex items-center justify-center">
                                <Store size={16} className="text-[#2D6A4F]" />
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            {branches.map((outlet, i) => (
                                <div key={i} className="flex items-center justify-between group p-3 -mx-3 hover:bg-[#F9F9F9] rounded-2xl transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-11 h-11 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-[#B5AFA6] border border-[#F0F0F0]">
                                                {outlet.name.charAt(0)}
                                            </div>
                                            <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${
                                                outlet.status === 'Online' ? 'bg-[#00C48C]' : 'bg-amber-400'
                                            }`}></div>
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-black text-[#1A1A1A]">{outlet.name}</p>
                                            <p className="text-[11px] font-bold text-[#B5AFA6] mt-0.5">{outlet.orders} pesanan aktif</p>
                                        </div>
                                    </div>
                                    <button className="w-8 h-8 flex items-center justify-center text-[#D0D0D0] hover:text-[#1A1A1A] hover:bg-white rounded-lg border border-transparent hover:border-[#F0F0F0] transition-all">
                                        <ArrowUpRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {branches.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-[11px] font-bold text-[#D0D0D0] uppercase tracking-widest">Belum ada cabang</p>
                            </div>
                        )}
                        
                        <button className="w-full mt-10 py-4 bg-[#F9F9F9] border border-[#F0F0F0] rounded-2xl text-[12px] font-black text-[#8A8A8A] hover:bg-white hover:border-[#2D6A4F] hover:text-[#2D6A4F] transition-all group">
                            Kelola Semua Cabang
                        </button>
                    </div>

                    {/* Cashier Shift Monitoring — NEW */}
                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A] tracking-tight">Monitoring Kasir</h3>
                            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                                <UserIcon size={16} className="text-amber-500" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {activeShifts.map((shift) => (
                                <div key={shift.id} className="p-4 rounded-3xl border border-[#F0F0F0] bg-[#FAFAF8] space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-[#E8E4DD] font-black text-[#2D6A4F]">
                                                {shift.cashier?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-[#1A1A1A]">{shift.cashier?.name}</p>
                                                <p className="text-[10px] font-bold text-[#B5AFA6] uppercase tracking-wider">{shift.branch?.name}</p>
                                            </div>
                                        </div>
                                        {shift.is_locked ? (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 text-[9px] font-black rounded-lg border border-red-100">
                                                <AlertCircle size={10} />
                                                TERKUNCI
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-[#E8F5E9] text-[#2D6A4F] text-[9px] font-black rounded-lg border border-[#C8E6C9]">
                                                AKTIF
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="bg-white p-2 rounded-xl border border-[#F0F0F0]">
                                            <p className="text-[8px] font-bold text-[#B5AFA6] uppercase tracking-wider">Void</p>
                                            <p className={`text-[12px] font-black ${shift.void_count >= 3 ? 'text-red-500' : 'text-[#1A1A1A]'}`}>
                                                {shift.void_count} / 3
                                            </p>
                                        </div>
                                        <div className="bg-white p-2 rounded-xl border border-[#F0F0F0]">
                                            <p className="text-[8px] font-bold text-[#B5AFA6] uppercase tracking-wider">Modal</p>
                                            <p className="text-[12px] font-black text-[#1A1A1A]">{rupiah(shift.opening_cash)}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {shift.is_locked && (
                                            <button 
                                                onClick={() => handleUnlock(shift.id)}
                                                className="flex-1 py-2.5 bg-[#2D6A4F] text-white text-[10px] font-black rounded-xl hover:bg-[#1B4332] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Unlock size={14} />
                                                BUKA KUNCI
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleForceClose(shift.id)}
                                            className="flex-1 py-2.5 bg-white border border-red-100 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Power size={14} />
                                            TUTUP PAKSA
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {activeShifts.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-[11px] font-bold text-[#D0D0D0] uppercase tracking-widest">Tidak ada shift aktif</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Promotion Card */}
                    <div className="bg-gradient-to-br from-[#2D6A4F] to-[#40916C] p-8 rounded-[40px] text-white shadow-xl shadow-[#2D6A4F]/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="font-poppins font-black text-[20px] leading-tight mb-2">Tingkatkan<br/>Penjualan!</h4>
                            <p className="text-[11px] font-medium text-white/70 mb-6 max-w-[150px]">Buat kupon promo untuk menarik lebih banyak pelanggan.</p>
                            <button className="px-5 py-2.5 bg-white text-[#2D6A4F] rounded-xl text-[11px] font-black shadow-lg hover:scale-105 transition-transform">
                                Buat Promo
                            </button>
                        </div>
                        <Ticket className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
