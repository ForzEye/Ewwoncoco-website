import React, { useState, useEffect } from 'react';
import { 
    X, 
    Banknote, 
    QrCode, 
    CheckCircle2, 
    ArrowRight,
    Sparkles,
    Loader2
} from 'lucide-react';
import { rupiah } from '../../lib/format';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onConfirm: (data: { payment_method: 'cash' | 'qris', amount_paid: number }) => void;
    processing: boolean;
}

export default function PaymentModal({ isOpen, onClose, total, onConfirm, processing }: PaymentModalProps) {
    const [method, setMethod] = useState<'cash' | 'qris'>('cash');
    const [amountPaid, setAmountPaid] = useState<string>('');
    const [change, setChange] = useState(0);

    const quickAmounts = [20000, 50000, 100000, 200000];

    useEffect(() => {
        const paid = parseFloat(amountPaid) || 0;
        setChange(Math.max(0, paid - total));
    }, [amountPaid, total]);

    useEffect(() => {
        if (isOpen) {
            setAmountPaid('');
            setMethod('cash');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const canConfirm = method === 'qris' || (parseFloat(amountPaid) || 0) >= total;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border border-[#E8E4DD]" style={{animation: 'fadeInUp 0.3s ease-out both'}}>
                {/* Header */}
                <div className="p-6 border-b border-[#E8E4DD] flex items-center justify-between bg-[#FAFAF8]">
                    <div>
                        <h3 className="font-poppins font-black text-xl text-[#1A1A1A]">Pembayaran</h3>
                        <p className="text-[10px] font-bold text-[#B5AFA6] uppercase tracking-[0.12em] mt-1">Pilih metode dan selesaikan transaksi</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-[#F5F3EF] rounded-xl transition-colors border border-transparent hover:border-[#E8E4DD]">
                        <X size={18} className="text-[#B5AFA6]" />
                    </button>
                </div>

                <div className="flex flex-1">
                    {/* Methods Selector */}
                    <div className="w-[180px] border-r border-[#E8E4DD] p-5 space-y-3 bg-[#FAFAF8]">
                        <button 
                            onClick={() => setMethod('cash')}
                            className={`w-full p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                                method === 'cash' 
                                    ? 'border-[#2D6A4F] bg-[#E8F5E9] text-[#2D6A4F] shadow-sm' 
                                    : 'border-[#E8E4DD] text-[#B5AFA6] hover:border-[#C4BEB5] hover:text-[#8A8379]'
                            }`}
                        >
                            <Banknote size={28} />
                            <span className="text-[10px] font-black uppercase tracking-[0.1em]">Tunai</span>
                        </button>
                        <button 
                            onClick={() => setMethod('qris')}
                            className={`w-full p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                                method === 'qris' 
                                    ? 'border-[#2D6A4F] bg-[#E8F5E9] text-[#2D6A4F] shadow-sm' 
                                    : 'border-[#E8E4DD] text-[#B5AFA6] hover:border-[#C4BEB5] hover:text-[#8A8379]'
                            }`}
                        >
                            <QrCode size={28} />
                            <span className="text-[10px] font-black uppercase tracking-[0.1em]">QRIS</span>
                        </button>
                    </div>

                    {/* Payment Input */}
                    <div className="flex-1 p-6">
                        {/* Total Display */}
                        <div className="mb-7 p-5 bg-[#F5F3EF] rounded-2xl border border-[#E8E4DD]">
                            <p className="text-[9px] font-bold text-[#B5AFA6] uppercase tracking-[0.15em] mb-1">Total Tagihan</p>
                            <h2 className="text-3xl font-poppins font-black text-[#1A1A1A] tracking-tighter">{rupiah(total)}</h2>
                        </div>

                        {method === 'cash' ? (
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-bold text-[#8A8379] uppercase tracking-[0.1em] block mb-2">Uang Diterima</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#C4BEB5] text-sm">Rp</span>
                                        <input 
                                            type="number" 
                                            value={amountPaid}
                                            onChange={(e) => setAmountPaid(e.target.value)}
                                            autoFocus
                                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#E8E4DD] rounded-2xl text-2xl font-black text-[#1A1A1A] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 transition-all placeholder:text-[#E8E4DD]"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {quickAmounts.map(amt => (
                                        <button 
                                            key={amt}
                                            onClick={() => setAmountPaid(amt.toString())}
                                            className={`py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                                                amountPaid === amt.toString()
                                                    ? 'bg-[#E8F5E9] border-2 border-[#2D6A4F]/30 text-[#2D6A4F]'
                                                    : 'bg-[#FAFAF8] border border-[#E8E4DD] text-[#8A8379] hover:border-[#C4BEB5] hover:text-[#1A1A1A]'
                                            }`}
                                        >
                                            {rupiah(amt)}
                                        </button>
                                    ))}
                                </div>

                                {/* Change display */}
                                <div className={`p-4 rounded-2xl flex justify-between items-center transition-all ${
                                    change > 0 ? 'bg-amber-50 border-2 border-amber-200' : 'bg-[#F5F3EF] border border-[#E8E4DD]'
                                }`}>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${change > 0 ? 'text-[#D97706]' : 'text-[#B5AFA6]'}`}>Kembalian</span>
                                    <span className={`text-xl font-black ${change > 0 ? 'text-[#D97706]' : 'text-[#E8E4DD]'}`}>{rupiah(change)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 space-y-5">
                                <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-md border border-[#E8E4DD]">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=EWWON-COCO-${total}`} alt="QRIS" className="w-full h-full" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-[#8A8379] font-medium leading-relaxed max-w-[260px]">
                                        Scan QR di atas menggunakan aplikasi m-banking atau e-wallet pelanggan.
                                    </p>
                                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F5E9] rounded-full">
                                        <Sparkles className="w-3 h-3 text-[#2D6A4F]" />
                                        <span className="text-[9px] font-black text-[#2D6A4F] uppercase tracking-wider">Auto-detect</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 bg-[#FAFAF8] border-t border-[#E8E4DD] flex gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3.5 text-[#B5AFA6] font-bold hover:text-[#1A1A1A] transition-colors rounded-xl hover:bg-white border border-transparent hover:border-[#E8E4DD]"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={() => onConfirm({ payment_method: method, amount_paid: method === 'qris' ? total : (parseFloat(amountPaid) || 0) })}
                        disabled={processing || !canConfirm}
                        className="flex-1 bg-gradient-to-r from-[#2D6A4F] to-[#40916C] hover:from-[#1B4332] hover:to-[#2D6A4F] disabled:from-[#E8E4DD] disabled:to-[#E8E4DD] disabled:text-[#B5AFA6] text-white font-black py-3.5 rounded-2xl shadow-lg shadow-[#2D6A4F]/15 transition-all flex items-center justify-center gap-2 disabled:shadow-none group"
                    >
                        {processing ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                <span className="text-sm">Selesaikan Pembayaran</span>
                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
