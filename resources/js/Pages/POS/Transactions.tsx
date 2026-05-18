import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import POSLayout from '@/Layouts/POSLayout';
import { rupiah, tanggal } from '../../lib/format';
import { 
    Search, 
    Filter, 
    Printer, 
    Eye, 
    ChevronLeft, 
    ChevronRight,
    ShoppingBag,
    CreditCard,
    Banknote,
    Calendar,
    Trash2
} from 'lucide-react';
import { router } from '@inertiajs/react';
import ReceiptModal from '../../Components/POS/ReceiptModal';

interface TransactionsProps {
    transactions: any;
    filters: {
        date: string;
    };
}

export default function Transactions({ transactions, filters }: TransactionsProps) {
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(filters.date);

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        router.get(route('pos.transactions'), { date }, { preserveState: true });
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    const handleShowReceipt = (order: any) => {
        setSelectedOrder(order);
        setIsReceiptOpen(true);
    };

    const handleVoid = (id: number) => {
        if (confirm('Apakah Anda yakin ingin membatalkan (VOID) transaksi ini? Stok akan dikembalikan dan jumlah void Anda akan bertambah.')) {
            router.post(route('pos.transactions.void', id), {}, {
                onSuccess: (page: any) => {
                    // Check if there was a message in the response
                    const flash = page.props.flash;
                    if (flash?.success) alert(flash.success);
                    if (flash?.error) alert(flash.error);
                },
                onError: (errors) => {
                    alert('Gagal melakukan void transaksi.');
                }
            });
        }
    };

    return (
        <POSLayout>
            <Head title="Riwayat Transaksi POS" />
            
            <div className="p-8 h-full overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-poppins font-bold text-charcoal">Riwayat Transaksi</h1>
                            {isToday && (
                                <span className="px-3 py-1 bg-[#E8F5E9] text-[#2D6A4F] text-[10px] font-black rounded-full border border-[#C8E6C9] animate-pulse">
                                    HARI INI
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm">Lihat dan cetak ulang transaksi kasir Anda.</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Cari No. Transaksi..."
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00C48C] outline-none w-64"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D6A4F]" size={18} />
                            <input 
                                type="date"
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none w-48 transition-all"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-6 py-4">Waktu</th>
                                    <th className="px-6 py-4">No. Transaksi</th>
                                    <th className="px-6 py-4">Metode</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.data.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-charcoal">
                                                {new Date(tx.transaction_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {tanggal(tx.transaction_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-[#00C48C]">
                                                    {tx.transaction_number}
                                                </span>
                                                {tx.is_online && (
                                                    <span className="text-[8px] font-black bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded border border-blue-100">
                                                        ONLINE
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {tx.payment_method === 'cash' ? (
                                                    <div className="w-6 h-6 rounded bg-green-50 text-green-600 flex items-center justify-center">
                                                        <Banknote size={14} />
                                                    </div>
                                                ) : tx.payment_method === 'manual_transfer' ? (
                                                    <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                                                        <CreditCard size={14} />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                                                        <ShoppingBag size={14} />
                                                    </div>
                                                )}
                                                <span className="text-xs font-bold text-gray-600 capitalize">
                                                    {tx.payment_method === 'manual_transfer' ? 'Transfer' : tx.payment_method}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-charcoal">
                                            {rupiah(tx.total)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button 
                                                    onClick={() => handleShowReceipt(tx)}
                                                    className="p-2 text-gray-400 hover:text-[#00C48C] transition-all"
                                                    title="Cetak Struk"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-blue-500 transition-all" title="Detail">
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleVoid(tx.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-all" 
                                                    title="Void Transaksi"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <ShoppingBag size={48} className="mb-4 opacity-20" />
                                                <p className="text-sm font-medium">Belum ada transaksi pada tanggal ini.</p>
                                                <p className="text-xs mt-1">Silakan pilih tanggal lain atau buat transaksi baru.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <p className="text-xs text-gray-500">
                            Menampilkan <span className="font-bold">{transactions.from || 0}</span> sampai <span className="font-bold">{transactions.to || 0}</span> dari <span className="font-bold">{transactions.total}</span> transaksi
                        </p>
                        <div className="flex items-center space-x-2">
                            {transactions.links.map((link: any, i: number) => {
                                if (link.label.includes('Previous')) {
                                    return (
                                        <a 
                                            key={i} 
                                            href={link.url} 
                                            className={`p-2 rounded border border-gray-200 transition-all ${!link.url ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white'}`}
                                        >
                                            <ChevronLeft size={16} />
                                        </a>
                                    );
                                }
                                if (link.label.includes('Next')) {
                                    return (
                                        <a 
                                            key={i} 
                                            href={link.url} 
                                            className={`p-2 rounded border border-gray-200 transition-all ${!link.url ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white'}`}
                                        >
                                            <ChevronRight size={16} />
                                        </a>
                                    );
                                }
                                if (link.active || (!isNaN(Number(link.label)))) {
                                    return (
                                        <a 
                                            key={i} 
                                            href={link.url} 
                                            className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${link.active ? 'bg-[#00C48C] text-white' : 'text-gray-500 hover:bg-white border border-transparent hover:border-gray-200'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {selectedOrder && (
                <ReceiptModal 
                    isOpen={isReceiptOpen}
                    onClose={() => setIsReceiptOpen(false)}
                    order={selectedOrder}
                />
            )}
        </POSLayout>
    );
}
