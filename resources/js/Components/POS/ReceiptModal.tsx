import React from 'react';
import { X, Printer, CheckCircle2, Home } from 'lucide-react';
import { rupiah, tanggalWaktu } from '../../lib/format';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any | null; // Can be PosTransaction or Order
}

export default function ReceiptModal({ isOpen, onClose, order }: ReceiptModalProps) {
    console.log('ReceiptModal render:', { isOpen, order });
    if (!isOpen || !order) return null;

    const handlePrint = () => {
        window.print();
    };

    // Adapt fields for Online Order vs POS Transaction
    const isOnline = !!order.order_number;
    const displayId = isOnline ? order.order_number : order.transaction_number;
    const displayDate = isOnline ? order.created_at : order.transaction_at;
    const displayCashier = isOnline ? 'ONLINE' : (order.cashier?.name?.toUpperCase() || 'KASIR');
    const displayPayment = isOnline 
        ? (order.payment_method === 'manual_transfer' ? 'TRANSFER' : 'ONLINE') 
        : (order.payment_method === 'cash' ? 'TUNAI' : 'QRIS');

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-[#F5F3EF] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#E8E4DD] animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-[#E8E4DD] flex items-center justify-between no-print bg-white">
                    <div>
                        <h3 className="font-poppins font-black text-[#1A1A1A]">Preview Struk</h3>
                        <p className="text-[10px] font-bold text-[#B5AFA6] uppercase tracking-[0.1em]">Siap untuk dicetak</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-[#F5F3EF] rounded-xl transition-colors border border-transparent hover:border-[#E8E4DD]">
                        <X size={20} className="text-[#B5AFA6]" />
                    </button>
                </div>

                <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#E8F5E9] text-[#2D6A4F] rounded-2xl flex items-center justify-center mb-8 no-print shadow-sm">
                        <CheckCircle2 size={32} />
                    </div>

                    {/* Receipt Preview (58mm Thermal Style) */}
                    <div id="receipt-thermal" className="bg-white p-6 shadow-sm w-[48mm] mx-auto text-[#1A1A1A] font-mono text-[9px] leading-tight receipt-print flex flex-col border border-[#E8E4DD] print:border-none print:shadow-none">
                        <div className="text-center mb-6">
                            <h4 className="font-bold text-[11px] uppercase tracking-tighter mb-1 leading-none">
                                {order.merchant?.receipt_header || order.merchant?.name || 'EWWON COCO'}
                            </h4>
                            <p className="font-bold text-[9px]">{order.branch?.name || 'Cabang Utama'}</p>
                            <div className="mt-1 space-y-0.5 opacity-80">
                                <p className="text-[7px] leading-tight px-2">
                                    {order.branch?.address || order.merchant?.address || 'Jl. Raya No. 123'}
                                </p>
                                <p className="text-[8px]">{order.branch?.phone || order.merchant?.phone || '0812-3456-7890'}</p>
                            </div>
                        </div>

                        <div className="border-t border-b border-dashed border-gray-400 py-3 mb-4 space-y-1.5 w-full">
                            <div className="flex justify-between">
                                <span className="opacity-60">WAKTU:</span>
                                <span>{tanggalWaktu(displayDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-60">NO:</span>
                                <span className="text-[7px]">{displayId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-60">KASIR:</span>
                                <span>{displayCashier}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-5 w-full">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="space-y-1">
                                    <p className="font-bold uppercase text-[8px] leading-none">{item.product?.name || 'Produk'}</p>
                                    <div className="flex justify-between items-end">
                                        <span className="opacity-70">{item.quantity} x {rupiah(item.unit_price || item.price || 0).replace('Rp ', '')}</span>
                                        <span className="font-bold">{rupiah(item.subtotal || ((item.price || 0) * (item.quantity || 0)) || 0).replace('Rp ', '')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-gray-400 pt-3 space-y-1.5 w-full">
                            {(order.discount > 0) && (
                                <div className="flex justify-between opacity-80 italic">
                                    <span>POTONGAN POIN</span>
                                    <span>-{rupiah(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-[10px]">
                                <span>TOTAL</span>
                                <span>{rupiah(order.total || 0)}</span>
                            </div>
                            <div className="flex justify-between opacity-80">
                                <span className="uppercase text-[8px]">{displayPayment}</span>
                                <span>{rupiah(order.cash_received || order.total || 0)}</span>
                            </div>
                            {!isOnline && (
                                <div className="flex justify-between font-bold border-t border-dotted border-gray-300 pt-2 mt-1.5">
                                    <span>KEMBALI</span>
                                    <span>{rupiah(order.change_amount || 0)}</span>
                                </div>
                            )}
                        </div>

                        <div className="text-center mt-8 space-y-3 opacity-90 w-full">
                            <div className="border-t border-dashed border-gray-400 pt-4">
                                <p className="font-bold text-[9px]">TERIMA KASIH</p>
                                <p className="text-[7px] leading-relaxed px-1">
                                    {order.merchant?.receipt_footer || 'Sudah berbelanja di Ewwon Coco!'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-[#E8E4DD] flex space-x-3 no-print">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-6 py-4 bg-[#F5F3EF] border border-[#E8E4DD] rounded-2xl text-sm font-bold text-[#8A8379] hover:bg-[#E8E4DD] transition-all flex items-center justify-center space-x-2"
                    >
                        <span>Tutup</span>
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex-[2] bg-gradient-to-r from-[#2D6A4F] to-[#40916C] hover:from-[#1B4332] hover:to-[#2D6A4F] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#2D6A4F]/15 transition-all flex items-center justify-center space-x-2"
                    >
                        <Printer size={18} />
                        <span>Cetak Struk</span>
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #receipt-thermal, #receipt-thermal * {
                        visibility: visible !important;
                    }
                    #receipt-thermal {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 50mm !important;
                        margin: 0 !important;
                        padding: 15px !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: white !important;
                        display: flex !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    @page {
                        size: 58mm auto;
                        margin: 0;
                    }
                }
            `}} />
        </div>
    );
}
