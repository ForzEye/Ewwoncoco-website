import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Order } from '../../../types';
import { rupiah, tanggalWaktu } from '../../../lib/format';
import { 
    ChevronLeft, 
    User, 
    Phone, 
    MapPin, 
    Clock, 
    Package, 
    CreditCard,
    CheckCircle,
    Truck,
    XCircle,
    ShoppingBag,
    Mail,
    ArrowRight
} from 'lucide-react';

interface OrderShowProps {
    order: Order;
}

import { confirmAction, toastSuccess } from '@/lib/swal';

export default function Show({ order }: OrderShowProps) {
    const [processing, setProcessing] = useState(false);

    const handleUpdateStatus = (status: string) => {
        confirmAction(
            'Ubah Status Pesanan?',
            `Apakah Anda yakin ingin mengubah status menjadi ${status}?`,
            'Ya, Ubah'
        ).then((result) => {
            if (result.isConfirmed) {
                setProcessing(true);
                router.post(route('admin.orders.status', order.id), { status }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toastSuccess('Status pesanan berhasil diperbarui!');
                    },
                    onFinish: () => setProcessing(false)
                });
            }
        });
    };

    const getStatusStep = () => {
        const statuses = ['pending', 'confirmed', 'preparing', order.delivery_type === 'pickup' ? 'ready_for_pickup' : 'on_delivery', 'delivered'];
        return statuses.indexOf(order.status);
    };

    const steps = [
        { id: 'pending', icon: Clock, label: 'Menunggu' },
        { id: 'confirmed', icon: CheckCircle, label: 'Diterima' },
        { id: 'preparing', icon: Package, label: 'Disiapkan' },
        { id: order.delivery_type === 'pickup' ? 'ready_for_pickup' : 'on_delivery', icon: order.delivery_type === 'pickup' ? ShoppingBag : Truck, label: order.delivery_type === 'pickup' ? 'Siap Ambil' : 'Dikirim' },
        { id: 'delivered', icon: CheckCircle, label: 'Selesai' }
    ];

    return (
        <AdminLayout title={`Detail Pesanan #${order.order_number}`}>
            <Head title={`Pesanan ${order.order_number} - EWWON COCO`} />

            <div className="mb-8">
                <Link 
                    href={route('admin.orders.index')} 
                    className="inline-flex items-center gap-3 text-[#A0A0A0] hover:text-[#2D6A4F] font-black uppercase tracking-widest text-[11px] transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center group-hover:bg-[#2D6A4F] group-hover:text-white transition-all shadow-sm">
                        <ChevronLeft size={16} strokeWidth={3} />
                    </div>
                    <span>Kembali ke Daftar</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Order Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Tracker — Premium Stepper */}
                    <div className="bg-white p-10 rounded-[40px] border border-[#F0F0F0] shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A]">Status Pesanan</h3>
                            <div className="px-3 py-1 bg-[#F0FAF6] text-[#2D6A4F] rounded-full text-[10px] font-black uppercase tracking-widest">
                                {order.status.replace('_', ' ')}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between relative px-4">
                            <div className="absolute top-[20px] left-10 right-10 h-[2px] bg-[#F5F5F5] z-0"></div>
                            <div 
                                className="absolute top-[20px] left-10 h-[2px] bg-gradient-to-r from-[#2D6A4F] to-[#40916C] z-0 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(45,106,79,0.3)]" 
                                style={{ width: `calc(${(getStatusStep() / (steps.length - 1)) * 100}% - 80px)` }}
                            ></div>
                            
                            {steps.map((step, idx) => (
                                <div key={step.id} className="relative z-10 flex flex-col items-center group">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                                        idx <= getStatusStep() 
                                            ? 'bg-[#2D6A4F] text-white rotate-[-4deg] scale-110 shadow-lg shadow-[#2D6A4F]/20' 
                                            : 'bg-white border-2 border-[#F5F5F5] text-[#D0D0D0]'
                                    }`}>
                                        <step.icon size={20} strokeWidth={2.5} />
                                    </div>
                                    <span className={`text-[10px] font-black mt-4 uppercase tracking-[0.15em] transition-colors duration-500 ${
                                        idx <= getStatusStep() ? 'text-[#1A1A1A]' : 'text-[#D0D0D0]'
                                    }`}>{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Items — Sophisticated List */}
                    <div className="bg-white rounded-[40px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-[#F8F8F8] flex items-center justify-between">
                            <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A]">Item Pesanan</h3>
                            <div className="w-10 h-10 bg-[#F9F9F9] rounded-xl flex items-center justify-center text-[#2D6A4F]">
                                <ShoppingBag size={20} />
                            </div>
                        </div>
                        <div className="divide-y divide-[#F8F8F8]">
                            {order.items?.map((item) => (
                                <div key={item.id} className="p-10 flex items-center justify-between group hover:bg-[#FAFAFA] transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-[#F9F9F9] border border-[#F0F0F0] rounded-[24px] overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                                            {item.product?.image_url ? (
                                                <img src={item.product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#D0D0D0] text-3xl">🥥</div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#1A1A1A] text-[16px] tracking-tight">{item.product?.name}</h4>
                                            <p className="text-[12px] font-bold text-[#B5AFA6] mt-1.5 uppercase tracking-wider">
                                                {item.quantity} <span className="mx-1">×</span> {rupiah(item.price)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[16px] font-black text-[#1A1A1A] tracking-tighter">{rupiah(item.subtotal)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-10 bg-[#FAFAFA] border-t border-[#F0F0F0]">
                            <div className="max-w-xs ml-auto space-y-4">
                                <div className="flex justify-between items-center text-[13px] font-bold text-[#8A8A8A]">
                                    <span className="uppercase tracking-widest">Subtotal</span>
                                    <span className="text-[#1A1A1A]">{rupiah(order.total)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px] font-bold text-[#8A8A8A]">
                                    <span className="uppercase tracking-widest">Pajak (0%)</span>
                                    <span className="text-[#1A1A1A]">Rp 0</span>
                                </div>
                                <div className="pt-6 border-t border-[#E8E8E8] flex justify-between items-center">
                                    <span className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Total Akhir</span>
                                    <span className="text-[24px] font-black text-[#2D6A4F] tracking-tighter font-poppins">{rupiah(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Customer & Actions */}
                <div className="space-y-8">
                    {/* Customer Card — Premium Profile */}
                    <div className="bg-white p-10 rounded-[40px] border border-[#F0F0F0] shadow-sm">
                        <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A] mb-8">Informasi Pelanggan</h3>
                        
                        <div className="flex items-center gap-5 mb-8 p-5 bg-[#F9F9F9] rounded-[32px] border border-[#F0F0F0]">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl font-black text-[#2D6A4F] rotate-[-3deg]">
                                {order.customer?.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-black text-[#1A1A1A] text-[16px] tracking-tight">{order.customer?.name}</p>
                                <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-wider mt-0.5">ID Pelanggan: #{order.customer_id}</p>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4">
                            <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-[#2D6A4F] flex-shrink-0">
                                    <Phone size={16} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest mb-1">Telepon</p>
                                    <p className="text-[13px] font-black text-[#1A1A1A]">{order.customer?.phone || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                                    <Mail size={16} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-[13px] font-black text-[#1A1A1A]">{order.customer?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
                                    {order.delivery_type === 'pickup' ? <ShoppingBag size={16} strokeWidth={2.5} /> : <MapPin size={16} strokeWidth={2.5} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest mb-1">
                                        {order.delivery_type === 'pickup' ? 'Lokasi Pengambilan' : 'Alamat Pengiriman'}
                                    </p>
                                    <p className="text-[13px] font-black text-[#1A1A1A] leading-relaxed">
                                        {order.delivery_type === 'pickup' ? (order.branch?.name || 'Ambil di Toko') : order.delivery_address}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                                    <CreditCard size={16} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest mb-1">Metode Pembayaran</p>
                                    <p className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-wider">{order.payment_method.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions — High Impact Buttons */}
                    <div className="bg-white p-10 rounded-[40px] border border-[#F0F0F0] shadow-sm space-y-4">
                        <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A] mb-6">Kelola Pesanan</h3>
                        
                        {order.status === 'pending' && (
                            <button 
                                onClick={() => handleUpdateStatus('confirmed')}
                                disabled={processing}
                                className="w-full py-5 bg-[#2D6A4F] text-white font-black rounded-3xl hover:bg-[#1B4332] transition-all disabled:opacity-50 shadow-xl shadow-[#2D6A4F]/20 flex items-center justify-center gap-3 group"
                            >
                                <CheckCircle size={20} strokeWidth={3} />
                                <span className="uppercase tracking-[0.2em] text-[12px]">Konfirmasi</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                        
                        {order.status === 'confirmed' && (
                            <button 
                                onClick={() => handleUpdateStatus('preparing')}
                                disabled={processing}
                                className="w-full py-5 bg-blue-500 text-white font-black rounded-3xl hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group"
                            >
                                <Package size={20} strokeWidth={3} />
                                <span className="uppercase tracking-[0.2em] text-[12px]">Siapkan Menu</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

                        {order.status === 'preparing' && (
                            <button 
                                onClick={() => handleUpdateStatus(order.delivery_type === 'pickup' ? 'ready_for_pickup' : 'on_delivery')}
                                disabled={processing}
                                className={`w-full py-5 ${order.delivery_type === 'pickup' ? 'bg-orange-500' : 'bg-purple-500'} text-white font-black rounded-3xl hover:opacity-90 transition-all disabled:opacity-50 shadow-xl flex items-center justify-center gap-3 group`}
                            >
                                {order.delivery_type === 'pickup' ? <ShoppingBag size={20} strokeWidth={3} /> : <Truck size={20} strokeWidth={3} />}
                                <span className="uppercase tracking-[0.2em] text-[12px]">{order.delivery_type === 'pickup' ? 'Siap Diambil' : 'Kirim Sekarang'}</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

                        {order.status === 'ready_for_pickup' && (
                            <button 
                                onClick={() => handleUpdateStatus('delivered')}
                                disabled={processing}
                                className="w-full py-5 bg-green-500 text-white font-black rounded-3xl hover:bg-green-600 transition-all disabled:opacity-50 shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 group"
                            >
                                <CheckCircle size={20} strokeWidth={3} />
                                <span className="uppercase tracking-[0.2em] text-[12px]">Selesaikan (Sudah Diambil)</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

                        {order.status === 'on_delivery' && (
                            <button 
                                onClick={() => handleUpdateStatus('delivered')}
                                disabled={processing}
                                className="w-full py-5 bg-green-500 text-white font-black rounded-3xl hover:bg-green-600 transition-all disabled:opacity-50 shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 group"
                            >
                                <CheckCircle size={20} strokeWidth={3} />
                                <span className="uppercase tracking-[0.2em] text-[12px]">Selesaikan</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

                        <button className="w-full py-5 bg-white border-2 border-[#F0F0F0] text-[#A0A0A0] font-black rounded-3xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-3">
                            <XCircle size={18} strokeWidth={3} />
                            <span className="uppercase tracking-[0.2em] text-[12px]">Batalkan</span>
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
