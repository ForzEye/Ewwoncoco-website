import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AIInsights from '../../Components/Admin/AIInsights';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';
import { 
    Users, 
    Store, 
    ShoppingBag, 
    Monitor, 
    TrendingUp,
    DollarSign
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { rupiah } from '../../lib/format';

interface DashboardProps {
    stats: {
        total_users: number;
        total_merchants: number;
        total_orders: number;
        total_pos: number;
        total_revenue: number;
        today_orders: number;
        today_revenue: number;
    };
    chartData: any[];
    insights: any[];
}

export default function Dashboard({ stats, chartData, insights }: DashboardProps) {
    const statCards = [
        { label: 'Total Pengguna', value: stats.total_users, icon: Users, color: 'bg-blue-500', href: '/super-admin/users' },
        { label: 'Total Merchant', value: stats.total_merchants, icon: Store, color: 'bg-purple-500', href: '/super-admin/merchants' },
        { label: 'Pesanan Online', value: stats.total_orders, icon: ShoppingBag, color: 'bg-[#00C48C]', href: '/super-admin/orders' },
        { label: 'Transaksi POS', value: stats.total_pos, icon: Monitor, color: 'bg-orange-500', href: '/pos/history' },
    ];

    return (
        <SuperAdminLayout>
            <Head title="Super Admin Dashboard" />
            
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-poppins font-bold text-charcoal">Global Overview</h2>
                        <p className="text-gray-500 mt-1">Monitoring seluruh performa ekosistem Ewwon Coco.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="bg-[#1A1A1A] p-5 rounded-2xl text-white flex items-center space-x-4 shadow-xl relative overflow-hidden group min-w-[200px]">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
                                <ShoppingBag size={24} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pesanan Hari Ini</p>
                                <p className="text-xl font-black">{stats.today_orders} Pesanan</p>
                            </div>
                        </div>
                        <div className="bg-[#1A1A1A] p-5 rounded-2xl text-white flex items-center space-x-4 shadow-xl relative overflow-hidden group min-w-[200px]">
                            <div className="w-10 h-10 rounded-xl bg-[#00C48C]/20 text-[#00C48C] flex items-center justify-center">
                                <DollarSign size={24} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Omzet Hari Ini</p>
                                <p className="text-xl font-black">{rupiah(stats.today_revenue)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <AIInsights insights={insights} />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, i) => (
                        <Link 
                            key={i} 
                            href={card.href}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-100 hover:-translate-y-1 transition-all flex items-center space-x-4 group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${card.color} text-white flex items-center justify-center shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
                                <card.icon size={28} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">{card.label}</p>
                                <p className="text-2xl font-black text-charcoal">{card.value.toLocaleString()}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Main Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-[#F0FAF6] text-[#00C48C] flex items-center justify-center">
                                    <TrendingUp size={24} />
                                </div>
                                <h3 className="font-poppins font-bold text-xl text-charcoal">Revenue Trend (7 Days)</h3>
                            </div>
                            <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                <button className="px-3 py-1 text-[10px] font-bold bg-white shadow-sm rounded-md text-charcoal">Weekly</button>
                                <button className="px-3 py-1 text-[10px] font-bold text-gray-400 hover:text-charcoal transition-colors">Monthly</button>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            {chartData && chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00C48C" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#00C48C" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}}
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}}
                                            tickFormatter={(value) => `Rp${value/1000}k`}
                                        />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                            formatter={(value: any) => [rupiah(Number(value)), 'Revenue']}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#00C48C" 
                                            strokeWidth={4}
                                            fillOpacity={1} 
                                            fill="url(#colorRevenue)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">Belum ada data transaksi</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#1A1A1A] rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <TrendingUp size={200} />
                        </div>
                        
                        <div className="relative space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-[#00C48C] flex items-center justify-center">
                                <DollarSign size={28} />
                            </div>
                            <h3 className="text-2xl font-poppins font-bold leading-tight">Proyeksi Penjualan Bulan Ini</h3>
                            <p className="text-gray-400 text-sm">Berdasarkan data 7 hari terakhir, sistem memprediksi kenaikan sebesar <span className="text-[#00C48C] font-bold">12.5%</span> di akhir bulan.</p>
                        </div>

                        <div className="relative pt-12 space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                                <span>Pencapaian Target</span>
                                <span>82%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00C48C] w-[82%] rounded-full shadow-[0_0_15px_rgba(0,196,140,0.5)]"></div>
                            </div>
                            <Link 
                                href="/super-admin/analytics"
                                className="w-full mt-4 py-4 bg-[#00C48C] hover:bg-[#00ab7a] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#00C48C]/20 flex items-center justify-center"
                            >
                                Lihat Laporan Lengkap
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
