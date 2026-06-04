import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';
import { 
    ShoppingBag, 
    Search, 
    Filter, 
    Calendar, 
    ExternalLink, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    User, 
    Store,
    RefreshCcw,
    AlertTriangle,
    ArrowUpRight,
    History,
    Info
} from 'lucide-react';
import { rupiah, qty, tanggalWaktu, angka } from '../../lib/format';

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

interface Branch {
    id: number;
    name: string;
    merchant?: { name: string };
}

interface CombinedOrder {
    id: number;
    order_number: string;
    total: number;
    status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
    customer_name: string;
    type: 'ONLINE' | 'POS';
}

interface StockMovement {
    id: number;
    type: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    notes?: string;
    created_at: string;
    ingredient?: {
        id: number;
        name: string;
        unit: string;
    };
}

interface BranchIngredient {
    id: number;
    stock: number;
    min_stock: number;
    average_cost: number;
    ingredient?: {
        id: number;
        name: string;
        unit: string;
    };
}

interface ShiftLog {
    id: number;
    cashier_name: string;
    opened_at: string | null;
    closed_at: string | null;
    opening_cash: number;
    expected_cash: number;
    actual_cash: number | null;
    expected_qris: number;
    actual_qris: number | null;
    notes?: string;
}

interface BranchDetail {
    branch: Branch;
    combinedOrders: CombinedOrder[];
    stockMovements: StockMovement[];
    stockData: BranchIngredient[];
    shifts: ShiftLog[];
}

interface OrdersProps {
    branches: Branch[];
    selectedBranchId: number | null;
    branchDetail?: BranchDetail;
    orders?: {
        data: Order[];
        links: any[];
    };
    filters?: {
        stock_type: string;
        stock_search: string;
    };
}

