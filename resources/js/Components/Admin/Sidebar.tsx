import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '../../types';
import { 
    Activity,
    LayoutDashboard, 
    ShoppingBag, 
    Package, 
    Users, 
    BarChart3, 
    Settings, 
    LogOut,
    Sparkles,
    Ticket,
    MessageSquare,
    ClipboardList,
    Box,
    FileSpreadsheet,
    Clock,
    Sliders
} from 'lucide-react';

export default function Sidebar() {
    const { url } = usePage();
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const allMenuItems = [
        // Admin Specific
        { name: 'Dashboard Admin', icon: LayoutDashboard, href: '/admin', active: url === '/admin', roles: ['admin', 'super_admin'] },
        { name: 'Semua Pesanan', icon: ShoppingBag, href: '/admin/orders', active: url.startsWith('/admin/orders'), roles: ['admin', 'super_admin'] },
        { name: 'Monitoring Shift', icon: Clock, href: '/admin/shifts', active: url === '/admin/shifts', roles: ['admin', 'super_admin'] },
        { name: 'Produk & Menu', icon: Package, href: '/admin/products', active: url.startsWith('/admin/products'), roles: ['admin', 'super_admin'] },
        { name: 'Kustomisasi Topping', icon: Sliders, href: '/admin/customizations', active: url.startsWith('/admin/customizations'), roles: ['admin', 'super_admin'] },
        { name: 'Bahan Baku', icon: ClipboardList, href: '/admin/inventory/ingredients', active: url === '/admin/inventory/ingredients', roles: ['admin', 'super_admin'] },
        { name: 'Stok Cabang', icon: Box, href: '/admin/inventory/stock', active: url === '/admin/inventory/stock', roles: ['admin', 'super_admin'] },
        { name: 'Resep (BOM)', icon: FileSpreadsheet, href: '/admin/inventory/recipes', active: url === '/admin/inventory/recipes', roles: ['admin', 'super_admin'] },
        { name: 'Laporan BI', icon: BarChart3, href: '/admin/reports', active: url === '/admin/reports', roles: ['admin', 'super_admin'] },
        { name: 'Promo BOGO', icon: Sparkles, href: '/admin/marketing', active: url === '/admin/marketing', roles: ['admin', 'super_admin'] },
        { name: 'Kupon Belanja', icon: Ticket, href: '/admin/vouchers', active: url === '/admin/vouchers', roles: ['admin', 'super_admin'] },
        
        // Super Admin Specific

        // Cashier Specific
        { name: 'Dashboard Kasir', icon: LayoutDashboard, href: '/pos/dashboard', active: url === '/pos/dashboard', roles: ['kasir', 'super_admin'] },
        { name: 'Buka POS', icon: Sparkles, href: '/pos', active: url === '/pos', roles: ['kasir', 'super_admin'] },
        { name: 'Pesanan Masuk', icon: ShoppingBag, href: '/pos/online-orders', active: url === '/pos/online-orders', roles: ['kasir', 'super_admin'] },
        { name: 'Stok Cabang', icon: Box, href: '/pos/inventory/stock', active: url === '/pos/inventory/stock', roles: ['kasir'] },
        { name: 'Manajemen Shift', icon: Clock, href: '/pos/shifts', active: url === '/pos/shifts', roles: ['kasir', 'super_admin'] },
        { name: 'Riwayat POS', icon: FileSpreadsheet, href: '/pos/history', active: url.startsWith('/pos/history'), roles: ['kasir', 'super_admin'] },

        // Shared
        { name: 'Chat Pelanggan', icon: MessageSquare, href: '/chats', active: url.startsWith('/chats'), roles: ['admin', 'kasir', 'super_admin'] },
        { name: 'Pengaturan', icon: Settings, href: '/admin/settings', active: url === '/admin/settings', roles: ['admin', 'super_admin'] },
    ];

    const menuItems = allMenuItems.filter(item => {
        if (!user) return false;
        return item.roles.includes(user.role);
    });

    return (
        <aside className="w-[280px] bg-white border-r border-[#F0F0F0] flex flex-col h-screen sticky top-0 z-40">
            {/* Logo Section */}
            <div className="p-8 pb-10 flex items-center gap-3.5">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2D6A4F] to-[#40916C] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2D6A4F]/20 rotate-[-4deg]">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="font-poppins font-black text-[18px] tracking-tight text-[#1A1A1A] leading-none">EWWON</span>
                    <span className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.25em] mt-1">Merchant Hub</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-5 space-y-1.5 overflow-y-auto scrollbar-hide">
                <p className="px-4 text-[10px] font-black text-[#D0D0D0] uppercase tracking-[0.2em] mb-4">Menu Utama</p>
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-inter text-[13px] font-black transition-all duration-300 ${
                            item.active 
                                ? 'bg-[#2D6A4F] text-white shadow-xl shadow-[#2D6A4F]/15 translate-x-1' 
                                : 'text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F9F9F9]'
                        }`}
                    >
                        <item.icon size={18} strokeWidth={item.active ? 2.5 : 2} className={item.active ? 'scale-110' : ''} />
                        <span className="tracking-tight">{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Footer Section */}
            <div className="p-6 mt-auto">
                <div className="bg-[#FAFAFA] rounded-3xl p-5 border border-[#F0F0F0]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Ticket className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-[11px] font-black text-[#1A1A1A]">Butuh Bantuan?</p>
                    </div>
                    <button className="w-full py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-[11px] font-bold text-[#8A8A8A] hover:bg-white hover:border-[#2D6A4F] hover:text-[#2D6A4F] transition-all shadow-sm">
                        Hubungi Support
                    </button>
                </div>

                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-4 px-4 py-4 mt-6 rounded-2xl font-inter text-[13px] font-black text-red-400 hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Keluar Sesi</span>
                </Link>
            </div>
        </aside>
    );
}
