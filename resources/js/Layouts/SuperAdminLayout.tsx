import React, { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Activity,
    LayoutDashboard, 
    Users, 
    Store, 
    MapPin, 
    BarChart3, 
    Settings, 
    LogOut,
    ShieldCheck,
    Bell,
    Globe,
    ShoppingBag,
    Menu,
    X
} from 'lucide-react';
import { PageProps } from '../types';
import { requestNotificationPermission, onMessageListener } from '../lib/firebase-setup';
import { toastWarning } from '../lib/swal';

interface SuperAdminLayoutProps {
    children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const { url } = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    React.useEffect(() => {
        if (auth.user) {
            requestNotificationPermission();

            const unsubscribe = onMessageListener((payload: any) => {
                console.log('FCM Message received in foreground:', payload);
                if (Notification.permission === 'granted' && payload.notification) {
                    new Notification(payload.notification.title, {
                        body: payload.notification.body,
                        icon: '/coconut_original.png',
                    });
                }
                if (payload.notification) {
                    toastWarning(`${payload.notification.title}: ${payload.notification.body}`);
                }
            });

            return () => {
                unsubscribe();
            };
        }
    }, [auth.user]);

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/super-admin', active: url === '/super-admin' },
        { label: 'Users Control', icon: Users, href: '/super-admin/users', active: url.startsWith('/super-admin/users') },
        { label: 'Merchants', icon: Store, href: '/super-admin/merchants', active: url.startsWith('/super-admin/merchants') },
        { label: 'Global Orders', icon: ShoppingBag, href: '/super-admin/orders', active: url.startsWith('/super-admin/orders') },
        { label: 'Global Branches', icon: MapPin, href: '/super-admin/branches', active: url.startsWith('/super-admin/branches') },
        { label: 'System Monitoring', icon: Activity, href: '/super-admin/monitoring', active: url.startsWith('/super-admin/monitoring') },
        { label: 'System Analytics', icon: BarChart3, href: '/super-admin/analytics', active: url.startsWith('/super-admin/analytics') },
        { label: 'Global Settings', icon: Settings, href: '/super-admin/settings', active: url.startsWith('/super-admin/settings') },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-45 lg:hidden backdrop-blur-sm transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-[#1A1A1A] text-white flex flex-col flex-shrink-0 fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-40 transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#00C48C] rounded-xl flex items-center justify-center shadow-lg shadow-[#00C48C]/20">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="font-poppins font-bold text-lg leading-none">SUPER PANEL</h1>
                            <p className="text-[10px] text-gray-400 mt-1 tracking-widest uppercase">Ewwon Coco Central</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)} 
                        className="lg:hidden p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                                item.active 
                                    ? 'bg-[#00C48C] text-white shadow-lg shadow-[#00C48C]/20' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} className={item.active ? 'text-white' : 'group-hover:text-white transition-colors'} />
                            <span className="font-bold text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-bold text-sm">Sign Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-50 rounded-xl text-charcoal transition-all"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden sm:flex items-center space-x-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <Globe size={14} />
                            <span>Global System Control</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative text-gray-400 hover:text-charcoal transition-colors">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">3</span>
                        </button>
                        
                        <div className="h-8 w-px bg-gray-100"></div>

                        <div className="flex items-center space-x-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-charcoal">{auth.user?.name}</p>
                                <p className="text-[10px] text-[#00C48C] font-bold uppercase">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                                {auth.user?.avatar_url ? (
                                    <img src={auth.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <ShieldCheck className="text-gray-400" size={20} />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
