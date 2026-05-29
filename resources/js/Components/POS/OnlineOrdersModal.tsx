import React from 'react';
import { X, CheckCircle, Clock, MapPin, Printer, Eye, AlertTriangle } from 'lucide-react';
import { rupiah, tanggal } from '../../lib/format';
import axios from 'axios';
import ReceiptModal from './ReceiptModal';

interface OnlineOrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: any[];
    onUpdate: () => void;
}

import { toastSuccess, toastError, toastWarning } from '../../lib/swal';

export default function OnlineOrdersModal({ isOpen, onClose, orders, onUpdate }: OnlineOrdersModalProps) {
    const [processingId, setProcessingId] = React.useState<number | null>(null);
    const [reviewedIds, setReviewedIds] = React.useState<number[]>([]);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [rejectOrderId, setRejectOrderId] = React.useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = React.useState('');
    const [receiptOrder, setReceiptOrder] = React.useState<any | null>(null);

    if (!isOpen) return null;

    const handleAccept = async (orderId: number) => {
        if (!reviewedIds.includes(orderId)) {
            toastWarning('Harap tinjau bukti pembayaran terlebih dahulu!');
            return;
        }
        
        setProcessingId(orderId);
        try {
            await axios.post(route('pos.online_orders.accept', orderId));
            onUpdate();
            toastSuccess('Pesanan diterima! Mencetak struk dapur...');
        } catch (error) {
            console.error(error);
            toastError('Gagal menerima pesanan.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectOrderId || !rejectionReason.trim()) return;

        setProcessingId(rejectOrderId);
        try {
            await axios.post(route('pos.online_orders.reject', rejectOrderId), {
                reason: rejectionReason
            });
            setRejectOrderId(null);
            setRejectionReason('');
            onUpdate();
            toastSuccess('Pesanan berhasil ditolak.');
        } catch (error) {
            console.error(error);
            toastError('Gagal menolak pesanan.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleUpdateStatus = async (orderId: number, status: string) => {
        setProcessingId(orderId);
        try {
            await axios.post(route('pos.online_orders.status', orderId), { status });
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    const openPreview = (orderId: number, url: string) => {
        setPreviewUrl(url);
        if (!reviewedIds.includes(orderId)) {
            setReviewedIds(prev => [...prev, orderId]);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                {/* Main Modal */}
                <div className="bg-[#F5F3EF] rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-[#E8E4DD]">
                    <div className="p-6 bg-white border-b border-[#E8E4DD] flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E8F5E9] rounded-2xl flex items-center justify-center">
                                <Clock size={20} className="text-[#2D6A4F]" />
                            </div>
                            <div>
                                <h3 className="font-poppins font-black text-[#1A1A1A] text-lg">Monitoring Pesanan Online</h3>
                                <p className="text-xs font-bold text-[#B5AFA6] uppercase tracking-widest">{orders.length} Pesanan Aktif</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-[#B5AFA6] hover:text-red-500 transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {orders.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#E8E4DD] mb-5">
                                    <CheckCircle size={40} />
                                </div>
                                <p className="font-black text-[#1A1A1A]">Belum ada pesanan online</p>
                                <p className="text-xs text-[#B5AFA6] mt-1">Semua pesanan sudah diproses.</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="bg-white rounded-2xl border border-[#E8E4DD] overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    <div className="p-5 flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-[#F5F3EF] text-[#2D6A4F] text-[10px] font-black rounded-lg border border-[#E8E4DD]">
                                                    {order.order_number}
                                                </span>
                                                <span className={`px-3 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${
                                                    order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    order.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    'bg-[#E8F5E9] text-[#2D6A4F] border-[#C8E6C9]'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            
                                            <div>
                                                <h4 className="font-black text-[#1A1A1A] text-base">{order.customer?.name}</h4>
                                                <div className="flex items-center gap-2 text-[11px] text-[#8A8379] font-medium mt-1">
                                                    <MapPin size={14} className="text-[#B5AFA6]" />
                                                    <span className="truncate max-w-[300px]">{order.delivery_address || 'Take Away'}</span>
                                                </div>
                                                {order.notes && (
                                                    <div className="bg-amber-50 text-amber-800 border border-amber-200/50 px-3 py-2 rounded-xl text-[10px] font-bold mt-2 inline-block">
                                                        CATATAN: "{order.notes}"
                                                    </div>
                                                )}
                                            </div>

                                             <div className="pt-2 flex flex-col gap-1.5 w-full">
                                                 {order.items?.map((item: any) => {
                                                     let custs: any[] = [];
                                                     if (item.customizations) {
                                                         if (typeof item.customizations === 'string') {
                                                             try {
                                                                 custs = JSON.parse(item.customizations);
                                                             } catch (_) {}
                                                         } else if (Array.isArray(item.customizations)) {
                                                             custs = item.customizations;
                                                         }
                                                     }
                                                     return (
                                                         <div key={item.id} className="flex flex-col text-[11px] text-[#1A1A1A] bg-[#F5F3EF]/60 p-2.5 rounded-xl border border-[#E8E4DD]/40">
                                                             <div className="flex items-center gap-2">
                                                                 <span className="font-black text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded-md text-[10px]">
                                                                     {item.quantity}x
                                                                 </span>
                                                                 <span className="font-bold">
                                                                     {item.product?.name}
                                                                 </span>
                                                             </div>
                                                             {custs.length > 0 && (
                                                                 <div className="text-[9px] text-[#8A8379] font-bold pl-8 mt-1.5 flex flex-wrap gap-1">
                                                                     {custs.map((c: any, cidx: number) => (
                                                                         <span key={cidx} className="bg-white border border-[#E8E4DD] px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide">
                                                                             {c.name} {Number(c.price) > 0 ? `(+${rupiah(c.price)})` : ''}
                                                                         </span>
                                                                     ))}
                                                                 </div>
                                                             )}
                                                             {item.notes && (
                                                                 <span className="text-[9px] text-[#D97706] font-bold pl-8 mt-1.5 italic">
                                                                     Catatan: "{item.notes}"
                                                                 </span>
                                                             )}
                                                         </div>
                                                     );
                                                 })}
                                             </div>
                                        </div>

                                        <div className="flex flex-col justify-between items-end gap-4 min-w-[180px]">
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-[#B5AFA6] uppercase tracking-wider">
                                                    {order.payment_method === 'manual_transfer' ? 'Transfer Bank' : 'QRIS / E-Wallet'}
                                                </p>
                                                <p className="text-xl font-black text-[#2D6A4F]">{rupiah(order.total)}</p>
                                                
                                                {order.payment_proof_url ? (
                                                    <button 
                                                        onClick={() => openPreview(order.id, order.payment_proof_url)}
                                                        className={`mt-2 text-[10px] font-black px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${
                                                            reviewedIds.includes(order.id) 
                                                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}
                                                    >
                                                        <Eye size={14} />
                                                        {reviewedIds.includes(order.id) ? 'SUDAH DILIHAT' : 'LIHAT BUKTI BAYAR'}
                                                    </button>
                                                ) : (
                                                    <p className="mt-2 text-[9px] font-black text-red-400 italic">BELUM UPLOAD BUKTI</p>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                {order.status === 'pending' ? (
                                                    <div className="flex gap-2 w-full">
                                                        <button 
                                                            onClick={() => setRejectOrderId(order.id)}
                                                            disabled={processingId === order.id}
                                                            className="px-4 py-2.5 bg-red-50 text-red-600 text-xs font-black rounded-xl hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
                                                        >
                                                            TOLAK
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAccept(order.id)}
                                                            disabled={processingId === order.id || !reviewedIds.includes(order.id)}
                                                            className={`px-6 py-2.5 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:grayscale ${
                                                                reviewedIds.includes(order.id) ? 'bg-[#2D6A4F] shadow-[#2D6A4F]/20' : 'bg-gray-400'
                                                            }`}
                                                        >
                                                            <CheckCircle size={16} />
                                                            TERIMA (ACC)
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        {order.status === 'confirmed' && (
                                                            <button 
                                                                onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                                                disabled={processingId === order.id}
                                                                className="px-4 py-2.5 bg-[#40916C] text-white text-xs font-black rounded-xl hover:bg-[#2D6A4F] transition-all disabled:opacity-50"
                                                            >
                                                                SIAPKAN
                                                            </button>
                                                        )}
                                                        {order.status === 'preparing' && (
                                                            <button 
                                                                onClick={() => handleUpdateStatus(order.id, 'ready_for_pickup')}
                                                                disabled={processingId === order.id}
                                                                className="px-4 py-2.5 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50"
                                                            >
                                                                SIAP DIAMBIL
                                                            </button>
                                                        )}
                                                        {order.status === 'ready_for_pickup' && (
                                                            <button 
                                                                onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                                                disabled={processingId === order.id}
                                                                className="px-4 py-2.5 bg-[#2D6A4F] text-white text-xs font-black rounded-xl hover:bg-[#1B4332] transition-all disabled:opacity-50"
                                                            >
                                                                SELESAI
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => setReceiptOrder(order)}
                                                            className="p-2.5 bg-white border border-[#E8E4DD] text-[#8A8379] rounded-xl hover:bg-[#F5F3EF] transition-all"
                                                            title="Cetak Struk"
                                                        >
                                                            <Printer size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Image Preview Overlay */}
                {previewUrl && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md">
                        <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden p-2 shadow-2xl">
                            <button 
                                onClick={() => setPreviewUrl(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all z-10"
                            >
                                <X size={24} />
                            </button>
                            <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                                <h4 className="font-black text-gray-800">Bukti Pembayaran</h4>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Review Mode</span>
                            </div>
                            <div className="max-h-[70vh] overflow-y-auto bg-gray-200">
                                <img src={previewUrl} className="w-full h-auto object-contain" alt="Bukti Pembayaran" />
                            </div>
                            <div className="p-6 bg-white flex justify-center">
                                <button 
                                    onClick={() => setPreviewUrl(null)}
                                    className="px-12 py-3 bg-[#2D6A4F] text-white font-black rounded-2xl hover:bg-[#1B4332] shadow-xl shadow-[#2D6A4F]/20 transition-all"
                                >
                                    SELESAI TINJAU
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Dialog */}
                {rejectOrderId && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-500 mx-auto">
                                <AlertTriangle size={32} />
                            </div>
                            <h4 className="text-xl font-black text-center text-[#1A1A1A] mb-2">Tolak Pesanan</h4>
                            <p className="text-sm text-center text-gray-500 mb-6">Berikan alasan mengapa pesanan ini ditolak agar pelanggan tahu.</p>
                            
                            <textarea 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Contoh: Bukti transfer tidak jelas atau nominal tidak sesuai..."
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none min-h-[120px] transition-all"
                            />

                            <div className="flex gap-3 mt-8">
                                <button 
                                    onClick={() => {
                                        setRejectOrderId(null);
                                        setRejectionReason('');
                                    }}
                                    className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 transition-all"
                                >
                                    BATAL
                                </button>
                                <button 
                                    onClick={handleReject}
                                    disabled={!rejectionReason.trim() || processingId === rejectOrderId}
                                    className="flex-[2] py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                                >
                                    KONFIRMASI TOLAK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Receipt Modal */}
            <ReceiptModal 
                isOpen={!!receiptOrder}
                onClose={() => setReceiptOrder(null)}
                order={receiptOrder}
            />
        </>
    );
}
