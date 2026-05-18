import React from 'react';
import { Head } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import { Order, PageProps } from '../../types';
import OrderCard from '../../Components/Customer/OrderCard';
import { PackageOpen } from 'lucide-react';

interface OrdersProps extends PageProps {
    orders: Order[];
}

export default function Orders({ orders }: OrdersProps) {
    return (
        <LandingLayout>
            <Head title="Riwayat Pesanan - EWWON COCO" />
            
            <div className="bg-gray-50 min-h-screen pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-poppins font-bold text-3xl text-[#1A1A1A] mb-8">Riwayat Pesanan</h1>

                    {orders.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <PackageOpen size={64} className="text-gray-300 mx-auto mb-4" />
                            <h2 className="font-poppins font-semibold text-xl text-[#1A1A1A] mb-2">Belum ada pesanan</h2>
                            <p className="text-gray-500 font-inter mb-6">Anda belum pernah melakukan pemesanan.</p>
                            <a href="/shop" className="bg-[#00C48C] hover:bg-[#00a878] text-white px-6 py-3 rounded-md font-semibold transition-colors">
                                Mulai Belanja
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </LandingLayout>
    );
}
