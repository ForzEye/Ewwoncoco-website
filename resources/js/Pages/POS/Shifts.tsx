import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import POSLayout from '@/Layouts/POSLayout';
import { Branch } from '../../types';
import { rupiah, tanggal } from '../../lib/format';
import { 
    Clock, 
    ArrowRight, 
    Store, 
    Banknote, 
    AlertCircle,
    CheckCircle2,
    Lock
} from 'lucide-react';

interface ShiftsProps {
    activeShift: any;
    branches: Branch[];
    breakdown: {
        expected_cash: number;
        expected_qris: number;
        expected_online: number;
        expected_gofood: number;
        expected_grabfood: number;
        expected_shopeefood: number;
    };
}

export default function Shifts({ activeShift, branches, breakdown }: ShiftsProps) {
    const [isClosing, setIsClosing] = useState(false);

    React.useEffect(() => {
        if (isClosing) {
            closeForm.setData({
                ...closeForm.data,
                closing_cash: breakdown.expected_cash,
                closing_qris: breakdown.expected_qris,
                closing_online: breakdown.expected_online,
                closing_grab: breakdown.expected_grabfood,
                closing_gojek: breakdown.expected_gofood,
                closing_shopeefood: breakdown.expected_shopeefood,
            });
        }
    }, [isClosing]);

    const openForm = useForm({
        branch_id: branches.length > 0 ? branches[0].id : '',
        opening_cash: 0,
        notes: '',
    });

    const closeForm = useForm({
        closing_cash: 0,
        closing_qris: 0,
        closing_online: 0,
        closing_grab: 0,
        closing_gojek: 0,
        closing_shopeefood: 0,
        notes: '',
    });

    const totalClosing = Number(closeForm.data.closing_cash) + 
                        Number(closeForm.data.closing_qris) + 
                        Number(closeForm.data.closing_online) + 
                        Number(closeForm.data.closing_grab) + 
                        Number(closeForm.data.closing_gojek) +
                        Number(closeForm.data.closing_shopeefood);

    const handleOpenShift = (e: React.FormEvent) => {
        e.preventDefault();
        openForm.post(route('pos.shifts.open'));
    };

    const handleCloseShift = (e: React.FormEvent) => {
        e.preventDefault();
        closeForm.post(route('pos.shifts.close'));
    };

    return (
        <POSLayout>
            <Head title="Manajemen Shift" />
            
            <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-poppins font-bold text-charcoal">Manajemen Shift</h1>
                    <p className="text-gray-500 text-sm">Kelola status operasional kasir Anda.</p>
                </div>

                {!activeShift ? (
                    /* Open Shift UI */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-[#F0FAF6]">
                            <div className="flex items-center space-x-3 text-[#00C48C]">
                                <Clock size={24} />
                                <h2 className="font-bold text-lg">Buka Kasir</h2>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Silakan pilih cabang dan masukkan saldo awal untuk memulai shift.</p>
                        </div>
                        
                        <form onSubmit={handleOpenShift} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase">Pilih Cabang</label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select 
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00C48C] outline-none"
                                            value={openForm.data.branch_id}
                                            onChange={e => openForm.setData('branch_id', e.target.value)}
                                            required
                                        >
                                            {branches.map(branch => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase">Saldo Awal (Cash)</label>
                                    <div className="relative">
                                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="number"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00C48C] outline-none"
                                            placeholder="0"
                                            value={openForm.data.opening_cash}
                                            onChange={e => openForm.setData('opening_cash', e.target.value === '' ? '' as any : Number(e.target.value))}
                                            onFocus={e => e.target.select()}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase">Catatan (Opsional)</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00C48C] outline-none h-24"
                                    placeholder="Contoh: Shift Pagi, Uang kembalian Rp 500k..."
                                    value={openForm.data.notes}
                                    onChange={e => openForm.setData('notes', e.target.value)}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={openForm.processing}
                                className="w-full py-4 bg-[#00C48C] text-white font-bold rounded-lg hover:bg-[#00ab7a] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                <span>BUKA SHIFT SEKARANG</span>
                                <ArrowRight size={20} />
                            </button>
                        </form>
                    </div>
                ) : (
                    /* Active Shift UI */
                    <div className="space-y-6">
                        <div className="bg-[#1A1A1A] text-white rounded-xl p-8 flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-2 text-[#00C48C] mb-2">
                                    <CheckCircle2 size={20} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Shift Sedang Aktif</span>
                                </div>
                                <h2 className="text-3xl font-bold font-poppins">{activeShift.branch?.name}</h2>
                                <p className="text-gray-400 text-sm mt-1">Dibuka pada {tanggal(activeShift.opened_at)}</p>
                            </div>
                            <div className="text-right flex items-center gap-5 flex-wrap justify-end">
                                <div className="text-center">
                                    <p className="text-gray-400 text-[9px] uppercase font-bold mb-1">Cash</p>
                                    <p className="text-sm font-bold text-white">{rupiah(breakdown.expected_cash)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-[9px] uppercase font-bold mb-1">QRIS</p>
                                    <p className="text-sm font-bold text-blue-400">{rupiah(breakdown.expected_qris)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-[9px] uppercase font-bold mb-1">Online</p>
                                    <p className="text-sm font-bold text-indigo-400">{rupiah(breakdown.expected_online)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-[9px] uppercase font-bold mb-1 text-red-400">GoFood</p>
                                    <p className="text-sm font-bold text-red-400">{rupiah(breakdown.expected_gofood)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-[9px] uppercase font-bold mb-1 text-green-400">Grab</p>
                                    <p className="text-sm font-bold text-green-400">{rupiah(breakdown.expected_grabfood)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-[9px] uppercase font-bold mb-1 text-orange-400">Shopee</p>
                                    <p className="text-sm font-bold text-orange-400">{rupiah(breakdown.expected_shopeefood)}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                                <div>
                                    <p className="text-[#00C48C] text-[10px] uppercase font-bold mb-1">Total Ekspektasi</p>
                                    <p className="text-2xl font-black text-[#00C48C]">{rupiah(Number(breakdown.expected_cash) + Number(breakdown.expected_qris) + Number(breakdown.expected_online) + Number(breakdown.expected_gofood) + Number(breakdown.expected_grabfood) + Number(breakdown.expected_shopeefood))}</p>
                                </div>
                                {activeShift.void_count > 0 && (
                                    <>
                                        <div className="w-px h-10 bg-white/10"></div>
                                        <div className="text-center">
                                            <p className="text-red-400 text-[9px] uppercase font-bold mb-1">Void</p>
                                            <p className="text-sm font-bold text-red-500">{activeShift.void_count}x</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-lg bg-[#F0FAF6] text-[#00C48C] flex items-center justify-center">
                                    <Store size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Cabang</p>
                                    <p className="font-bold text-charcoal">{activeShift.branch?.name}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-lg bg-orange-50 text-[#FF8A00] flex items-center justify-center">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Status</p>
                                    <p className="font-bold text-charcoal">Menunggu Transaksi</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
                            <h3 className="font-bold text-lg text-charcoal">Siap Melayani Pelanggan?</h3>
                            <p className="text-gray-500 text-sm max-w-md mx-auto">Anda dapat mulai menggunakan layar POS untuk memproses transaksi. Jangan lupa untuk menutup shift di akhir jam kerja.</p>
                            <div className="flex items-center justify-center space-x-4 pt-4">
                                <a 
                                    href="/pos" 
                                    className="px-8 py-3 bg-[#00C48C] text-white font-bold rounded-lg hover:bg-[#00ab7a] transition-all"
                                >
                                    KE LAYAR POS
                                </a>
                                <button 
                                    onClick={() => setIsClosing(true)}
                                    className="px-8 py-3 border border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-50 transition-all"
                                >
                                    TUTUP SHIFT
                                </button>
                            </div>
                        </div>

                        {/* Close Shift Modal/Form overlay */}
                        {isClosing && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                                    <div className="p-6 bg-red-50 border-b border-red-100 flex items-center justify-between">
                                        <div className="flex items-center space-x-3 text-red-600">
                                            <Lock size={24} />
                                            <h2 className="font-bold text-lg">Tutup Kasir</h2>
                                        </div>
                                        <button onClick={() => setIsClosing(false)} className="text-gray-400 hover:text-charcoal transition-all">
                                            <AlertCircle size={24} className="rotate-45" />
                                        </button>
                                    </div>
                                    
                                    <form onSubmit={handleCloseShift} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Saldo Akhir (Cash)</label>
                                                <input 
                                                    type="number"
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                                    value={closeForm.data.closing_cash}
                                                    onChange={e => closeForm.setData('closing_cash', e.target.value === '' ? '' as any : Number(e.target.value))}
                                                    onFocus={e => e.target.select()}
                                                    required
                                                />
                                                <p className="text-[9px] text-[#2D6A4F] font-bold">Sistem: {rupiah(breakdown.expected_cash)}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Total QRIS</label>
                                                <input 
                                                    type="number"
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                                    value={closeForm.data.closing_qris}
                                                    onChange={e => closeForm.setData('closing_qris', e.target.value === '' ? '' as any : Number(e.target.value))}
                                                    onFocus={e => e.target.select()}
                                                    required
                                                />
                                                <p className="text-[9px] text-[#2D6A4F] font-bold">Sistem: {rupiah(breakdown.expected_qris)}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Pembelian Online</label>
                                                <input 
                                                    type="number"
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                                    value={closeForm.data.closing_online}
                                                    onChange={e => closeForm.setData('closing_online', e.target.value === '' ? '' as any : Number(e.target.value))}
                                                    onFocus={e => e.target.select()}
                                                    required
                                                />
                                                <p className="text-[9px] text-[#2D6A4F] font-bold">Sistem: {rupiah(breakdown.expected_online)}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Grab Food</label>
                                                <input 
                                                    type="number"
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                                    value={closeForm.data.closing_grab}
                                                    onChange={e => closeForm.setData('closing_grab', e.target.value === '' ? '' as any : Number(e.target.value))}
                                                    onFocus={e => e.target.select()}
                                                    required
                                                />
                                                <p className="text-[9px] text-[#2D6A4F] font-bold">Sistem: {rupiah(breakdown.expected_grabfood)}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">GoFood</label>
                                                <input 
                                                    type="number"
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                                    value={closeForm.data.closing_gojek}
                                                    onChange={e => closeForm.setData('closing_gojek', e.target.value === '' ? '' as any : Number(e.target.value))}
                                                    onFocus={e => e.target.select()}
                                                    required
                                                />
                                                <p className="text-[9px] text-[#2D6A4F] font-bold">Sistem: {rupiah(breakdown.expected_gofood)}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">ShopeeFood</label>
                                                <input 
                                                    type="number"
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                                    value={closeForm.data.closing_shopeefood}
                                                    onChange={e => closeForm.setData('closing_shopeefood', e.target.value === '' ? '' as any : Number(e.target.value))}
                                                    onFocus={e => e.target.select()}
                                                    required
                                                />
                                                <p className="text-[9px] text-[#2D6A4F] font-bold">Sistem: {rupiah(breakdown.expected_shopeefood)}</p>
                                            </div>

                                            <div className="bg-gray-900 rounded-2xl p-4 flex flex-col justify-center">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Akumulasi</p>
                                                <p className="text-xl font-black text-[#00C48C] tracking-tight">{rupiah(totalClosing)}</p>
                                            </div>
                                        </div>

                                        {activeShift.void_count > 0 && (
                                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3">
                                                <AlertCircle className="text-red-500" size={20} />
                                                <div>
                                                    <p className="text-[10px] font-black text-red-700 uppercase">Perhatian: Ada {activeShift.void_count} Void</p>
                                                    <p className="text-[10px] text-red-600">Terdeteksi aktivitas pembatalan transaksi pada shift ini.</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-700 uppercase">Catatan Akhir</label>
                                            <textarea 
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none h-24"
                                                placeholder="Sebutkan jika ada selisih atau catatan khusus..."
                                                value={closeForm.data.notes}
                                                onChange={e => closeForm.setData('notes', e.target.value)}
                                            />
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={closeForm.processing}
                                            className="w-full py-4 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                        >
                                            <Lock size={20} />
                                            <span>KONFIRMASI TUTUP SHIFT</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </POSLayout>
    );
}
