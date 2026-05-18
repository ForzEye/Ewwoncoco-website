import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Lock, LogOut, MessageCircle, ShieldAlert } from 'lucide-react';
import { PosShift } from '../../types';

interface LockedProps {
    activeShift: PosShift & { branch: any };
}

export default function Locked({ activeShift }: LockedProps) {
    return (
        <div className="h-screen bg-[#F5F3EF] flex items-center justify-center p-6 select-none">
            <Head title="POS Terkunci - EWWON COCO" />
            
            <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl border border-[#E8E4DD] text-center space-y-8 animate-fadeIn">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto border-2 border-red-100">
                        <Lock size={48} className="text-red-500 animate-pulse" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-red-100 flex items-center justify-center">
                        <ShieldAlert size={20} className="text-red-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="font-poppins font-black text-3xl text-[#1A1A1A] tracking-tight">POS Terkunci</h1>
                    <p className="text-[#8A8379] text-sm leading-relaxed">
                        Batas void transaksi (3x) telah tercapai untuk shift ini. Sistem keamanan otomatis mengunci terminal.
                    </p>
                </div>

                <div className="bg-[#FAFAF8] rounded-3xl p-6 border border-[#F0EDE8] text-left space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-[#E8E4DD]">
                        <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest">ID Shift</span>
                        <span className="text-xs font-black text-[#1A1A1A]">#{activeShift.id}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-[#E8E4DD]">
                        <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest">Total Void</span>
                        <span className="text-xs font-black text-red-500">{activeShift.void_count} / 3</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-widest">Status</span>
                        <span className="text-[10px] font-black bg-red-100 text-red-600 px-3 py-1 rounded-full border border-red-200">TERKUNCI</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-bold text-[#B5AFA6] uppercase tracking-[0.2em]">Hubungi Admin untuk Membuka</p>
                    <div className="flex gap-3">
                        <button className="flex-1 bg-[#1A1A1A] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group">
                            <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                            Hubungi Admin
                        </button>
                        <Link 
                            href={route('pos.shifts')}
                            className="w-16 h-14 bg-white border border-[#E8E4DD] rounded-2xl flex items-center justify-center text-[#B5AFA6] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                            title="Log Out / Tutup Shift"
                        >
                            <LogOut size={20} />
                        </Link>
                    </div>
                </div>

                <p className="text-[9px] text-[#C4BEB5] font-medium italic">
                    Keamanan data adalah prioritas kami. Tindakan ini tercatat di log sistem.
                </p>
            </div>
        </div>
    );
}
