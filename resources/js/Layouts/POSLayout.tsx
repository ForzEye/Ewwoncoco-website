import React, { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    History, 
    Settings,
    Sparkles,
    Clock,
    LayoutGrid,
    Wifi,
    WifiOff,
    ShoppingBag
} from 'lucide-react';
import axios from 'axios';
import OnlineOrdersModal from '../Components/POS/OnlineOrdersModal';
import { PageProps } from '../types';
import { requestNotificationPermission, onMessageListener } from '../lib/firebase-setup';
import { toastWarning, toastSuccess, toastError } from '../lib/swal';

interface POSLayoutProps {
    children: ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
    const { auth, flash } = usePage<PageProps>().props;

    React.useEffect(() => {
        if (flash?.success) {
            toastSuccess(flash.success);
        }
        if (flash?.error) {
            toastError(flash.error);
        }
        if (flash?.warning) {
            toastWarning(flash.warning);
        }
    }, [flash]);
    const [isOnline, setIsOnline] = React.useState(true);
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [pendingOrders, setPendingOrders] = React.useState<any[]>([]);
    const [isOrdersModalOpen, setIsOrdersModalOpen] = React.useState(false);

    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Fetch initial pending orders
        fetchPendingOrders();

        if (auth.user) {
            requestNotificationPermission();

            const unsubscribeFCM = onMessageListener((payload: any) => {
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

            // Cleanup FCM when user changes or unmounts
            var cleanupFCM = () => unsubscribeFCM();
        } else {
            var cleanupFCM = () => {};
        }

        // Listen for new orders
        const merchantId = auth.user?.merchant_id || 1;
        const channel = (window as any).Echo.private(`merchant.${merchantId}.orders`);
        channel.listen('.OrderPlaced', (e: any) => {
            setPendingOrders(prev => [e.order, ...prev]);
            // Play notification sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed'));
        });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(timer);
            (window as any).Echo.leave(`merchant.${merchantId}.orders`);
            cleanupFCM();
        };
    }, [auth.user]);

    const fetchPendingOrders = async () => {
        try {
            const response = await axios.get(route('pos.online_orders.index'));
            setPendingOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch pending orders', error);
        }
    };

    const navItems = [
        { label: 'Transaksi', href: '/pos', icon: LayoutGrid, match: (p: string) => p === '/pos' },
        { label: 'Pesanan Online', href: '#', icon: ShoppingBag, onClick: () => setIsOrdersModalOpen(true), badge: pendingOrders.length },
        { label: 'Riwayat', href: '/pos/history', icon: History, match: (p: string) => p.startsWith('/pos/history') },
        { label: 'Shift', href: '/pos/shifts', icon: Clock, match: (p: string) => p.startsWith('/pos/shifts') },
    ];

    return (
        <div className="h-screen bg-[#F5F3EF] flex flex-col overflow-hidden select-none">
            {/* Header — Warm Cream Premium */}
            <header className="h-[64px] bg-white border-b border-[#E8E4DD] flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-10 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-3 lg:gap-7">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2D6A4F] to-[#40916C] rounded-2xl flex items-center justify-center shadow-md shadow-[#2D6A4F]/15">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden lg:flex flex-col">
                            <span className="font-poppins font-black text-[#1A1A1A] tracking-tight text-[16px] leading-none">EWWON POS</span>
                            <span className="text-[9px] font-bold text-[#B5AFA6] uppercase tracking-[0.2em] mt-0.5">Smart Terminal</span>
                        </div>
                    </div>
                    
                    {/* Nav Tabs — Warm pill style */}
                    <nav className="flex items-center bg-[#F5F3EF] p-1 rounded-2xl">
                        {navItems.map((item) => {
                            const isActive = item.match ? item.match(window.location.pathname) : false;
                            const Tag = item.href === '#' ? 'button' : Link;
                            
                            return (
                                <Tag 
                                    key={item.label}
                                    href={item.href !== '#' ? item.href : undefined}
                                    onClick={item.onClick}
                                    className={`flex items-center gap-2 px-3 lg:px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                                        isActive 
                                            ? 'bg-white text-[#2D6A4F] shadow-sm border border-[#E8E4DD]' 
                                            : 'text-[#B5AFA6] hover:text-[#1A1A1A]'
                                    }`}
                                >
                                    <item.icon size={15} />
                                    <span className="hidden lg:inline">{item.label}</span>
                                    {(item.badge ?? 0) > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                            {item.badge}
                                        </span>
                                    )}
                                </Tag>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-2 lg:gap-5">
                    {/* Live Clock */}
                    <div className="hidden lg:block text-right">
                        <p className="text-[9px] font-bold text-[#B5AFA6] uppercase tracking-[0.12em]">
                            {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-[14px] font-black text-[#1A1A1A] tabular-nums tracking-tight font-mono">
                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                    </div>

                    <div className="hidden lg:block w-px h-8 bg-[#E8E4DD]"></div>

                    {/* Online Status */}
                    <div className={`flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 rounded-full ${isOnline ? 'bg-[#E8F5E9]' : 'bg-red-50'}`}>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#2D6A4F] animate-pulse' : 'bg-red-500'}`}></div>
                        <span className={`hidden lg:inline text-[9px] font-black uppercase tracking-[0.1em] ${isOnline ? 'text-[#2D6A4F]' : 'text-red-500'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>

                    <div className="hidden lg:block w-px h-8 bg-[#E8E4DD]"></div>

                    {/* User */}
                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F5F3EF] border border-[#E8E4DD] flex items-center justify-center font-poppins font-black text-[#2D6A4F] text-sm">
                            {auth.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden xl:block text-right">
                            <p className="text-xs font-bold text-[#1A1A1A] leading-none">{auth.user?.name}</p>
                            <p className="text-[9px] text-[#2D6A4F] font-bold mt-1 uppercase tracking-[0.1em]">Kasir</p>
                        </div>
                        <Link 
                            href={route('pos.dashboard')} 
                            className="w-9 h-9 rounded-xl bg-[#F5F3EF] border border-[#E8E4DD] flex items-center justify-center hover:bg-[#E8E4DD] transition-all text-[#B5AFA6] hover:text-[#1A1A1A]"
                            title="Dashboard Kasir"
                        >
                            <Settings size={16} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-hidden relative z-0">
                {children}
            </main>

            <OnlineOrdersModal 
                isOpen={isOrdersModalOpen}
                onClose={() => setIsOrdersModalOpen(false)}
                orders={pendingOrders}
                onUpdate={fetchPendingOrders}
            />
        </div>
    );
}
