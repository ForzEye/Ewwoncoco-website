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
        // 1. Get receipt content
        const receiptEl = document.getElementById('receipt-thermal');
        if (!receiptEl) {
            window.print();
            return;
        }

        // 2. Create temporary container at body root
        const printContainer = document.createElement('div');
        printContainer.id = 'print-receipt-root';
        printContainer.innerHTML = receiptEl.outerHTML;
        document.body.appendChild(printContainer);

        // 3. Trigger printing
        window.print();

        // 4. Clean up after printing
        document.body.removeChild(printContainer);
    };

    // Adapt fields for Online Order vs POS Transaction
    const isOnline = !!order.order_number;
    const displayId = isOnline ? order.order_number : order.transaction_number;
    const displayDate = isOnline ? order.created_at : order.transaction_at;
    const displayCashier = isOnline ? 'ONLINE' : (order.cashier?.name?.toUpperCase() || 'KASIR');
    const displayPayment = isOnline 
        ? (order.payment_method === 'manual_transfer' ? 'TRANSFER' : 'ONLINE') 
        : (order.payment_method === 'cash' ? 'TUNAI' : (order.payment_method === 'qris' ? 'QRIS' : 'TESTER'));

    // Extract print settings from database (with standard fallbacks)
    const merchantSettings = order.merchant || {};
    const paperWidth = merchantSettings.receipt_paper_width || '58mm';
    const baseFontSize = Number(merchantSettings.receipt_font_size) || 9;
    const isExtraBold = !!merchantSettings.receipt_extra_bold;
    const leftMargin = Number(merchantSettings.receipt_left_margin) || 0;
    const fontWeightValue = Number(merchantSettings.receipt_font_weight) || 790;
    const headerFontWeight = Math.max(100, fontWeightValue - 40);

    return (
        <div id="print-modal-wrapper" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div id="print-modal-dialog" className="relative bg-[#F5F3EF] w-full max-w-md max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#E8E4DD] animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-[#E8E4DD] flex items-center justify-between no-print bg-white">
                    <div>
                        <h3 className="font-poppins font-black text-[#1A1A1A]">Preview Struk</h3>
                        <p className="text-[10px] font-bold text-[#B5AFA6] uppercase tracking-[0.1em]">Siap untuk dicetak</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-[#F5F3EF] rounded-xl transition-colors border border-transparent hover:border-[#E8E4DD]">
                        <X size={20} className="text-[#B5AFA6]" />
                    </button>
                </div>

                <div id="print-modal-content" className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#E8F5E9] text-[#2D6A4F] rounded-2xl flex items-center justify-center mb-8 no-print shadow-sm">
                        <CheckCircle2 size={32} />
                    </div>

                    {/* Receipt Preview (Dynamic Thermal Style) */}
                    <div 
                        id="receipt-thermal" 
                        style={{
                            width: paperWidth === '58mm' ? '170px' : '230px',
                            transform: leftMargin ? `translateX(${leftMargin * 1.5}px)` : 'none',
                            transition: 'transform 0.15s ease-out, width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        className="bg-white px-3.5 py-6 shadow-sm mx-auto receipt-print flex flex-col border border-[#E8E4DD] print:border-none print:shadow-none"
                    >
                        <div className="text-center mb-6">
                            <h4 className="font-bold uppercase tracking-tighter mb-1 leading-none" style={{ fontSize: `${baseFontSize + 4}px` }}>
                                {order.merchant?.receipt_header || order.merchant?.name || 'EWWON COCO'}
                            </h4>
                            <p className="font-bold" style={{ fontSize: `${baseFontSize}px` }}>{order.branch?.name || 'Cabang Utama'}</p>
                            <div className="mt-1 space-y-0.5" style={{ fontSize: `${Math.max(6.5, baseFontSize - 2.5)}px` }}>
                                <p className="leading-tight px-2">
                                    {order.branch?.address || order.merchant?.address || 'Jl. Raya No. 123'}
                                </p>
                                <p style={{ fontSize: `${Math.max(7, baseFontSize - 2)}px` }}>{order.branch?.phone || order.merchant?.phone || '0812-3456-7890'}</p>
                            </div>
                        </div>

                        <div className="border-t border-b border-dashed border-gray-400 py-3 mb-4 space-y-1.5 w-full animate-fade-in" style={{ fontSize: '9px' }}>
                            <div className="flex justify-between">
                                <span className="opacity-60">WAKTU:</span>
                                <span>{tanggalWaktu(displayDate).replace(' pukul ', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-60">NO:</span>
                                <span>{displayId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-60">KASIR:</span>
                                <span>{displayCashier}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-60">BAYAR:</span>
                                <span>{displayPayment}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-5 w-full">
                            {order.items?.map((item: any, idx: number) => {
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
                                const itemSubtotal = item.subtotal || ((item.price || 0) * (item.quantity || 0)) || 0;
                                const itemPrice = item.price || (item.quantity ? (itemSubtotal / item.quantity) : 0);
                                return (
                                    <div key={idx} className="space-y-1 mb-3" style={{ fontSize: `${baseFontSize}px` }}>
                                        <div className="font-bold uppercase break-words leading-tight">
                                            {item.product?.name || 'Produk'}
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <span>
                                                {item.quantity} x {rupiah(itemPrice).replace('Rp ', '')}
                                            </span>
                                            <span className="font-bold whitespace-nowrap">
                                                {rupiah(itemSubtotal).replace('Rp ', '')}
                                            </span>
                                        </div>
                                        {custs.length > 0 && (
                                            <p className="italic opacity-80 pl-2 leading-none animate-fade-in mt-1" style={{ fontSize: `${baseFontSize - 1.5}px` }}>
                                                * {custs.map((c: any) => c.name).join(', ')}
                                            </p>
                                        )}
                                        {item.notes && (
                                            <p className="italic opacity-80 pl-2 leading-none animate-fade-in mt-1" style={{ fontSize: `${baseFontSize - 1.5}px` }}>
                                                * CATATAN: {item.notes.toUpperCase()}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                            {order.notes && (
                                <div className="border-t border-dotted border-gray-400 pt-2 mt-2" style={{ fontSize: `${baseFontSize - 0.5}px` }}>
                                    <p className="font-bold uppercase">CATATAN PESANAN:</p>
                                    <p className="leading-tight">"{order.notes.toUpperCase()}"</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-dashed border-gray-400 pt-3 space-y-1.5 w-full">
                            {(order.discount > 0) && (
                                <div className="flex justify-between opacity-80 italic" style={{ fontSize: `${baseFontSize}px` }}>
                                    <span>{order.payment_method === 'tester' ? 'DISKON TESTER' : 'POTONGAN POIN'}</span>
                                    <span>-{rupiah(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold" style={{ fontSize: `${baseFontSize + 1}px` }}>
                                <span>TOTAL</span>
                                <span>{rupiah(order.total || 0)}</span>
                            </div>
                            <div className="flex justify-between opacity-80" style={{ fontSize: `${baseFontSize - 0.5}px` }}>
                                <span className="uppercase">{displayPayment}</span>
                                <span>{rupiah(order.cash_received || order.total || 0)}</span>
                            </div>
                            {!isOnline && (
                                <div className="flex justify-between font-bold border-t border-dotted border-gray-300 pt-2 mt-1.5" style={{ fontSize: `${baseFontSize}px` }}>
                                    <span>KEMBALI</span>
                                    <span>{rupiah(order.change_amount || 0)}</span>
                                </div>
                            )}
                        </div>

                        <div className="text-center mt-8 space-y-3 opacity-90 w-full">
                            <div className="border-t border-dashed border-gray-400 pt-4">
                                <p className="font-bold" style={{ fontSize: `${baseFontSize}px` }}>TERIMA KASIH</p>
                                <p className="leading-relaxed px-1" style={{ fontSize: `${baseFontSize - 1.5}px` }}>
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
                :root {
                    --receipt-width: ${paperWidth};
                    --receipt-font: ${baseFontSize}px;
                    --receipt-print-width: ${paperWidth === '58mm' ? '45mm' : '68mm'};
                }

                /* --- Tampilan Layar (Screen Preview) --- */
                .receipt-print {
                    box-sizing: border-box !important;
                    padding: 4mm !important; /* Batas aman padding agar tidak kepotong di layar */
                    font-size: var(--receipt-font, 12px) !important; /* Ukuran font dasar diwariskan ke anak */
                }

                .receipt-print,
                .receipt-print * {
                    color: #000 !important;
                    opacity: 1 !important; /* Memaksa warna hitam solid, menonaktifkan efek abu-abu/transparansi */
                    font-family: 'Courier New', 'Consolas', monospace !important;
                    line-height: 1.45 !important;
                    font-weight: ${fontWeightValue} !important; /* <--- KETEBALAN FONT KUSTOM DARI ADMIN */
                    -webkit-text-stroke: 0.15px black !important; /* Membuat huruf tegap berskala mikro */
                    text-shadow: 0.15px 0px 0px #000, 0px 0.15px 0px #000 !important; /* Trik bayangan hitam presisi agar tebal */
                    border-color: #000 !important; /* Garis pemisah hitam pekat */
                }

                /* Judul besar utama diatur khusus agar tidak mbleber */
                .receipt-print h4,
                .receipt-print h4 * {
                    font-weight: ${headerFontWeight} !important;
                }

                /* Mencegah pemotongan karakter terakhir di ujung kanan karena monospace + text-shadow */
                .receipt-print span,
                .receipt-print p,
                .receipt-print div {
                    padding-right: 3px !important;
                }

                /* --- Tampilan Cetak (Print Stylesheet) --- */
                @media print {
                    @page {
                        margin: 0;
                        size: var(--receipt-width, 58mm) auto; /* Mengatur ukuran kertas printer */
                    }
                    
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: var(--receipt-width, 58mm) !important; /* Memaksa lebar body sesuai setingan */
                        background: #fff !important;
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                    }
                    
                    /* Sembunyikan elemen non-cetak di body */
                    body > *:not(#print-receipt-root) {
                        display: none !important;
                    }
                    
                    /* Container pembungkus cetak di body */
                    #print-receipt-root {
                        display: block !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                    }

                    .receipt-print {
                        width: var(--receipt-print-width, 45mm) !important;
                        max-width: var(--receipt-print-width, 45mm) !important;
                        box-sizing: border-box !important;
                        margin: 0 auto !important;
                        padding-top: 2mm !important;
                        padding-bottom: 2mm !important;
                        padding-left: 2mm !important;
                        padding-right: 2mm !important;
                        background: #fff !important;
                        border: none !important;
                        box-shadow: none !important;
                        font-size: var(--receipt-font, 12px) !important; /* Ukuran font dasar diwariskan saat cetak */
                        position: relative !important;
                        left: ${leftMargin}mm !important;
                    }

                    .receipt-print,
                    .receipt-print * {
                        color: #000 !important;
                        opacity: 1 !important; /* Memaksa warna hitam solid, menonaktifkan efek abu-abu/transparansi saat cetak */
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        font-family: 'Courier New', 'Consolas', monospace !important;
                        line-height: 1.45 !important;
                        font-weight: ${fontWeightValue} !important; /* <--- KETEBALAN FONT KUSTOM DARI ADMIN */
                        -webkit-text-stroke: 0.15px black !important; /* Huruf tegap mikro saat dicetak */
                        text-shadow: 0.15px 0px 0px #000, 0px 0.15px 0px #000 !important; /* Bayangan hitam mikro di printer thermal */
                        border-color: #000 !important; /* Garis pemisah tetap hitam solid di printer */
                    }

                    /* Judul besar utama diatur khusus saat dicetak */
                    .receipt-print h4,
                    .receipt-print h4 * {
                        font-weight: ${headerFontWeight} !important;
                    }

                    /* Mencegah pemotongan karakter terakhir di ujung kanan karena monospace + text-shadow */
                    .receipt-print span,
                    .receipt-print p,
                    .receipt-print div {
                        padding-right: 3px !important;
                    }

                    .no-print {
                        display: none !important;
                    }
                }
            `}} />
        </div>
    );
}
