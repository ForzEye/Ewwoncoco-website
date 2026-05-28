import { Link, usePage } from '@inertiajs/react';
import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { PageProps } from '@/types';
import { ShoppingBag, User, LogOut, ChevronDown, LayoutDashboard, Sparkles, Mail, Phone } from 'lucide-react';

interface LandingLayoutProps {
    children: ReactNode;
}

import { requestNotificationPermission, onMessageListener } from '@/lib/firebase-setup';

export default function LandingLayout({ children }: LandingLayoutProps) {
    const { auth, site_settings = {} } = usePage<PageProps>().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    useEffect(() => {
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
        <div className="min-h-screen flex flex-col bg-white">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border-base transition-all">
                <div className="container-max section-px h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        {site_settings.site_logo ? (
                            <img src={site_settings.site_logo} alt={site_settings.site_name} className="h-12 w-auto object-contain" />
                        ) : (
                            <img src="/images/logo.png" alt={site_settings.site_name || 'EWWON COCO'} className="h-12 w-auto object-contain" />
                        )}
                    </Link>

                    <nav className="hidden lg:flex items-center gap-10">
                        <Link href="/" className="text-sm font-bold text-gray-muted hover:text-primary transition-colors tracking-tight uppercase">
                            Home
                        </Link>
                        <Link href="/faq" className="text-sm font-bold text-gray-muted hover:text-primary transition-colors tracking-tight uppercase">
                            FAQ
                        </Link>
                        <Link href="/contact" className="text-sm font-bold text-gray-muted hover:text-primary transition-colors tracking-tight uppercase">
                            Kontak
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <div className="flex items-center gap-4">
                                <div className="relative" ref={dropdownRef}>
                                    <button 
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 group hover:bg-gray-50 px-2 py-1.5 rounded-full transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-[#F0FAF6] text-[#00C48C] rounded-full flex items-center justify-center font-bold border border-[#00C48C]/20 group-hover:bg-[#00C48C] group-hover:text-white transition-colors">
                                            {auth.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold text-charcoal hidden md:block">{auth.user.name}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-2 border-b border-gray-50 mb-2">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Menu Pengguna</p>
                                            </div>
                                            <Link href="/orders" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#F0FAF6] hover:text-[#00C48C] transition-colors">
                                                Pesanan Saya
                                            </Link>
                                            <Link href="/loyalty" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#F0FAF6] hover:text-[#00C48C] transition-colors">
                                                Poin & Reward
                                            </Link>
                                            <Link href="/chats" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#F0FAF6] hover:text-[#00C48C] transition-colors">
                                                Chat Merchant
                                            </Link>
                                            <Link href="/referral" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#F0FAF6] hover:text-[#00C48C] transition-colors">
                                                Undang Teman
                                            </Link>

                                            {/* Role Based Access */}
                                            {auth.user.role === 'admin' && (
                                                <div className="border-t border-gray-50 mt-2 pt-2">
                                                    <Link href="/admin" className="block px-4 py-2 text-sm font-black text-[#2D6A4F] hover:bg-[#F0FAF6] transition-colors flex items-center gap-2">
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        DASHBOARD ADMIN
                                                    </Link>
                                                </div>
                                            )}

                                            {auth.user.role === 'kasir' && (
                                                <div className="border-t border-gray-50 mt-2 pt-2">
                                                    <Link href="/pos/dashboard" className="block px-4 py-2 text-sm font-black text-[#2D6A4F] hover:bg-[#F0FAF6] transition-colors flex items-center gap-2">
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        DASHBOARD KASIR
                                                    </Link>
                                                    <Link href="/pos" className="block px-4 py-2 text-sm font-black text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4" />
                                                        BUKA LAYAR POS
                                                    </Link>
                                                </div>
                                            )}

                                            {auth.user.role === 'super_admin' && (
                                                <div className="border-t border-gray-50 mt-2 pt-2">
                                                    <Link href="/super-admin" className="block px-4 py-2 text-sm font-black text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2">
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        DASHBOARD SUPER
                                                    </Link>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-50 mt-2 pt-2">
                                                <Link href={route('logout')} method="post" as="button" className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                                                    <LogOut className="w-4 h-4" />
                                                    Keluar
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Link href="/shop" className="btn-primary py-2 px-4 rounded-full shadow-sm text-sm">
                                    <ShoppingBag className="w-4 h-4" />
                                    Belanja
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="text-sm font-semibold text-charcoal hover:text-primary transition-colors">
                                    Masuk
                                </Link>
                                <Link href="/register" className="btn-primary py-2 px-4 rounded-full shadow-sm text-sm">
                                    <User className="w-4 h-4" />
                                    Mulai Sekarang
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white text-charcoal pt-24 pb-12 border-t border-gray-100">
                <div className="container-max section-px grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            {site_settings.site_logo ? (
                                <img src={site_settings.site_logo} alt={site_settings.site_name} className="h-16 w-auto object-contain" loading="lazy" />
                            ) : (
                                <img src="/images/logo.png" alt={site_settings.site_name || 'EWWON COCO'} className="h-16 w-auto object-contain" loading="lazy" />
                            )}
                        </div>
                        <p className="text-gray-500 text-sm max-w-sm leading-relaxed font-medium">
                            {site_settings.footer_text || 'Nikmati kesegaran es kelapa muda asli dan dessert premium kami. Pesan online sekarang, kami antar sampai ke depan pintu Anda.'}
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="font-poppins font-black text-sm uppercase tracking-widest mb-6 text-charcoal">Layanan</h4>
                        <ul className="space-y-4 text-sm font-bold text-gray-400">
                            <li><Link href="/shop" className="hover:text-primary transition-colors">Menu Utama</Link></li>
                            <li><Link href="/info/delivery" className="hover:text-primary transition-colors">Pengiriman</Link></li>
                            <li><Link href="/info/pickup" className="hover:text-primary transition-colors">Ambil Sendiri</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-poppins font-black text-sm uppercase tracking-widest mb-6 text-charcoal">Bantuan</h4>
                        <ul className="space-y-4 text-sm font-bold text-gray-400">
                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Hubungi Kami</Link></li>
                        </ul>
                    </div>
                </div>
                
                <div className="container-max section-px border-t border-gray-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} {site_settings.site_name || 'EWWON COCO'}. All rights reserved.
                    </p>
                    <div className="flex gap-8">
                        <a href={site_settings.instagram_url || '#'} className="text-xs font-black text-charcoal hover:text-primary transition-colors uppercase tracking-widest">Instagram</a>
                        <a href={`https://wa.me/${site_settings.contact_whatsapp}`} className="text-xs font-black text-charcoal hover:text-primary transition-colors uppercase tracking-widest">WhatsApp</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
