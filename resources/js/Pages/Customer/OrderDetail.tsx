import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import { Order, PageProps } from '../../types';
import { rupiah, tanggal } from '../../lib/format';
import { ChevronLeft, MapPin, Truck, CheckCircle, Clock, MessageCircle, ShoppingBag } from 'lucide-react';
import OrderTrackingMap from '../../Components/Customer/OrderTrackingMap';

interface OrderDetailProps extends PageProps {
    order: Order;
}

export default function OrderDetail({ order: initialOrder }: OrderDetailProps) {
    const [order, setOrder] = React.useState(initialOrder);
    const [driverPos, setDriverPos] = React.useState<{ lat: number, lng: number } | null>(null);
    const [selectedItem, setSelectedItem] = React.useState<any>(null);
    const [rating, setRating] = React.useState(5);
    const [comment, setComment] = React.useState('');
    const [processing, setProcessing] = React.useState(false);

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('reviews.store'), {
            order_id: order.id,
            product_id: selectedItem.product_id,
            rating: rating,
            comment: comment
        }, {
            onSuccess: () => {
                setSelectedItem(null);
                setRating(5);
                setComment('');
                setProcessing(false);
            },
            onError: () => setProcessing(false)
        });
    };

    React.useEffect(() => {
        // Listen for order status updates
        const channel = (window as any).Echo.private(`order.${order.id}`);
        
        channel.listen('.OrderStatusUpdated', (e: any) => {
            setOrder(prev => ({ ...prev, status: e.status }));
        });

        channel.listen('.DriverLocationUpdated', (e: any) => {
            setDriverPos({ lat: parseFloat(e.lat), lng: parseFloat(e.lng) });
        });

        return () => {
            (window as any).Echo.leave(`order.${order.id}`);
        };
    }, [order.id]);
    
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">Menunggu</span>;
            case 'confirmed': return <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">Dikonfirmasi</span>;
            case 'preparing': return <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">Disiapkan</span>;
            case 'ready_for_pickup': return <span className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full">Siap Diambil</span>;
            case 'on_delivery': return <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">Dalam Pengiriman</span>;
            case 'delivered': return <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">Selesai</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">Dibatalkan</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">{status}</span>;
        }
    };

    return (
        <LandingLayout>
            <Head title={`Pesanan ${order.order_number} - EWWON COCO`} />
            
            <div className="bg-gray-50 min-h-screen pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/orders" className="inline-flex items-center text-[#00C48C] hover:text-[#00a878] font-medium mb-6 transition-colors">
                        <ChevronLeft size={20} className="mr-1" />
                        Kembali ke Riwayat Pesanan
                    </Link>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
                        {/* Header Detail */}
                        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <h1 className="font-poppins font-bold text-2xl text-[#1A1A1A] mb-1">
                                    {order.order_number}
                                </h1>
                                <div className="text-gray-500 font-inter text-sm flex items-center">
                                    <Clock size={16} className="mr-1" /> {tanggal(order.created_at)}
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Link 
                                    href={route('chat.open', order.merchant_id)}
                                    className="p-2 bg-white border border-gray-200 text-charcoal hover:text-[#00C48C] hover:border-[#00C48C] rounded-lg transition-all flex items-center space-x-2 text-sm font-bold shadow-sm"
                                >
                                    <MessageCircle size={18} />
                                    <span>Chat Penjual</span>
                                </Link>
                                {getStatusBadge(order.status)}
                            </div>
                        </div>

                        {/* Tracking Map Component */}
                        {['preparing', 'ready_for_pickup', 'on_delivery', 'delivered'].includes(order.status) && (
                            <div className="border-b border-gray-200">
                                <OrderTrackingMap 
                                    orderId={order.id}
                                    storeLocation={{ 
                                        lat: parseFloat(order.branch?.lat?.toString() || '-6.200000'), 
                                        lng: parseFloat(order.branch?.lng?.toString() || '106.816666') 
                                    }}
                                    deliveryLocation={order.delivery_type === 'pickup' ? undefined : { 
                                        lat: parseFloat(order.delivery_lat?.toString() || '-6.210000'), 
                                        lng: parseFloat(order.delivery_lng?.toString() || '106.820000') 
                                    }}
                                    driverLocation={order.delivery_type === 'pickup' ? null : driverPos}
                                />
                            </div>
                        )}

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Rincian Produk */}
                            <div>
                                <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] mb-4">Rincian Produk</h3>
                                <div className="space-y-4">
                                    {order.items?.map(item => (
                                        <div key={item.id} className="space-y-2">
                                            <div className="flex justify-between font-inter text-sm">
                                                <div className="flex-1">
                                                    <div className="font-medium text-[#1A1A1A]">{item.quantity}x {item.product?.name}</div>
                                                </div>
                                                <div className="font-semibold text-[#1A1A1A]">{rupiah(item.subtotal)}</div>
                                            </div>
                                            {order.status === 'delivered' && (
                                                <button 
                                                    onClick={() => setSelectedItem(item)}
                                                    className="text-xs font-bold text-[#00C48C] hover:underline flex items-center"
                                                >
                                                    <span className="mr-1">★</span> Beri Ulasan
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-6 border-t border-gray-200 pt-4 space-y-2 text-sm font-inter">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal Produk</span>
                                        <span>{rupiah(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Ongkos Kirim</span>
                                        <span>{rupiah(order.delivery_fee)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#00C48C] font-semibold">
                                        <span>Diskon</span>
                                        <span>-{rupiah(order.discount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                                        <span className="font-poppins font-bold text-[#1A1A1A]">Total Belanja</span>
                                        <span className="font-poppins font-bold text-xl text-[#00C48C]">{rupiah(order.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Pengiriman & Pembayaran */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] mb-3 flex items-center">
                                        {order.delivery_type === 'pickup' ? (
                                            <ShoppingBag size={18} className="mr-2 text-[#00C48C]" />
                                        ) : (
                                            <Truck size={18} className="mr-2 text-[#00C48C]" />
                                        )}
                                        {order.delivery_type === 'pickup' ? 'Info Pengambilan' : 'Info Pengiriman'}
                                    </h3>
                                    <div className="bg-gray-50 rounded-md p-4 border border-gray-100 font-inter text-sm">
                                        <p className="font-semibold text-[#1A1A1A] mb-1">
                                            {order.delivery_type === 'pickup' ? 'Ambil di Outlet' : 
                                             (order.delivery_request?.provider === 'gosend' ? 'GoSend' : 
                                              order.delivery_request?.provider === 'grabexpress' ? 'GrabExpress' : 'Kurir')}
                                        </p>
                                        <p className="text-gray-600">
                                            {order.delivery_type === 'pickup' ? (order.branch?.name || 'Outlet Ewwon Coco') : order.delivery_address}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-poppins font-semibold text-lg text-[#1A1A1A] mb-3 flex items-center">
                                        <CheckCircle size={18} className="mr-2 text-[#00C48C]" /> Info Pembayaran
                                    </h3>
                                    <div className="bg-gray-50 rounded-md p-4 border border-gray-100 font-inter text-sm">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Metode Pembayaran</span>
                                            <span className="font-semibold text-[#1A1A1A]">
                                                {order.payment_method === 'qris' ? 'QRIS Statis' : 
                                                 order.payment_method === 'manual_transfer' ? 'Transfer Manual' : 'Lainnya'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Status</span>
                                            <span className={`font-semibold ${order.payment_status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {order.payment_status === 'confirmed' ? 'Berhasil' : 'Menunggu Konfirmasi'}
                                            </span>
                                        </div>

                                        {/* Payment Proof Section */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="text-gray-600 mb-2">Bukti Pembayaran:</div>
                                            {order.payment_proof_url ? (
                                                <div className="relative group">
                                                    <img src={`/${order.payment_proof_url}`} alt="Bukti Pembayaran" className="w-full rounded-md border border-gray-300" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md text-white text-xs">
                                                        Sudah diunggah
                                                    </div>
                                                </div>
                                            ) : (
                                                <form 
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        const formData = new FormData(e.currentTarget);
                                                        router.post(`/orders/${order.id}/payment-proof`, formData);
                                                    }}
                                                    className="space-y-3"
                                                >
                                                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-[#00C48C] transition-colors">
                                                        <input 
                                                            type="file" 
                                                            name="payment_proof" 
                                                            className="text-xs w-full"
                                                            required
                                                            accept="image/*"
                                                        />
                                                    </div>
                                                    <button 
                                                        type="submit"
                                                        className="w-full bg-[#00C48C] hover:bg-[#00a878] text-white py-2 rounded-md text-xs font-semibold"
                                                    >
                                                        Unggah Bukti Transfer
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeInUp">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F0FAF6]">
                            <h3 className="font-poppins font-bold text-lg text-charcoal">Beri Ulasan</h3>
                            <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-charcoal transition-colors">
                                <Clock size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleReviewSubmit} className="p-8 space-y-6">
                            <div className="text-center space-y-2">
                                <p className="text-sm font-medium text-gray-500">Bagaimana kualitas produk ini?</p>
                                <p className="text-lg font-bold text-charcoal">{selectedItem.product?.name}</p>
                            </div>

                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`text-4xl transition-all ${star <= rating ? 'text-[#FF8A00]' : 'text-gray-200'}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Komentar (Opsional)</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00C48C]/20 outline-none min-h-[100px] resize-none"
                                    placeholder="Tulis pengalaman Anda..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full py-4 bg-[#00C48C] text-white font-bold rounded-xl text-sm hover:bg-[#00ab7a] transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                            >
                                Kirim Ulasan
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </LandingLayout>
    );
}

