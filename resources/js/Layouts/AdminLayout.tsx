import React, { ReactNode } from 'react';
import { usePage, Link } from '@inertiajs/react';
import Sidebar from '../Components/Admin/Sidebar';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { PageProps } from '../types';
import { requestNotificationPermission, onMessageListener } from '../lib/firebase-setup';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { auth } = usePage<PageProps>().props;

    React.useEffect(() => {
        if (auth.user) {
            requestNotificationPermission();

            const unsubscribe = onMessageListener((payload: any) => {
                console.log('FCM Message received in foreground:', payload);
                if (Notification.permission === 'granted') {
                    new Notification(payload.notification.title, {
                        body: payload.notification.body,
                        icon: '/coconut_original.png',
                    });
                }
            });

            return () => {
                unsubscribe();
            };
        }
    }, [auth.user]);

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex font-inter text-[#1A1A1A]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header — Sophisticated & Clean */}
                <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] px-8 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-8 flex-1">
                        <h2 className="font-poppins font-black text-[20px] tracking-tight text-[#1A1A1A]">
                            {title || 'Ringkasan'}
                        </h2>
                        
                        {/* Search Bar — Minimalist */}
                        <div className="hidden md:flex items-center relative max-w-md w-full">
                            <Search className="absolute left-4 text-[#C4C4C4]" size={18} />
                            <input 
                                type="text" 
                                placeholder="Cari data, pesanan, atau menu..."
                                className="w-full bg-[#F5F5F5] border-transparent focus:bg-white focus:border-[#00C48C]/30 focus:ring-4 focus:ring-[#00C48C]/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm transition-all placeholder:text-[#C4C4C4]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notifications */}
                        <button className="w-10 h-10 flex items-center justify-center text-[#A0A0A0] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] rounded-xl transition-all relative">
                            <Bell size={20} strokeWidth={2.2} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#00C48C] rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,196,140,0.5)]"></span>
                        </button>
                        
                        <div className="w-px h-8 bg-[#F0F0F0]"></div>

                        {/* User Profile — Refined */}
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-[#1A1A1A] leading-none group-hover:text-[#00C48C] transition-colors">{auth.user?.name}</p>
                                <p className="text-[10px] font-bold text-[#A0A0A0] mt-1 uppercase tracking-[0.12em]">{auth.user?.role.replace('_', ' ')}</p>
                            </div>
                            <div className="relative">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#F5F5F5] to-[#EAEAEA] rounded-2xl flex items-center justify-center text-[#A0A0A0] border border-[#F0F0F0] shadow-sm group-hover:shadow-md transition-all overflow-hidden">
                                    {auth.user?.avatar_url ? (
                                        <img src={auth.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={22} strokeWidth={2} />
                                    )}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-lg flex items-center justify-center shadow-sm border border-[#F0F0F0]">
                                    <ChevronDown size={10} className="text-[#A0A0A0]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="p-8 lg:p-10 max-w-[1600px]">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
