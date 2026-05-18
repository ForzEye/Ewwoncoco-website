import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Users, Target, Sparkles, ArrowUpRight, ArrowDownRight, MoreHorizontal, PieChart as PieIcon, Activity } from 'lucide-react';

const data = [
    { name: 'Sen', sales: 4000, customers: 240 },
    { name: 'Sel', sales: 3000, customers: 198 },
    { name: 'Rab', sales: 5200, customers: 310 },
    { name: 'Kam', sales: 4780, customers: 280 },
    { name: 'Jum', sales: 5890, customers: 350 },
    { name: 'Sab', sales: 7490, customers: 490 },
    { name: 'Min', sales: 6300, customers: 410 },
];

const categoryData = [
    { name: 'Coconut Drink', value: 45 },
    { name: 'Dessert', value: 30 },
    { name: 'Topping', value: 25 },
];

const COLORS = ['#2D6A4F', '#00C48C', '#95D5B2'];

export default function Analytics() {
    return (
        <AdminLayout title="Intelijen Bisnis">
            <Head title="Analitik Performa - EWWON COCO" />
            
            <div className="space-y-10">
                {/* Insights Header — Stripe Style Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: 'Konversi', value: '12.5%', icon: Target, trend: '+2.4%', type: 'up', color: 'text-[#2D6A4F]', bg: 'bg-[#F0FAF6]' },
                        { label: 'Retensi', value: '68%', icon: Users, trend: '+1.8%', type: 'up', color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: 'Growth', value: '+24%', icon: TrendingUp, trend: '+5.2%', type: 'up', color: 'text-amber-500', bg: 'bg-amber-50' },
                        { label: 'Efisiensi', value: '89%', icon: Sparkles, trend: '-0.5%', type: 'down', color: 'text-purple-500', bg: 'bg-purple-50' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={24} strokeWidth={2.5} />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
                                    stat.type === 'up' ? 'text-[#00C48C] bg-[#F0FAF6]' : 'text-red-500 bg-red-50'
                                }`}>
                                    {stat.type === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className="text-[26px] font-black text-[#1A1A1A] font-poppins tracking-tighter">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Sales Trend — Sophisticated Area Chart */}
                    <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-[#F0F0F0] shadow-sm space-y-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-poppins font-black text-[20px] text-[#1A1A1A] tracking-tight">Evolusi Penjualan</h3>
                                <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-widest mt-1">Perbandingan traffic harian</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 mr-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]"></div>
                                    <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">Revenue</span>
                                </div>
                                <select className="bg-[#F9F9F9] border-none text-[11px] font-black uppercase tracking-widest rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#2D6A4F]/5">
                                    <option>7 Hari</option>
                                    <option>30 Hari</option>
                                    <option>90 Hari</option>
                                </select>
                            </div>
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.12}/>
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
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '15px 20px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="sales" 
                                        stroke="#2D6A4F" 
                                        strokeWidth={5} 
                                        fillOpacity={1} 
                                        fill="url(#colorSales)" 
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sales by Category — Premium Donut Chart */}
                    <div className="bg-[#1A1A1A] p-10 rounded-[48px] text-white shadow-2xl shadow-gray-200 flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="font-poppins font-black text-[20px] tracking-tight text-white">Share Kategori</h3>
                            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                                <PieIcon size={20} className="text-[#00C48C]" />
                            </div>
                        </div>
                        
                        <div className="h-[280px] w-full relative mb-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-white font-poppins">100%</span>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Market share</span>
                            </div>
                        </div>

                        <div className="space-y-4 mt-auto">
                            {categoryData.map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 hover:bg-white/5 rounded-2xl transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                                        <span className="text-[12px] font-black text-white/70 tracking-tight">{cat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-black text-white">{cat.value}%</span>
                                        <ArrowUpRight size={14} className="text-[#00C48C] opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Insights — High Impact Panel */}
                <div className="bg-gradient-to-br from-[#2D6A4F] to-[#40916C] p-10 rounded-[48px] text-white shadow-xl shadow-[#2D6A4F]/20 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="space-y-4 max-w-xl">
                            <div className="w-12 h-12 bg-white text-[#2D6A4F] rounded-2xl flex items-center justify-center shadow-lg">
                                <Activity size={24} strokeWidth={3} />
                            </div>
                            <h3 className="font-poppins font-black text-[24px] leading-tight">Insight Performa Minggu Ini</h3>
                            <p className="text-[13px] font-medium text-white/70 leading-relaxed uppercase tracking-widest">Penjualan kategori <span className="text-white font-black underline decoration-white/30">Dessert</span> meningkat 12% sejak peluncuran promo akhir pekan. Pertahankan stok kelapa premium untuk mengimbangi lonjakan permintaan.</p>
                        </div>
                        <button className="px-10 py-5 bg-[#1A1A1A] text-white font-black rounded-3xl text-[12px] uppercase tracking-[0.25em] shadow-2xl hover:scale-105 transition-transform">
                            Generate Report PDF
                        </button>
                    </div>
                    <Target className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
                </div>
            </div>
        </AdminLayout>
    );
}
