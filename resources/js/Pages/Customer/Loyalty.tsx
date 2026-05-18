import React from 'react';
import { Head } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import { LoyaltyPoint, PageProps } from '../../types';
import { tanggal } from '../../lib/format';
import { Award, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface LoyaltyProps extends PageProps {
    points: LoyaltyPoint[];
    totalPoints: number;
}

export default function Loyalty({ points, totalPoints }: LoyaltyProps) {
    return (
        <LandingLayout>
            <Head title="Poin & Loyalty - EWWON COCO" />
            
            <div className="bg-gray-50 min-h-screen pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-poppins font-bold text-3xl text-[#1A1A1A] mb-8">Poin Member</h1>

                    <div className="bg-gradient-to-r from-[#00C48C] to-[#00a878] rounded-xl p-8 text-white mb-8 shadow-md relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <div className="text-white/80 font-inter mb-1">Total Poin Saat Ini</div>
                                <div className="font-poppins font-bold text-5xl flex items-center">
                                    <Award size={40} className="mr-3 text-[#FF8A00]" />
                                    {totalPoints.toLocaleString('id-ID')}
                                </div>
                            </div>
                            <div className="mt-6 md:mt-0 text-right">
                                <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm inline-block">
                                    <span className="block text-sm">Status Member</span>
                                    <span className="font-bold text-lg">
                                        {totalPoints > 1000 ? 'Gold' : totalPoints > 500 ? 'Silver' : 'Bronze'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Blob */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white rounded-full opacity-10 blur-2xl"></div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="font-poppins font-semibold text-xl text-[#1A1A1A]">Riwayat Poin</h2>
                        </div>
                        
                        {points.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 font-inter">
                                Belum ada riwayat poin. Belanja sekarang untuk mendapatkan poin!
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {points.map(point => (
                                    <div key={point.id} className="p-4 sm:p-6 flex items-center justify-between">
                                        <div className="flex items-start">
                                            <div className={`mt-1 mr-4 p-2 rounded-full ${
                                                point.transaction_type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                                {point.transaction_type === 'earn' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-poppins font-medium text-[#1A1A1A]">
                                                    {point.description || (point.transaction_type === 'earn' ? 'Poin didapatkan' : 'Poin ditukarkan')}
                                                </div>
                                                <div className="text-sm text-gray-500 font-inter mt-1">
                                                    {tanggal(point.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`font-bold font-poppins text-lg ${
                                            point.transaction_type === 'earn' ? 'text-[#00C48C]' : 'text-red-500'
                                        }`}>
                                            {point.transaction_type === 'earn' ? '+' : '-'}{point.points}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
}
