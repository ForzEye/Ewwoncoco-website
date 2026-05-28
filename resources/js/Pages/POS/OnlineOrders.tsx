import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { rupiah, tanggalWaktu } from '@/lib/format';
import { 
    ShoppingBag, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    ArrowRight, 
    ChevronRight,
    MapPin,
    Phone,
    User,
    Package,
    Timer,
    Check
} from 'lucide-react';

interface OnlineOrdersProps {
    orders: any[];
}

import { confirmAction, toastSuccess } from '@/lib/swal';

export default function OnlineOrders({ orders }: OnlineOrdersProps) {
    const { auth } = usePage<any>().props;
    const [processing, setProcessing] = useState<number | null>(null);

    useEffect(() => {
        // Fallback to merchant ID 1 if not defined to match backend default
        const merchantId = auth?.user?.merchant_id || 1;
        
        if (window.Echo) {
            const channel = window.Echo.private(`merchant.${merchantId}.orders`);
            
            channel.listen('.OrderPlaced', (e: any) => {
                console.log("New order placed:", e);
                toastSuccess('Ada Pesanan Online Baru Masuk!');
                router.reload({ only: ['orders'] });
            });

            return () => {
                channel.stopListening('.OrderPlaced');
                window.Echo.leave(`merchant.${merchantId}.orders`);
            };
        }
    }, [auth]);

    const handleAccept = (id: number) => {
        confirmAction(
            'Terima Pesanan?',
            'Apakah Anda yakin ingin menerima pesanan online ini?',
            'Ya, Terima'
        ).then((result) => {
            if (result.isConfirmed) {
                setProcessing(id);
                router.post(route('pos.online_orders.accept', id), {}, {
                    onSuccess: () => {
                        toastSuccess('Pesanan berhasil diterima!');
                    },
                    onFinish: () => setProcessing(null)
                });
            }
        });
    };

    const handleUpdateStatus = (id: number, status: string) => {
        setProcessing(id);
        router.post(route('pos.online_orders.status', id), { status }, {
            onFinish: () => setProcessing(null)
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'preparing': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'ready_for_pickup': return 'bg-green-50 text-green-600 border-green-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <AdminLayout title="Pesanan Online">
            <Head title="Pesanan Online Masuk" />
            
            <div className="p-8 h-full overflow-hidden flex flex-col bg-[#F9FAFB]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#2D6A4F] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#2D6A4F]/20">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-poppins font-black text-[#1A1A1A] tracking-tight">Pesanan Online Masuk</h1>
                                <p className="text-[#8A8A8A] text-xs font-bold uppercase tracking-widest mt-0.5">Kelola pesanan dari aplikasi pelanggan</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#F0F0F0] rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse"></div>
                        <span className="text-[11px] font-black text-[#1A1A1A]">{orders.length} Pesanan Aktif</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[32px] border border-[#F0F0F0] shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col md:flex-row group">
                            {/* Left Side: Order Info */}
                            <div className="p-8 border-b md:border-b-0 md:border-r border-[#F8F8F8] flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="px-4 py-1.5 bg-[#F5F3EF] text-[#1A1A1A] text-[11px] font-black rounded-xl border border-[#E8E4DD]">
                                            #{order.order_number}
                                        </span>
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                                            {order.status === 'pending' ? 'MASUK' : order.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-bold text-[#B5AFA6] flex items-center gap-1.5">
                                        <Clock size={14} />
                                        {tanggalWaktu(order.created_at)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-[#F9F9F9] flex items-center justify-center text-[#2D6A4F]">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-black text-[#1A1A1A]">{order.customer?.name}</p>
                                                <p className="text-[11px] font-bold text-[#B5AFA6]">{order.customer?.phone || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 bg-[#F9FAFB] p-4 rounded-2xl">
                                            <MapPin size={16} className="text-[#2D6A4F] mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest mb-1">Tipe: {order.delivery_type.toUpperCase()}</p>
                                                <p className="text-[12px] text-[#4B5563] font-medium leading-relaxed">{order.delivery_address || 'Ambil di Toko'}</p>
                                            </div>
                                        </div>
                                        {order.notes && (
                                            <div className="flex items-start gap-3 bg-amber-50/50 border border-amber-100/80 p-4 rounded-2xl mt-4">
                                                <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                                                    ✍️
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Catatan Pemesan</p>
                                                    <p className="text-[12px] text-amber-900 font-bold leading-relaxed">{order.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em]">Item Pesanan ({order.items.length})</p>
                                        <div className="space-y-3">
                                            {order.items.map((item: any) => (
                                                <div key={item.id} className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 bg-[#F5F3EF] rounded-lg flex items-center justify-center text-[11px] font-black text-[#2D6A4F] flex-shrink-0 mt-0.5">
                                                            {item.quantity}x
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-bold text-[#1A1A1A]">{item.product?.name}</span>
                                                            {item.notes && (
                                                                <span className="text-[11px] text-[#8C5E3C] bg-[#FAF3EC] border border-[#F0E2D3] px-2 py-0.5 rounded-lg mt-1 font-semibold inline-block w-fit">
                                                                    Catatan: {item.notes}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-[13px] font-mono font-bold text-[#1A1A1A] flex-shrink-0 mt-1">{rupiah(item.subtotal)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-4 border-t border-[#F8F8F8] flex justify-between items-center">
                                            <span className="text-[11px] font-black text-[#B5AFA6] uppercase tracking-widest">Total Bayar</span>
                                            <span className="text-[18px] font-black text-[#2D6A4F] tracking-tighter">{rupiah(order.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Actions */}
                            <div className="p-8 bg-[#FAFAFA]/50 w-full md:w-64 flex flex-col justify-center gap-3">
                                {order.status === 'pending' && (
                                    <button 
                                        onClick={() => handleAccept(order.id)}
                                        disabled={processing === order.id}
                                        className="w-full py-4 bg-[#2D6A4F] text-white font-black text-[13px] rounded-2xl shadow-lg shadow-[#2D6A4F]/10 hover:bg-[#1B4332] transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Check size={18} />
                                        ACC PESANAN
                                    </button>
                                )}
                                
                                {order.status === 'confirmed' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                        disabled={processing === order.id}
                                        className="w-full py-4 bg-indigo-600 text-white font-black text-[13px] rounded-2xl shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Timer size={18} />
                                        PROSES (MASAK)
                                    </button>
                                )}

                                {order.status === 'preparing' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(order.id, 'ready_for_pickup')}
                                        disabled={processing === order.id}
                                        className="w-full py-4 bg-[#2D6A4F] text-white font-black text-[13px] rounded-2xl shadow-lg shadow-[#2D6A4F]/10 hover:bg-[#1B4332] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Package size={18} />
                                        SIAP DIAMBIL
                                    </button>
                                )}

                                {order.status === 'ready_for_pickup' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                        disabled={processing === order.id}
                                        className="w-full py-4 bg-gray-800 text-white font-black text-[13px] rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={18} />
                                        SELESAI (DIAMBIL)
                                    </button>
                                )}

                                {order.status === 'pending' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                        disabled={processing === order.id}
                                        className="w-full py-4 bg-white border-2 border-red-100 text-red-500 font-black text-[13px] rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        TOLAK
                                    </button>
                                )}

                                <p className="text-[9px] font-black text-[#B5AFA6] text-center uppercase tracking-widest mt-2">
                                    Metode: <span className="text-[#1A1A1A]">{order.payment_method.toUpperCase()}</span>
                                </p>
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-[48px] border-2 border-dashed border-[#F0F0F0]">
                            <div className="w-24 h-24 bg-[#F9FAFB] rounded-[40px] flex items-center justify-center text-[#D0D0D0] mb-8">
                                <Package size={48} />
                            </div>
                            <h3 className="text-xl font-black text-[#1A1A1A]">Belum Ada Pesanan Masuk</h3>
                            <p className="text-sm font-bold text-[#B5AFA6] mt-2">Semua pesanan pelanggan sudah diproses.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
