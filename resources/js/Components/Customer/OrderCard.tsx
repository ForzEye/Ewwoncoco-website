import React from 'react';
import { Order } from '../../types';
import { rupiah, tanggal } from '../../lib/format';
import { Package, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface OrderCardProps {
    order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">Menunggu</span>;
            case 'confirmed': return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">Dikonfirmasi</span>;
            case 'preparing': return <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded">Disiapkan</span>;
            case 'ready_for_pickup': return <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">Siap Diambil</span>;
            case 'on_delivery': return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">Dalam Pengiriman</span>;
            case 'delivered': return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Selesai</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">Dibatalkan</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">{status}</span>;
        }
    };

    return (
        <Link 
            href={`/orders/${order.id}`}
            className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-[#00C48C] hover:shadow-sm transition-all duration-200"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                    <div className="bg-[#F0FAF6] p-2 rounded-md">
                        <Package size={20} className="text-[#00C48C]" />
                    </div>
                    <div>
                        <div className="font-poppins font-semibold text-[#1A1A1A] text-sm">
                            {order.order_number}
                        </div>
                        <div className="text-xs text-gray-500 font-inter">
                            {tanggal(order.created_at)}
                        </div>
                    </div>
                </div>
                <div>{getStatusBadge(order.status)}</div>
            </div>
            
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <div>
                    <div className="text-xs text-gray-500 font-inter mb-1">Total Belanja</div>
                    <div className="font-poppins font-bold text-[#1A1A1A]">
                        {rupiah(order.total)}
                    </div>
                </div>
                <div className="text-[#00C48C] flex items-center text-sm font-semibold">
                    Detail <ChevronRight size={16} className="ml-1" />
                </div>
            </div>
        </Link>
    );
}
