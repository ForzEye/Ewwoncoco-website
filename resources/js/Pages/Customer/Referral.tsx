import React from 'react';
import { Head } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import { Share2, Users, Gift, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReferralProps {
    referral_code: string;
    referrals: any[];
    total_points: number;
}

export default function Referral({ referral_code, referrals, total_points }: ReferralProps) {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referral_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <LandingLayout>
            <Head title="Referral Program - Ewwon Coco" />
            
            <div className="bg-[#F0FAF6] py-16">
                <div className="container-max section-px">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm">
                            <Gift className="text-[#00C48C]" size={20} />
                            <span className="text-sm font-bold text-charcoal tracking-wide uppercase">Share & Earn Rewards</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-poppins font-black text-charcoal leading-tight">
                            Undang Teman & Dapatkan <br/> <span className="text-[#00C48C]">Poin Gratis!</span>
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Bagikan kode referral Anda. Teman Anda mendapatkan diskon pesanan pertama, dan Anda mendapatkan 1.000 poin saat mereka selesai belanja.
                        </p>

                        <div className="mt-12 bg-white p-8 rounded-3xl shadow-xl shadow-green-100/50 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-left space-y-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kode Referral Anda</p>
                                <div className="flex items-center space-x-4">
                                    <span className="text-3xl font-black text-charcoal tracking-tighter">{referral_code}</span>
                                    <button 
                                        onClick={copyToClipboard}
                                        className="p-2 bg-gray-50 text-gray-500 hover:text-[#00C48C] rounded-lg transition-all"
                                    >
                                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <button className="btn-primary px-8 py-3 rounded-2xl flex items-center space-x-2">
                                    <Share2 size={20} />
                                    <span>Bagikan Sekarang</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-20 container-max section-px">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stats Card */}
                    <div className="col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-sm font-bold text-gray-400 uppercase mb-2">Total Teman Bergabung</p>
                            <div className="flex items-end space-x-2">
                                <span className="text-4xl font-black text-charcoal">{referrals.length}</span>
                                <span className="text-gray-400 font-medium mb-1">Orang</span>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-sm font-bold text-gray-400 uppercase mb-2">Poin Didapat</p>
                            <div className="flex items-end space-x-2">
                                <span className="text-4xl font-black text-[#00C48C]">{total_points.toLocaleString()}</span>
                                <span className="text-gray-400 font-medium mb-1">Poin</span>
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-poppins font-bold text-xl">Daftar Teman</h3>
                                <Users className="text-gray-300" size={24} />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Teman</th>
                                            <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tanggal Bergabung</th>
                                            <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Status Reward</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {referrals.length > 0 ? referrals.map((ref) => (
                                            <tr key={ref.id}>
                                                <td className="px-8 py-6 font-bold text-charcoal">{ref.name}</td>
                                                <td className="px-8 py-6 text-gray-500">{new Date(ref.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Berhasil</span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-8 py-20 text-center text-gray-400 italic">
                                                    Belum ada teman yang bergabung. Mulai bagikan kode Anda!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
}
