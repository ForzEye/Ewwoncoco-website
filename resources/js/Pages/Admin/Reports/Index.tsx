import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { 
    Download, 
    Printer, 
    TrendingUp, 
    ShoppingBag, 
    Calendar,
    Filter,
    ArrowUpRight,
    Monitor,
    Globe,
    CheckCircle2,
    PieChart as PieChartIcon,
    BarChart3,
    Sparkles,
    ChevronRight,
    FileText,
    QrCode,
    CreditCard,
    Phone
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';
import { rupiah, tanggalWaktu, angka } from '../../../lib/format';
import { Merchant } from '@/types';

interface ReportsProps {
    summary: {
        total_revenue: number;
        total_orders: number;
        online_revenue: number;
        pos_revenue: number;
        cash_revenue: number;
        qris_revenue: number;
        total_hpp: number;
        gross_profit: number;
        profit_margin: number;
    };
    chartData: any[];
    topProducts: any[];
    recentTransactions: any[];
    merchant: Merchant;
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function Reports({ summary, chartData, topProducts, recentTransactions, merchant, filters }: ReportsProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.reports.index'), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const handleExport = () => {
        window.location.href = route('admin.reports.export', { start_date: startDate, end_date: endDate });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AdminLayout title="Analisis Keuangan">
            <Head title="Laporan & Analisis - EWWON COCO" />

            <div className="space-y-10 no-print">
                {/* Header Actions — Sophisticated */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight font-poppins">Laporan Bisnis</h2>
                        <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-[0.2em] mt-1">Pantau performa penjualan secara komprehensif</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-3 px-6 py-3.5 bg-white border border-[#F0F0F0] rounded-2xl text-[12px] font-black text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F9F9F9] transition-all shadow-sm"
                        >
                            <Download size={18} strokeWidth={2.5} />
                            <span className="uppercase tracking-widest">Excel</span>
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-3 px-8 py-3.5 bg-[#1A1A1A] text-white rounded-2xl text-[12px] font-black hover:bg-[#2D6A4F] transition-all shadow-xl shadow-gray-200 group"
                        >
                            <Printer size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                            <span className="uppercase tracking-widest">Cetak Laporan</span>
                        </button>
                    </div>
                </div>

                {/* Filter Bar — Integrated Design */}
                <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-8">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Calendar size={12} /> Periode Mulai
                            </label>
                            <input 
                                type="date" 
                                className="px-6 py-3.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[13px] font-black outline-none transition-all"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Calendar size={12} /> Periode Selesai
                            </label>
                            <input 
                                type="date" 
                                className="px-6 py-3.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[13px] font-black outline-none transition-all"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit"
                            className="px-8 py-4 bg-[#2D6A4F] text-white font-black rounded-2xl text-[11px] hover:bg-[#1B4332] transition-all flex items-center gap-3 uppercase tracking-[0.2em] shadow-lg shadow-[#2D6A4F]/15"
                        >
                            <Filter size={18} strokeWidth={3} />
                            Terapkan Filter
                        </button>
                    </form>
                </div>

                {/* Summary Grid — Glassmorphism Effect */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-[#2D6A4F]/5 transition-all group">
                        <div className="w-12 h-12 bg-[#F0FAF6] text-[#2D6A4F] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} strokeWidth={2.5} />
                        </div>
                        <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Gross Revenue</p>
                        <h3 className="text-[24px] font-black text-[#1A1A1A] font-poppins tracking-tighter">{rupiah(summary.total_revenue)}</h3>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={24} strokeWidth={2.5} />
                        </div>
                        <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Volume Penjualan</p>
                        <h3 className="text-[24px] font-black text-[#1A1A1A] font-poppins tracking-tighter">{angka(summary.total_orders)} <span className="text-[11px] font-bold text-[#B5AFA6] tracking-normal">Trx</span></h3>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-green-500/5 transition-all group">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <CreditCard size={24} strokeWidth={2.5} />
                        </div>
                        <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Total Tunai (Cash)</p>
                        <h3 className="text-[24px] font-black text-[#1A1A1A] font-poppins tracking-tighter">{rupiah(summary.cash_revenue)}</h3>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <QrCode size={24} strokeWidth={2.5} />
                        </div>
                        <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Total Non-Tunai (QRIS)</p>
                        <h3 className="text-[24px] font-black text-[#1A1A1A] font-poppins tracking-tighter">{rupiah(summary.qris_revenue)}</h3>
                    </div>
                </div>

                {/* BI & Profitability Section — NEW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#FAFAF8] p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm group">
                        <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Estimasi HPP (COGS)</p>
                        <h3 className="text-[22px] font-black text-[#1A1A1A] font-poppins tracking-tighter">{rupiah(summary.total_hpp)}</h3>
                        <p className="text-[9px] text-gray-400 mt-2 font-medium italic">* Berdasarkan resep & harga beli rata-rata bahan.</p>
                    </div>

                    <div className="bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] p-8 rounded-[40px] shadow-lg shadow-[#2D6A4F]/20 group">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.15em] mb-1">Laba Kotor (Gross Profit)</p>
                        <h3 className="text-[24px] font-black text-white font-poppins tracking-tighter">{rupiah(summary.gross_profit)}</h3>
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-full">
                            <ArrowUpRight size={12} className="text-[#00C48C]" />
                            <span className="text-[10px] font-black text-[#00C48C]">{summary.profit_margin.toFixed(1)}% Margin</span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Efisiensi Stok</p>
                            <h3 className="text-[20px] font-black text-[#1A1A1A] font-poppins tracking-tighter">Sangat Baik</h3>
                        </div>
                        <div className="w-14 h-14 rounded-full border-4 border-[#00C48C] border-t-transparent animate-spin-slow flex items-center justify-center">
                            <CheckCircle2 size={24} className="text-[#00C48C]" />
                        </div>
                    </div>
                </div>

                {/* Charts Section — Sophisticated Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Trend Area Chart */}
                    <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-[#F0F0F0] shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="font-poppins font-black text-[20px] text-[#1A1A1A] tracking-tight">Tren Pendapatan</h3>
                                <p className="text-[11px] font-bold text-[#B5AFA6] mt-1 uppercase tracking-wider">Perbandingan performa harian</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#2D6A4F]"></div>
                                    <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">Total Sales</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F8F8F8" />
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
                                        tickFormatter={(val) => `Rp${val/1000}k`}
                                    />
                                    <Tooltip 
                                        contentStyle={{
                                            borderRadius: '24px', 
                                            border: 'none', 
                                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                                            padding: '15px 20px'
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="total" 
                                        stroke="#2D6A4F" 
                                        strokeWidth={5} 
                                        fillOpacity={1} 
                                        fill="url(#colorRevenue)" 
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Products Bar Chart */}
                    <div className="bg-[#1A1A1A] p-10 rounded-[48px] text-white shadow-2xl shadow-gray-200 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="font-poppins font-black text-[20px] tracking-tight text-white">Menu Terlaris</h3>
                                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <Sparkles size={20} className="text-[#00C48C]" />
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {topProducts.slice(0, 5).map((p, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-end mb-2.5">
                                            <span className="text-[12px] font-black tracking-tight flex items-center gap-3">
                                                <span className="text-white/30 text-[10px] font-black">0{i+1}</span>
                                                {p.name}
                                            </span>
                                            <span className="text-[11px] font-black text-[#00C48C]">{angka(p.sold)} Terjual</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-[#00C48C] to-[#2D6A4F] rounded-full transition-all duration-1000 ease-out" 
                                                style={{ width: `${(p.sold / (topProducts[0]?.sold || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-12 py-4 bg-white/5 border border-white/10 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-[#1A1A1A] transition-all">
                                Lihat Laporan Lengkap
                            </button>
                        </div>
                        <BarChart3 className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 -rotate-12" />
                    </div>
                </div>

                {/* Recent Activity Table — Premium Detail */}
                <div className="bg-white rounded-[48px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                    <div className="p-10 border-b border-[#F8F8F8] flex items-center justify-between">
                        <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A]">Transaksi Terakhir</h3>
                        <Link href={route('admin.orders.index')} className="text-[11px] font-black text-[#2D6A4F] uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                            Semua Transaksi <ChevronRight size={14} strokeWidth={3} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#F9F9F9]/50">
                                    <th className="px-10 py-5 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">ID Transaksi</th>
                                    <th className="px-10 py-5 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Waktu</th>
                                    <th className="px-10 py-5 text-center text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Sumber</th>
                                    <th className="px-10 py-5 text-center text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Metode</th>
                                    <th className="px-10 py-5 text-right text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F8F8F8]">
                                {recentTransactions.slice(0, 8).map((trx, i) => (
                                    <tr key={i} className="hover:bg-[#FAFAFA] transition-all group">
                                        <td className="px-10 py-6 whitespace-nowrap text-[13px] font-black text-[#2D6A4F] font-mono tracking-tighter">
                                            {trx.trx_no}
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <span className="text-[11px] font-bold text-[#8A8A8A] uppercase">{tanggalWaktu(trx.date)}</span>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                trx.type === 'ONLINE' ? 'bg-[#F0FAF6] text-[#2D6A4F]' : 'bg-blue-50 text-blue-500'
                                            }`}>
                                                {trx.type}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap text-center">
                                            <span className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-wider">{trx.payment_method}</span>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap text-right">
                                            <span className="text-[14px] font-black text-[#1A1A1A] tracking-tighter">{rupiah(trx.total)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Print Section — High-End Formal PDF Style */}
            <div className="print-only hidden p-4 bg-white text-black font-inter leading-tight">
                {/* Formal Header */}
                <div className="flex justify-between items-start border-b-[6px] border-[#1A1A1A] pb-8 mb-10">
                    <div className="flex items-center gap-8">
                        <div className="w-28 h-28 bg-[#1A1A1A] text-white rounded-[32px] flex items-center justify-center text-5xl shadow-xl shadow-gray-200">
                            🥥
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-3">{merchant?.name || 'EWWON COCO'}</h1>
                            <p className="text-[14px] font-black text-[#2D6A4F] uppercase tracking-[0.4em]">{merchant?.category || 'Premium Coconut Drink'}</p>
                            <div className="mt-4 flex items-center gap-6 text-[12px] font-bold text-gray-500">
                                <span className="flex items-center gap-1.5"><MapPin size={12} /> {merchant?.address || 'Outlet Pusat, Indonesia'}</span>
                                <span className="flex items-center gap-1.5"><Phone size={12} /> {merchant?.phone || '-'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-[32px] font-black text-gray-300 uppercase tracking-tighter mb-5 italic">Financial Analysis</h2>
                        <div className="space-y-2 bg-[#F9F9F9] p-6 rounded-3xl border border-[#F0F0F0]">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Periode Laporan</p>
                            <p className="text-[15px] font-black text-[#1A1A1A]">
                                {new Date(filters.start_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})} — {new Date(filters.end_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-3 italic font-bold">Generated: {new Date().toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>

                {/* Summary Grid for Print */}
                <div className="grid grid-cols-4 gap-6 mb-12">
                    <div className="bg-[#F9F9F9] p-6 rounded-3xl border border-[#F0F0F0]">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Pendapatan</p>
                        <p className="text-2xl font-black text-[#1A1A1A] tracking-tighter">{rupiah(summary.total_revenue)}</p>
                    </div>
                    <div className="bg-[#F9F9F9] p-6 rounded-3xl border border-[#F0F0F0]">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Pencapaian QRIS</p>
                        <p className="text-2xl font-black text-blue-600 tracking-tighter">{rupiah(summary.qris_revenue)}</p>
                    </div>
                    <div className="bg-[#F0FAF6] p-6 rounded-3xl border border-[#2D6A4F]/10">
                        <p className="text-[9px] font-black text-[#2D6A4F] uppercase tracking-widest mb-2">Pencapaian Tunai</p>
                        <p className="text-2xl font-black text-[#2D6A4F] tracking-tighter">{rupiah(summary.cash_revenue)}</p>
                    </div>
                    <div className="bg-[#F9F9F9] p-6 rounded-3xl border border-[#F0F0F0]">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Transaksi</p>
                        <p className="text-2xl font-black text-[#1A1A1A] tracking-tighter">{angka(summary.total_orders)} <span className="text-[10px] font-normal uppercase tracking-normal">Unit</span></p>
                    </div>
                </div>

                <div className="flex gap-10">
                    <div className="print-main-content space-y-6">
                        <h3 className="text-[13px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                            <FileText size={18} className="text-[#2D6A4F]" /> Rincian Transaksi Terakhir
                        </h3>
                        <table className="w-full text-left border-collapse rounded-3xl overflow-hidden border border-[#F0F0F0]">
                            <thead>
                                <tr className="bg-[#1A1A1A] text-white">
                                    <th className="py-4 px-5 text-[9px] font-black uppercase tracking-widest">No.</th>
                                    <th className="py-4 px-5 text-[9px] font-black uppercase tracking-widest">ID Trx</th>
                                    <th className="py-4 px-5 text-[9px] font-black uppercase tracking-widest">Waktu</th>
                                    <th className="py-4 px-5 text-[9px] font-black uppercase tracking-widest text-center">Sumber</th>
                                    <th className="py-4 px-5 text-[9px] font-black uppercase tracking-widest text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F0F0]">
                                {recentTransactions.map((trx, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                                        <td className="py-4 px-5 text-[11px] font-bold text-gray-400">{i + 1}</td>
                                        <td className="py-4 px-5 text-[11px] font-black font-mono text-[#2D6A4F]">{trx.trx_no}</td>
                                        <td className="py-4 px-5 text-[11px] font-bold text-gray-600">{new Date(trx.date).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}</td>
                                        <td className="py-4 px-5 text-center">
                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${trx.type === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {trx.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-[12px] font-black text-right">{rupiah(trx.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="print-sidebar space-y-10">
                        <div className="space-y-6">
                            <h3 className="text-[13px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                <Sparkles size={18} className="text-amber-500" /> Analisis Produk
                            </h3>
                            <div className="space-y-4 bg-[#F9F9F9] p-6 rounded-3xl border border-[#F0F0F0]">
                                {topProducts.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-lg bg-white border border-[#E8E8E8] text-[10px] font-black flex items-center justify-center shadow-sm">0{i+1}</span>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-tight">{p.name}</p>
                                                <p className="text-[9px] text-[#B5AFA6] font-bold mt-0.5">{angka(p.sold)} Unit Terjual</p>
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-black text-[#2D6A4F]">{rupiah(p.revenue)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="signature-section pt-16 mt-auto">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="text-center">
                                    <div className="h-24 border-b-2 border-[#F0F0F0] mb-3"></div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#B5AFA6]">Financial Manager</p>
                                </div>
                                <div className="text-center">
                                    <div className="h-24 border-b-2 border-[#F0F0F0] mb-3"></div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#B5AFA6]">Store Owner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    .print-only { 
                        display: block !important; 
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    body { 
                        background: white !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        -webkit-print-color-adjust: exact; 
                    }
                    @page { 
                        size: A4 landscape; 
                        margin: 15mm; 
                    }
                    table { 
                        page-break-inside: auto;
                        width: 100% !important;
                    }
                    tr { 
                        page-break-inside: avoid; 
                        page-break-after: auto; 
                    }
                    thead { 
                        display: table-header-group; 
                    }
                    tfoot { 
                        display: table-footer-group; 
                    }
                    .grid {
                        display: flex !important;
                        flex-direction: row !important;
                        flex-wrap: wrap !important;
                    }
                    .print-main-content {
                        width: 65% !important;
                        padding-right: 20px !important;
                    }
                    .print-sidebar {
                        width: 35% !important;
                    }
                    .signature-section {
                        page-break-inside: avoid;
                        margin-top: 60px;
                        border-top: 1px solid #EEE;
                        padding-top: 20px;
                    }
                }
            `}} />
        </AdminLayout>
    );
}

function MapPin({ size, className }: { size?: number, className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
}
