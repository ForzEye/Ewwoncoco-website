import React from 'react';
import { Head } from '@inertiajs/react';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';
import { ShoppingBag, Search, Filter, Calendar, ExternalLink, CheckCircle2, Clock, XCircle, User, Store } from 'lucide-react';
import { rupiah, angka } from '../../lib/format';

interface Order {
    id: number;
    order_number: string;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
    merchant: { name: string };
    customer: { name: string };
    branch: { name: string };
}

interface OrdersProps {
    orders: {
        data: Order[];
        links: any[];
    };
}

export default function Orders({ orders }: OrdersProps) {
    const getStatusBadge = (status: string) => {
        const styles: { [key: string]: string } = {
            'pending': 'bg-amber-100 text-amber-700',
            'confirmed': 'bg-blue-100 text-blue-700',
            'processing': 'bg-indigo-100 text-indigo-700',
            'ready': 'bg-purple-100 text-purple-700',
            'delivered': 'bg-emerald-100 text-emerald-700',
            'cancelled': 'bg-red-100 text-red-700',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    return (
        <SuperAdminLayout>
            <Head title="Global Orders Management" />
            
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-poppins font-bold text-charcoal flex items-center gap-3">
                            <ShoppingBag className="text-[#00C48C]" size={32} />
                            Global Orders
                        </h2>
                        <p className="text-gray-500 mt-1">Monitoring seluruh transaksi online di ekosistem Ewwon Coco.</p>
                    </div>
                </div>

                {/* Filters Placeholder */}
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari No. Pesanan atau Merchant..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#00C48C]/20 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pesanan & Waktu</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Merchant & Cabang</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-charcoal group-hover:text-[#00C48C] transition-colors">{order.order_number}</p>
                                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                                                <Calendar size={12} />
                                                {new Date(order.created_at).toLocaleString('id-ID')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                                                    <Store size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-charcoal">{order.merchant?.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{order.branch?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                                                    <User size={16} />
                                                </div>
                                                <p className="text-sm font-bold text-charcoal">{order.customer?.name || 'Guest'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-charcoal">{rupiah(order.total)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{order.payment_status}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="p-2 hover:bg-[#00C48C]/10 text-gray-400 hover:text-[#00C48C] rounded-xl transition-all">
                                                <ExternalLink size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {orders.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="space-y-3">
                                                <ShoppingBag className="mx-auto text-gray-200" size={48} />
                                                <p className="text-sm font-bold text-gray-400 italic">Belum ada pesanan masuk.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
