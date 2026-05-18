import React from 'react';
import { Head } from '@inertiajs/react';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { 
    TrendingUp, 
    Users, 
    ShoppingBag, 
    Store, 
    Crown, 
    Package, 
    CreditCard, 
    ArrowUpRight, 
    Calendar,
    MousePointer2
} from 'lucide-react';
import { rupiah, angka } from '../../lib/format';

interface AnalyticsProps {
    monthlyStats: any[];
    topMerchants: any[];
    topProducts: any[];
    paymentDistribution: any[];
}

export default function Analytics({ monthlyStats, topMerchants, topProducts, paymentDistribution }: AnalyticsProps) {
    const COLORS = ['#00C48C', '#3B82F6', '#FF8A00', '#A855F7'];

    return (
        <SuperAdminLayout>
            <Head title="System Analytics" />
            
            <div className="space-y-10 pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-poppins font-black text-charcoal flex items-center gap-3">
                            <TrendingUp className="text-[#00C48C]" size={32} />
                            Global System Analytics
                        </h2>
                        <p className="text-gray-500 mt-1 font-medium italic">Data real-time dari seluruh ekosistem Ewwon Coco.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                        <Calendar size={18} className="text-gray-400" />
                        <span className="text-xs font-bold text-charcoal uppercase tracking-widest">Update Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</span>
                    </div>
                </div>

                {/* Main Trends */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Revenue Multi-Line Chart */}
                    <div className="xl:col-span-8 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-poppins font-bold text-xl text-charcoal">Revenue Performance</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Laporan Pendapatan 6 Bulan Terakhir</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#00C48C]"></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">POS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Online</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyStats}>
                                    <defs>
                                        <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00C48C" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#00C48C" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF'}} tickFormatter={(val) => `Rp${val/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => rupiah(Number(value))}
                                    />
                                    <Area type="monotone" dataKey="pos" stroke="#00C48C" strokeWidth={4} fillOpacity={1} fill="url(#colorPos)" />
                                    <Area type="monotone" dataKey="online" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorOnline)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Order Distribution Pie */}
                    <div className="xl:col-span-4 bg-[#1A1A1A] p-8 rounded-[40px] text-white flex flex-col justify-between">
                        <div>
                            <h3 className="font-poppins font-bold text-xl">Payment Split</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Distribusi Metode Pembayaran</p>
                        </div>
                        
                        <div className="h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {paymentDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Total</span>
                                <span className="text-xl font-black">{angka(paymentDistribution.reduce((a, b) => a + b.value, 0))}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {paymentDistribution.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-xs font-bold text-gray-400">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black">{angka(item.value)} tx</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Rankings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Merchants */}
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-poppins font-bold text-xl text-charcoal flex items-center gap-3">
                                <Crown className="text-amber-500" />
                                Top Merchants
                            </h3>
                            <ArrowUpRight className="text-gray-300" size={24} />
                        </div>
                        <div className="space-y-4">
                            {topMerchants.length > 0 ? topMerchants.map((merchant, index) => (
                                <div key={merchant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-[#00C48C]/30 hover:bg-[#F0FAF6]/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-amber-100 text-amber-600' : 'bg-white text-gray-400 shadow-sm'}`}>
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-charcoal">{merchant.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Merchant Partner</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[#00C48C]">{rupiah(merchant.total_revenue)}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Omzet Terkonfirmasi</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center space-y-3">
                                    <Store className="mx-auto text-gray-200" size={48} />
                                    <p className="text-sm font-bold text-gray-400 italic">Belum ada data merchant yang aktif.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-poppins font-bold text-xl text-charcoal flex items-center gap-3">
                                <Package className="text-blue-500" />
                                Best Selling Products
                            </h3>
                            <MousePointer2 className="text-gray-300" size={24} />
                        </div>
                        <div className="space-y-4">
                            {topProducts.length > 0 ? topProducts.map((product, index) => (
                                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-charcoal">{product.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Product</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-blue-600">{angka(product.total_sold)} Terjual</p>
                                        <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 rounded-full" 
                                                style={{ width: `${Math.min(100, (product.total_sold / (topProducts[0].total_sold || 1)) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center space-y-3">
                                    <ShoppingBag className="mx-auto text-gray-200" size={48} />
                                    <p className="text-sm font-bold text-gray-400 italic">Belum ada transaksi terekam.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Global Stats Footer Card */}
                <div className="bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] p-10 rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-[#2D6A4F]/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10 max-w-xl">
                        <h4 className="text-2xl font-poppins font-black mb-3">Satu Dasbor, Seluruh Ekosistem.</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">Gunakan data di atas untuk mengambil keputusan strategis. Pantau merchant mana yang butuh dukungan tambahan dan produk apa yang paling diminati pasar saat ini.</p>
                    </div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Total Omzet</p>
                            <p className="text-3xl font-black tracking-tighter">{rupiah(monthlyStats.reduce((a, b) => a + b.revenue, 0))}</p>
                            <span className="text-[10px] font-black text-[#00C48C] bg-white/10 px-3 py-1 rounded-full mt-2 inline-block uppercase">6 Bulan Terakhir</span>
                        </div>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
