import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { 
    Clock, 
    User, 
    Store, 
    AlertCircle, 
    Unlock, 
    Power, 
    History,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { rupiah, tanggalWaktu } from '../../../lib/format';

interface Shift {
    id: number;
    cashier: {
        name: string;
    };
    branch: {
        name: string;
    };
    opened_at: string;
    closed_at: string | null;
    opening_cash: number;
    closing_cash: number | null;
    void_count: number;
    is_locked: boolean;
    notes: string | null;
}

interface AdminShiftsProps {
    activeShifts: Shift[];
    recentShifts: Shift[];
}

import { confirmAction, swal, toastSuccess } from '@/lib/swal';

export default function Index({ activeShifts, recentShifts }: AdminShiftsProps) {
    const handleUnlock = (shiftId: number) => {
        confirmAction(
            'Buka Kunci Shift?',
            'Buka kunci shift ini? Kasir akan bisa melakukan transaksi kembali.',
            'Ya, Unlock'
        ).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.shifts.unlock', shiftId), {}, {
                    onSuccess: () => {
                        toastSuccess('Shift berhasil di-unlock!');
                    }
                });
            }
        });
    };

    const handleForceClose = (shiftId: number) => {
        swal.fire({
            title: 'Tutup Paksa Shift',
            text: 'Masukkan jumlah kas akhir (Closing Cash):',
            input: 'number',
            inputValue: '0',
            showCancelButton: true,
            confirmButtonText: 'Tutup Paksa',
            cancelButtonText: 'Batal',
            inputValidator: (value) => {
                if (!value) {
                    return 'Jumlah kas akhir tidak boleh kosong!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value !== undefined) {
                router.post(route('admin.shifts.force_close', shiftId), {
                    closing_cash: result.value
                }, {
                    onSuccess: () => {
                        toastSuccess('Shift berhasil ditutup paksa!');
                    }
                });
            }
        });
    };

    const formatDuration = (start: string, end: string | null) => {
        if (!end) return '-';
        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        const diff = Math.abs(e - s);
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}j ${minutes}m`;
    };

    const formatClockTime = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('id-ID', { 
            day: '2-digit', 
            month: '2-digit', 
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\./g, ':').replace(',', '.');
    };

    return (
        <AdminLayout title="Monitoring Shift Kasir">
            <Head title="Monitoring Shift - EWWON COCO" />

            <div className="space-y-10">
                {/* Active Shifts Summary — Premium Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-7 rounded-[32px] border border-[#F0F0F0] shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 bg-[#F0FAF6] text-[#2D6A4F] rounded-2xl flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.15em] mb-0.5">Shift Aktif</p>
                            <h3 className="text-[20px] font-black text-[#1A1A1A] tracking-tighter font-poppins">{activeShifts.length} Kasir</h3>
                        </div>
                    </div>
                </div>

                {/* Main Table — Matching User Image */}
                <div className="bg-white rounded-[24px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280]">Kasir</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280]">Clock In</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280]">Clock Out</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280]">Durasi</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280]">Kas Awal</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280]">Void</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280]">Kas Akhir</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280]">Selisih</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280]">Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F3F4F6]">
                                {/* Active Shifts First */}
                                {activeShifts.map((shift) => (
                                    <tr key={shift.id} className="hover:bg-[#F9FAFB] transition-all group">
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-bold text-[#111827]">{shift.cashier?.name}</span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-[#2D6A4F] uppercase">Aktif</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[12px] text-[#4B5563]">{formatClockTime(shift.opened_at)}</td>
                                        <td className="px-6 py-4 text-[12px] text-[#9CA3AF] italic">Sedang Berjalan</td>
                                        <td className="px-6 py-4 text-[12px] text-[#4B5563]">{formatDuration(shift.opened_at, null)}</td>
                                        <td className="px-6 py-4 text-[12px] text-[#4B5563]">{rupiah(shift.opening_cash)}</td>
                                        <td className={`px-6 py-4 text-[12px] font-bold ${shift.void_count > 0 ? 'text-red-500' : 'text-[#9CA3AF]'}`}>
                                            {shift.void_count}x
                                        </td>
                                        <td className="px-6 py-4 text-[12px] text-[#9CA3AF]">-</td>
                                        <td className="px-6 py-4 text-[12px] text-[#9CA3AF]">-</td>
                                        <td className="px-6 py-4 text-[12px] text-[#9CA3AF]">
                                            <div className="flex items-center gap-2">
                                                {shift.is_locked && (
                                                    <button onClick={() => handleUnlock(shift.id)} className="text-[10px] font-black text-red-500 hover:underline">UNLOCK</button>
                                                )}
                                                <button onClick={() => handleForceClose(shift.id)} className="text-[10px] font-black text-gray-400 hover:text-red-500 hover:underline">TUTUP PAKSA</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* Recent Completed Shifts */}
                                {recentShifts.map((shift) => {
                                    const diff = (shift.closing_cash || 0) - shift.opening_cash;
                                    return (
                                        <tr key={shift.id} className="hover:bg-[#F9FAFB] transition-all">
                                            <td className="px-6 py-4 text-[13px] font-bold text-[#111827]">{shift.cashier?.name}</td>
                                            <td className="px-6 py-4 text-[12px] text-[#4B5563]">{formatClockTime(shift.opened_at)}</td>
                                            <td className="px-6 py-4 text-[12px] text-[#4B5563]">{formatClockTime(shift.closed_at)}</td>
                                            <td className="px-6 py-4 text-[12px] text-[#4B5563]">{formatDuration(shift.opened_at, shift.closed_at)}</td>
                                            <td className="px-6 py-4 text-[12px] text-[#4B5563]">{rupiah(shift.opening_cash)}</td>
                                            <td className={`px-6 py-4 text-[12px] font-bold ${shift.void_count > 0 ? 'text-red-500' : 'text-[#9CA3AF]'}`}>
                                                {shift.void_count}x
                                            </td>
                                            <td className="px-6 py-4 text-[12px] text-[#4B5563]">{rupiah(shift.closing_cash || 0)}</td>
                                            <td className={`px-6 py-4 text-[12px] font-black ${diff >= 0 ? 'text-[#2D6A4F]' : 'text-red-500'}`}>
                                                {diff >= 0 ? '+' : ''}{rupiah(diff)}
                                            </td>
                                            <td className="px-6 py-4 text-[12px] text-[#9CA3AF]">{shift.notes || '-'}</td>
                                        </tr>
                                    );
                                })}

                                {activeShifts.length === 0 && recentShifts.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center opacity-20">
                                                <Clock size={48} className="mb-4" />
                                                <p className="text-sm font-bold">Belum ada data shift.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
