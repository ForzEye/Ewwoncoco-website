import React from 'react';
import { Head, Link } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import { MessageSquare, Search, ChevronRight } from 'lucide-react';

interface ChatListProps {
    rooms: any[];
    auth: any;
}

export default function ChatList({ rooms, auth }: ChatListProps) {
    const isCustomer = auth.user.role === 'customer';
    const Layout = isCustomer ? LandingLayout : AdminLayout;

    return (
        <Layout>
            <Head title="Kotak Masuk Chat - Ewwon Coco" />
            
            <div className={`max-w-5xl mx-auto px-4 ${isCustomer ? 'py-32' : 'py-10'}`}>
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-charcoal font-poppins">Pesan Masuk</h1>
                        <p className="text-gray-400 text-sm font-medium mt-1">Kelola percakapan Anda dengan {isCustomer ? 'Merchant' : 'Pelanggan'}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Search bar placeholder */}
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Cari percakapan..." 
                                className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {rooms.length > 0 ? rooms.map((room) => {
                            const opponent = isCustomer ? room.merchant : room.customer;
                            return (
                                <Link 
                                    key={room.id} 
                                    href={route('chat.show', room.id)}
                                    className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-14 h-14 bg-[#F0FAF6] rounded-2xl flex items-center justify-center font-bold text-[#00C48C] text-xl">
                                            {opponent?.name ? opponent.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-charcoal group-hover:text-[#00C48C] transition-colors">{opponent?.name || 'Tanpa Nama'}</h3>
                                            <p className="text-sm text-gray-400 font-medium line-clamp-1 mt-0.5">
                                                Klik untuk melihat percakapan...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                            {room.last_message_at ? new Date(room.last_message_at).toLocaleDateString() : 'Baru'}
                                        </span>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-[#00C48C] transition-all" />
                                    </div>
                                </Link>
                            );
                        }) : (
                            <div className="py-32 text-center space-y-6">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                    <MessageSquare size={32} className="text-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <p className="font-poppins font-bold text-charcoal text-lg">Belum Ada Chat</p>
                                    <p className="text-gray-400 text-sm max-w-xs mx-auto font-medium">Mulai obrolan dengan merchant untuk bertanya seputar produk atau pesanan.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