export default function Orders({ branches, selectedBranchId, branchDetail, orders, filters }: OrdersProps) {
    const [activeTab, setActiveTab] = useState<'transactions' | 'stock_movements' | 'stock_status' | 'shifts'>('transactions');
    const [searchQuery, setSearchQuery] = useState(filters?.stock_search || '');
    const [typeQuery, setTypeQuery] = useState(filters?.stock_type || '');

    const handleBranchChange = (branchId: string) => {
        if (branchId) {
            router.get(route('superadmin.orders'), { branch_id: branchId });
        } else {
            router.get(route('superadmin.orders'));
        }
    };

    const applyFilters = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(route('superadmin.orders'), {
            branch_id: selectedBranchId,
            stock_search: searchQuery,
            stock_type: typeQuery
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['branchDetail', 'filters']
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: { [key: string]: string } = {
            'pending': 'bg-amber-100 text-amber-700 border-amber-200',
            'confirmed': 'bg-blue-100 text-blue-700 border-blue-200',
            'processing': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'ready': 'bg-purple-100 text-purple-700 border-purple-200',
            'delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'cancelled': 'bg-red-100 text-red-700 border-red-200',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {status}
            </span>
        );
    };

    const getPaymentMethodBadge = (method: string) => {
        if (method === 'tester') {
            return (
                <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-[10px] font-black rounded-full border border-purple-100 flex items-center gap-1 w-fit">
                    🎁 Tester
                </span>
            );
        }
        if (method === 'qris') {
            return (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 flex items-center gap-1 w-fit">
                    📱 QRIS
                </span>
            );
        }
        if (method === 'cash') {
            return (
                <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full border border-green-100 flex items-center gap-1 w-fit">
                    💵 Tunai
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] font-black rounded-full border border-gray-100 uppercase tracking-wider w-fit">
                {method.replace('_', ' ')}
            </span>
        );
    };

    const getTypeBadge = (type: 'ONLINE' | 'POS') => {
        if (type === 'ONLINE') {
            return (
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded border border-indigo-100 uppercase">
                    Online
                </span>
            );
        }
        return (
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded border border-amber-100 uppercase">
                POS Kasir
            </span>
        );
    };

    return (
        <SuperAdminLayout>
            <Head title={selectedBranchId && branchDetail ? `Monitoring ${branchDetail.branch.name} - EWWON COCO Central` : "Global Orders - EWWON COCO Central"} />
            
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-poppins font-bold text-charcoal flex items-center gap-3">
                            <ShoppingBag className="text-[#00C48C]" size={32} />
                            {selectedBranchId && branchDetail ? `Monitoring Cabang: ${branchDetail.branch.name}` : "Global Orders"}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            {selectedBranchId && branchDetail 
                                ? `Memantau aktivitas stok, transaksi, dan shift di ${branchDetail.branch.name} (${branchDetail.branch.merchant?.name}).`
                                : "Monitoring seluruh transaksi online di ekosistem Ewwon Coco."
                            }
                        </p>
                    </div>
                </div>

                {/* Branch Selector */}
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#00C48C]">
                            <Store size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-charcoal text-sm">Pilih Cabang untuk Monitoring</h3>
                            <p className="text-gray-400 text-xs mt-0.5">Lihat detail stok, orderan, dan shift kasir secara real-time.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl w-full md:w-auto border border-gray-100">
                        <select 
                            className="bg-transparent border-none text-sm font-bold text-charcoal focus:ring-0 outline-none pr-8 cursor-pointer w-full md:w-[280px]"
                            value={selectedBranchId || ''}
                            onChange={(e) => handleBranchChange(e.target.value)}
                        >
                            <option value="">Semua Cabang (Global Orders)</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.name} ({b.merchant?.name ?? 'No Merchant'})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* If selectedBranchId is set, show detailed branch monitoring tabs */}
                {selectedBranchId && branchDetail ? (
                    <div className="space-y-6">
                        {/* Tab Selectors */}
                        <div className="flex gap-6 border-b border-gray-100 px-2 overflow-x-auto pb-px">
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`pb-4 text-sm font-black transition-all border-b-2 whitespace-nowrap ${
                                    activeTab === 'transactions'
                                        ? 'border-[#00C48C] text-[#00C48C]'
                                        : 'border-transparent text-gray-400 hover:text-charcoal'
                                }`}
                            >
                                Transaksi & Orderan
                            </button>
                            <button
                                onClick={() => setActiveTab('stock_movements')}
                                className={`pb-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'stock_movements'
                                        ? 'border-[#00C48C] text-[#00C48C]'
                                        : 'border-transparent text-gray-400 hover:text-charcoal'
                                }`}
                            >
                                <History size={16} />
                                Aliran Stok Keluar-Masuk
                            </button>
                            <button
                                onClick={() => setActiveTab('stock_status')}
                                className={`pb-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'stock_status'
                                        ? 'border-[#00C48C] text-[#00C48C]'
                                        : 'border-transparent text-gray-400 hover:text-charcoal'
                                }`}
                            >
                                <Store size={16} />
                                Status Stok Saat Ini
                            </button>
                            <button
                                onClick={() => setActiveTab('shifts')}
                                className={`pb-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'shifts'
                                        ? 'border-[#00C48C] text-[#00C48C]'
                                        : 'border-transparent text-gray-400 hover:text-charcoal'
                                }`}
                            >
                                <User size={16} />
                                Shift Kasir
                            </button>
                        </div>

                        {/* Tab Contents */}
                        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
                            
                            {/* Tab 1: Transactions & Orderan */}
                            {activeTab === 'transactions' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                                        <h4 className="font-poppins font-black text-charcoal text-lg">Riwayat Transaksi Terbaru</h4>
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Menampilkan 50 transaksi terakhir</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50">
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No. Transaksi</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tipe</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Waktu</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pelanggan</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pembayaran</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {branchDetail.combinedOrders.map((ord) => (
                                                    <tr key={ord.id + '-' + ord.type} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-6 py-5 font-black text-sm text-charcoal">{ord.order_number}</td>
                                                        <td className="px-6 py-5">{getTypeBadge(ord.type)}</td>
                                                        <td className="px-6 py-5 text-xs text-gray-500 font-bold">{tanggalWaktu(ord.created_at)}</td>
                                                        <td className="px-6 py-5 text-sm font-bold text-charcoal">{ord.customer_name}</td>
                                                        <td className="px-6 py-5">{getPaymentMethodBadge(ord.payment_method)}</td>
                                                        <td className="px-6 py-5 font-black text-charcoal">{rupiah(ord.total)}</td>
                                                        <td className="px-6 py-5 text-center">{getStatusBadge(ord.status)}</td>
                                                    </tr>
                                                ))}
                                                {branchDetail.combinedOrders.length === 0 && (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-16 text-center text-gray-400 italic font-medium">
                                                            Belum ada data transaksi di cabang ini.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Stock Movements (Aliran Stok) */}
                            {activeTab === 'stock_movements' && (
                                <div className="space-y-6">
                                    {/* Filters */}
                                    <form onSubmit={applyFilters} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                                        <div className="relative flex-1 w-full">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="Cari nama bahan baku..." 
                                                className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#00C48C]/20 transition-all font-medium border border-gray-100"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full md:w-[220px]">
                                            <select
                                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none cursor-pointer"
                                                value={typeQuery}
                                                onChange={(e) => setTypeQuery(e.target.value)}
                                            >
                                                <option value="">Semua Tipe Gerakan</option>
                                                <option value="IN">Barang Masuk (IN)</option>
                                                <option value="OUT">Penggunaan (OUT)</option>
                                                <option value="ADJUST">Penyesuaian (ADJUST)</option>
                                            </select>
                                        </div>
                                        <button 
                                            type="submit"
                                            className="w-full md:w-auto px-6 py-3 bg-[#00C48C] text-white font-bold text-sm rounded-2xl hover:bg-[#00B07C] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#00C48C]/15"
                                        >
                                            <Filter size={16} />
                                            Cari / Filter
                                        </button>
                                    </form>

                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50">
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Waktu</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bahan Baku</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tipe Gerakan</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Jumlah Perubahan</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Keterangan / Pengubah</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {branchDetail.stockMovements.map((sm) => (
                                                    <tr key={sm.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-5 text-xs text-gray-500 font-bold">{tanggalWaktu(sm.created_at)}</td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-charcoal">{sm.ingredient?.name ?? 'Tidak Ada'}</span>
                                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5">{sm.ingredient?.unit ?? ''}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            {sm.type === 'IN' && (
                                                                <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full border border-green-100 uppercase tracking-wider">Barang Masuk</span>
                                                            )}
                                                            {sm.type === 'OUT' && (
                                                                <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-[9px] font-black rounded-full border border-orange-100 uppercase tracking-wider">Penggunaan</span>
                                                            )}
                                                            {sm.type === 'ADJUST' && (
                                                                <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-[9px] font-black rounded-full border border-purple-100 uppercase tracking-wider">Penyesuaian</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-mono font-bold text-sm">
                                                            <span className={sm.quantity > 0 ? 'text-green-600' : 'text-red-500'}>
                                                                {sm.quantity > 0 ? '+' : ''}{qty(sm.quantity)} {sm.ingredient?.unit ?? ''}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-xs text-gray-600 font-medium max-w-xs truncate" title={sm.notes}>
                                                            {sm.notes || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {branchDetail.stockMovements.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-16 text-center text-gray-400 italic font-medium">
                                                            Tidak ada data riwayat pergerakan stok.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Current Stock Status */}
                            {activeTab === 'stock_status' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                                        <h4 className="font-poppins font-black text-charcoal text-lg">Ketersediaan Bahan Baku</h4>
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status Real-time di Cabang</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50">
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bahan Baku</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Stok Sistem</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Stok Minimum</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">HPP Rata-rata</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {branchDetail.stockData.map((sd) => {
                                                    const isLow = sd.stock <= sd.min_stock;
                                                    const isCritical = sd.stock === 0;
                                                    return (
                                                        <tr key={sd.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-5">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-charcoal">{sd.ingredient?.name ?? 'Tidak Ada'}</span>
                                                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5">{sd.ingredient?.unit ?? ''}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-center font-mono font-black text-charcoal">{qty(sd.stock)}</td>
                                                            <td className="px-6 py-5 text-center font-mono text-gray-500 font-bold">{qty(sd.min_stock)}</td>
                                                            <td className="px-6 py-5 text-right font-bold text-[#00C48C]">{rupiah(sd.average_cost)}</td>
                                                            <td className="px-6 py-5">
                                                                <div className="flex justify-center">
                                                                    {isCritical ? (
                                                                        <span className="px-3 py-1 bg-red-50 text-red-500 text-[9px] font-black rounded-full border border-red-100 flex items-center gap-1 uppercase tracking-wider">🔴 Kritis</span>
                                                                    ) : isLow ? (
                                                                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-full border border-amber-100 flex items-center gap-1 uppercase tracking-wider">🟡 Menipis</span>
                                                                    ) : (
                                                                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full border border-green-100 flex items-center gap-1 uppercase tracking-wider">🟢 Aman</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {branchDetail.stockData.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-16 text-center text-gray-400 italic font-medium">
                                                            Belum ada bahan baku terdaftar di cabang ini.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Tab 4: Cashier Shifts */}
                            {activeTab === 'shifts' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                                        <h4 className="font-poppins font-black text-charcoal text-lg">Riwayat Shift Kasir</h4>
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Menampilkan 30 shift terakhir</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50">
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kasir</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Buka & Tutup</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Uang Modal Awal</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Expected (Cash / QRIS)</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Aktual (Cash / QRIS)</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Selisih Tunai</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {branchDetail.shifts.map((sh) => {
                                                    const isClosed = sh.closed_at !== null;
                                                    const diffCash = isClosed && sh.actual_cash !== null ? sh.actual_cash - sh.expected_cash : 0;
                                                    return (
                                                        <tr key={sh.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-5 font-bold text-charcoal text-sm">{sh.cashier_name}</td>
                                                            <td className="px-6 py-5">
                                                                <p className="text-xs text-charcoal font-semibold">Buka: {sh.opened_at ? tanggalWaktu(sh.opened_at) : '-'}</p>
                                                                <p className="text-xs text-gray-400 font-semibold mt-1">
                                                                    Tutup: {isClosed ? (sh.closed_at ? tanggalWaktu(sh.closed_at) : '') : <span className="text-[#00C48C] font-bold">🟢 Aktif (Berjalan)</span>}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-5 text-right font-medium text-gray-600">{rupiah(sh.opening_cash)}</td>
                                                            <td className="px-6 py-5 text-right">
                                                                <p className="text-xs text-charcoal font-bold">{rupiah(sh.expected_cash)} <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">(Cash)</span></p>
                                                                <p className="text-xs text-gray-500 mt-1">{rupiah(sh.expected_qris)} <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">(QRIS)</span></p>
                                                            </td>
                                                            <td className="px-6 py-5 text-right">
                                                                {isClosed ? (
                                                                    <>
                                                                        <p className="text-xs text-charcoal font-bold">{rupiah(sh.actual_cash ?? 0)} <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">(Cash)</span></p>
                                                                        <p className="text-xs text-gray-500 mt-1">{rupiah(sh.actual_qris ?? 0)} <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">(QRIS)</span></p>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs italic">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-5 text-right font-mono font-bold text-sm">
                                                                {isClosed ? (
                                                                    <span className={diffCash === 0 ? 'text-green-600' : diffCash > 0 ? 'text-blue-600' : 'text-red-500'}>
                                                                        {diffCash > 0 ? '+' : ''}{rupiah(diffCash)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs italic">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {branchDetail.shifts.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-16 text-center text-gray-400 italic font-medium">
                                                            Belum ada data shift di cabang ini.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Default view: Global Online Orders (Backward compatible) */
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
                                    {orders && orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-charcoal group-hover:text-[#00C48C] transition-colors">{order.order_number}</p>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                                                    <Calendar size={12} />
                                                    {tanggalWaktu(order.created_at)}
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
                                    {(!orders || orders.data.length === 0) && (
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
                )}
            </div>
        </SuperAdminLayout>
    );
}
