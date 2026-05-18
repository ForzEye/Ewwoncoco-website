import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import { Send, Image, MessageCircle, ChevronLeft } from 'lucide-react';
import axios from 'axios';

interface ChatRoomProps {
    room: any;
    messages: any[];
    auth: any;
}

export default function ChatRoom({ room, messages: initialMessages, auth }: ChatRoomProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const isCustomer = auth.user.role === 'customer';

    const Layout = isCustomer ? LandingLayout : AdminLayout;
    const opponent = isCustomer ? room.merchant : room.customer;

    useEffect(() => {
        // Scroll to bottom
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Listen for real-time messages
        const channel = (window as any).Echo.private(`chat.${room.id}`);
        
        channel.listen('.MessageSent', (e: any) => {
            if (e.sender.id !== auth.user.id) {
                setMessages(prev => [...prev, e]);
            }
        });

        return () => {
            (window as any).Echo.leave(`chat.${room.id}`);
        };
    }, [room.id]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageText = newMessage;
        setNewMessage('');

        try {
            const response = await axios.post(route('chat.send', room.id), {
                message: messageText
            });
            
            setMessages(prev => [...prev, response.data]);
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    return (
        <Layout>
            <Head title={`Chat dengan ${opponent.name}`} />
            
            <div className={`flex flex-col ${isCustomer ? 'h-[calc(100vh-80px)] pt-20' : 'h-[calc(100vh-100px)]'}`}>
                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => router.get(route('chat.index'))} className="p-2 hover:bg-gray-50 rounded-full">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="w-10 h-10 bg-[#F0FAF6] rounded-full flex items-center justify-center font-bold text-[#00C48C]">
                            {opponent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-poppins font-bold text-charcoal">{opponent.name}</h3>
                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                    {messages.length > 0 ? messages.map((msg, idx) => {
                        const isMe = msg.sender_id === auth.user.id;
                        return (
                            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                                        isMe 
                                        ? 'bg-[#00C48C] text-white rounded-tr-none' 
                                        : 'bg-white text-charcoal rounded-tl-none'
                                    }`}>
                                        {msg.message}
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-bold px-1">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                            <MessageCircle size={48} className="opacity-20" />
                            <p className="italic text-sm">Belum ada pesan. Mulai obrolan sekarang!</p>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white p-4 border-t border-gray-100">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center space-x-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-[#00C48C]/30 transition-all">
                        <button type="button" className="p-2 text-gray-400 hover:text-charcoal transition-colors">
                            <Image size={20} />
                        </button>
                        <input 
                            type="text" 
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-gray-400"
                            placeholder="Tulis pesan Anda..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-3 bg-[#00C48C] text-white rounded-xl shadow-lg shadow-green-100 hover:bg-[#00ab7a] transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
