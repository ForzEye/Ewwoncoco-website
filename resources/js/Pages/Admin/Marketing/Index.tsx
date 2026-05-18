import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Megaphone, Trash2, Calendar, Target, Power } from 'lucide-react';
import { rupiah } from '../../../lib/format';

interface MarketingProps {
    promotions: any[];
}

export default function Marketing({ promotions }: MarketingProps) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        description: '',
        type: 'cashback_points',
        value: '',
        min_purchase: '',
        max_reward: '',
        start_date: '',
        end_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.marketing.store'), {
            onSuccess: () => {
                reset();
                // Close modal if needed
            }
        });
    };

    return (
        <AdminLayout title="Marketing Tools">
            <Head title="Marketing & Promotions - Ewwon Coco" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Promo Creator Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center space-x-3 text-[#00C48C]">
                            <Megaphone size={24} />
                            <h3 className="font-poppins font-bold text-xl text-charcoal">Buat Promo Baru</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Nama Promo</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                    placeholder="Contoh: Cashback Akhir Bulan"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Tipe</label>
                                    <select 
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                    >
                                        <option value="cashback_points">Cashback Poin</option>
                                        <option value="fixed_discount">Diskon Tetap</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Nilai (Rp/Poin)</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        placeholder="5000"
                                        value={data.value}
                                        onChange={e => setData('value', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Minimal Belanja</label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                    placeholder="50000"
                                    value={data.min_purchase}
                                    onChange={e => setData('min_purchase', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Mulai</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Selesai</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full py-3 bg-[#00C48C] text-white font-bold rounded-xl text-sm hover:bg-[#00ab7a] transition-all shadow-lg shadow-green-100 mt-4 disabled:opacity-50"
                            >
                                Simpan Campaign
                            </button>
                        </form>
                    </div>
                </div>

                {/* Promo List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50">
                            <h3 className="font-poppins font-bold text-xl text-charcoal">Daftar Campaign Aktif</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {promotions.length > 0 ? promotions.map((promo) => (
                                <div key={promo.id} className="p-8 hover:bg-gray-50 transition-all flex items-center justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${promo.is_active ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}>
                                            <Target size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#1A1A1A]">{promo.name}</h4>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Min. Belanja: {rupiah(promo.min_purchase)} • Reward: {promo.type === 'cashback_points' ? `${promo.value} Poin` : rupiah(promo.value)}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-2 text-[10px] font-bold text-gray-500">
                                                <Calendar size={12} />
                                                <span>{new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => post(route('admin.marketing.toggle', promo.id))}
                                            className={`p-2 rounded-lg transition-all ${promo.is_active ? 'text-green-500 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                                            title={promo.is_active ? 'Matikan Promo' : 'Aktifkan Promo'}
                                        >
                                            <Power size={18} />
                                        </button>
                                        <button className="p-2 text-red-400 bg-red-50 hover:bg-red-100 rounded-lg transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center text-gray-400 italic">
                                    Belum ada campaign marketing. Buat campaign pertama Anda untuk meningkatkan penjualan!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
