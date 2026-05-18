import React from 'react';
import { Head, Link } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import { PageProps } from '../../types';
import { UserCircle, Mail, Phone, LogOut } from 'lucide-react';

export default function Profile({ auth }: PageProps) {
    return (
        <LandingLayout>
            <Head title="Profil Saya - EWWON COCO" />
            
            <div className="bg-gray-50 min-h-screen pt-24 pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-poppins font-bold text-3xl text-[#1A1A1A] mb-8">Profil Saya</h1>

                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="p-8 flex flex-col items-center border-b border-gray-100">
                            <div className="w-24 h-24 bg-[#F0FAF6] text-[#00C48C] rounded-full flex items-center justify-center mb-4">
                                {auth.user?.avatar_url ? (
                                    <img src={auth.user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <UserCircle size={64} />
                                )}
                            </div>
                            <h2 className="font-poppins font-bold text-2xl text-[#1A1A1A]">{auth.user?.name}</h2>
                            <p className="text-gray-500 font-inter mt-1">{auth.user?.role.toUpperCase()}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link href="/loyalty" className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between group hover:bg-green-100 transition-all">
                                    <div>
                                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Saldo Poin</p>
                                        <p className="text-xl font-black text-charcoal">Loyalty Member</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-[#00C48C]">Lihat Poin →</span>
                                    </div>
                                </Link>
                                <Link href="/referral" className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between group hover:bg-blue-100 transition-all">
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Referral</p>
                                        <p className="text-xl font-black text-charcoal">Undang Teman</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-blue-500">Klaim Poin →</span>
                                    </div>
                                </Link>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1 font-inter">Email</label>
                                <div className="flex items-center text-[#1A1A1A] font-inter bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                                    <Mail size={18} className="mr-3 text-gray-400" />
                                    {auth.user?.email}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1 font-inter">Nomor HP</label>
                                <div className="flex items-center text-[#1A1A1A] font-inter bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                                    <Phone size={18} className="mr-3 text-gray-400" />
                                    {auth.user?.phone || 'Belum diatur'}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                            <Link 
                                href="/logout" 
                                method="post" 
                                as="button"
                                className="w-full sm:w-auto inline-flex items-center justify-center bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2 rounded-md font-semibold transition-colors"
                            >
                                <LogOut size={18} className="mr-2" /> Keluar
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
}
