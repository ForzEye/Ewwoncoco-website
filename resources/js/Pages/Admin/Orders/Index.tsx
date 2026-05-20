import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Order } from '../../../types';
import { rupiah, tanggalWaktu, angka } from '../../../lib/format';
import { Eye, CheckCircle, Truck, Package, Clock, XCircle, Search, Filter, ShoppingBag, ArrowUpRight, MoreHorizontal } from 'lucide-react';

interface OrdersIndexProps {
    orders: Order[];
}

import { confirmAction, toastSuccess } from '@/lib/swal';

export default function Index({ orders }: OrdersIndexProps) {

    const handleUpdateStatus = (id: number, status: string) => {
        confirmAction(
            'Ubah Status Pesanan?',
            `Apakah Anda yakin ingin mengubah status pesanan menjadi ${status}?`,
            'Ya, Ubah'
        ).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.orders.status', id), { status }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toastSuccess('Status pesanan berhasil diperbarui!');
                    }
                });
            }
        });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'Menunggu', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock };
            case 'confirmed': return { label: 'Dikonfirmasi', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: CheckCircle };
            case 'preparing': return { label: 'Diproses', color: 'bg-purple-50 text-purple-600 border-purple-100', icon: Package };
            case 'ready_for_pickup': return { label: 'Siap Diambil', color: 'bg-orange-50 text-orange-600 border-orange-100', icon: ShoppingBag };
            case 'on_delivery': return { label: 'Dikirim', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: Truck };
            case 'delivered': return { label: 'Selesai', color: 'bg-green-50 text-green-600 border-green-100', icon: CheckCircle };
            case 'cancelled': return { label: 'Dibatalkan', color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle };
            default: return { label: status, color: 'bg-gray-50 text-gray-600 border-gray-100', icon: Clock };
        }
    };

    return (
        <AdminLayout title="Manajemen Pesanan">
            <Head title="Daftar Pesanan - EWWON COCO" />

            <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight font-poppins">Pesanan Pelanggan</h1>
                    <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-[0.2em] mt-1">Total {angka(orders.length)} pesanan aktif</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D0D0D0] group-focus-within:text-[#2D6A4F] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari No. Pesanan..." 
                            className="w-full lg:w-72 pl-12 pr-6 py-3.5 bg-white border border-[#F0F0F0] rounded-2xl text-[13px] font-bold focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 outline-none transition-all placeholder:text-[#D0D0D0]"
                        />
                    </div>
                    
                    <button className="p-3.5 bg-white border border-[#F0F0F0] rounded-2xl text-[#8A8A8A] hover:text-[#2D6A4F] hover:border-[#2D6A4F] transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Table Container — Premium Design */}
            <div className="bg-white rounded-[40px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#F8F8F8]">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Pesanan</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Pelanggan</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Metode</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Total</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F8F8F8]">
                            {orders.map((order) => {
                                const status = getStatusConfig(order.status);
                                return (
                                    <tr key={order.id} className="hover:bg-[#FAFAFA] transition-all group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black text-[#2D6A4F] font-mono tracking-tighter">{order.order_number}</span>
                                                <span className="text-[10px] font-bold text-[#B5AFA6] mt-1 uppercase tracking-wider">{tanggalWaktu(order.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#F9F9F9] border border-[#F0F0F0] flex items-center justify-center text-[13px] font-black text-[#8A8A8A]">
                                                    {order.customer?.name ? order.customer.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-black text-[#1A1A1A] tracking-tight">{order.customer?.name || 'Pelanggan Umum'}</p>
                                                    <p className="text-[10px] font-bold text-[#B5AFA6] mt-0.5">{order.branch?.name || 'Cabang Utama'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col gap-2 items-start">
                                                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${status.color}`}>
                                                    <status.icon size={12} strokeWidth={3} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${order.delivery_type === 'pickup' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {order.delivery_type === 'pickup' ? '🏘️ Ambil Sendiri' : '🚚 Delivery'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className="text-[11px] font-black text-[#8A8A8A] uppercase tracking-wider bg-[#F9F9F9] px-2 py-1 rounded-lg">
                                                {order.payment_method === 'cash' ? '💵 Tunai' : '📱 QRIS'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <p className="text-[14px] font-black text-[#1A1A1A] tracking-tighter">{rupiah(order.total)}</p>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {order.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                                        className="w-10 h-10 flex items-center justify-center bg-[#F0FAF6] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white rounded-xl transition-all shadow-sm"
                                                        title="Konfirmasi Pesanan"
                                                    >
                                                        <CheckCircle size={16} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                                {order.status === 'confirmed' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                                        className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                        title="Mulai Proses"
                                                    >
                                                        <Package size={16} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                                {order.status === 'preparing' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.id, order.delivery_type === 'pickup' ? 'ready_for_pickup' : 'on_delivery')}
                                                        className="w-10 h-10 flex items-center justify-center bg-purple-50 text-purple-500 hover:bg-purple-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                        title={order.delivery_type === 'pickup' ? "Siap Diambil" : "Kirim Pesanan"}
                                                    >
                                                        {order.delivery_type === 'pickup' ? <ShoppingBag size={16} strokeWidth={2.5} /> : <Truck size={16} strokeWidth={2.5} />}
                                                    </button>
                                                )}
                                                {order.status === 'ready_for_pickup' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                                        className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                        title="Selesaikan (Sudah Diambil)"
                                                    >
                                                        <CheckCircle size={16} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                                {order.status === 'on_delivery' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                                        className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                        title="Selesaikan"
                                                    >
                                                        <CheckCircle size={16} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                                <Link 
                                                    href={route('admin.orders.show', order.id)}
                                                    className="w-10 h-10 flex items-center justify-center bg-white border border-[#F0F0F0] text-[#A0A0A0] hover:text-[#1A1A1A] hover:border-[#1A1A1A] rounded-xl shadow-sm transition-all"
                                                >
                                                    <Eye size={16} strokeWidth={2.5} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {orders.length === 0 && (
                    <div className="p-20 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-[#F9F9F9] rounded-[32px] flex items-center justify-center text-[#D0D0D0] mb-6">
                            <ShoppingBag size={40} />
                        </div>
                        <h3 className="text-lg font-black text-[#1A1A1A]">Belum Ada Pesanan</h3>
                        <p className="text-xs font-bold text-[#B5AFA6] mt-2 max-w-xs text-center leading-relaxed">Saat ini belum ada pesanan masuk dari aplikasi pelanggan.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
