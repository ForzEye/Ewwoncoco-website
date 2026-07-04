import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Megaphone, Trash2, Calendar, Target, Power, TrendingUp, Edit2 } from 'lucide-react';
import { rupiah } from '../../../lib/format';
import Swal from 'sweetalert2';

interface MarketingProps {
    promotions: any[];
    products: any[];
    customizations?: any[];
}

export default function Marketing({ promotions, products = [], customizations = [] }: MarketingProps) {
    const [editingPromo, setEditingPromo] = React.useState<any>(null);
    
    const { data, setData, post, delete: destroyPromo, processing, reset } = useForm({
        name: '',
        description: '',
        type: 'cashback_points',
        value: '',
        min_purchase: '',
        max_reward: '',
        start_date: '',
        end_date: '',
        buy_product_id: '',
        get_product_id: '',
        buy_quantity: '1',
        get_quantity: '1',
        applicable_on: 'all',
        is_new_member_only: false,
        max_free_qty: '',
        upgrade_from_option_id: '',
        upgrade_to_option_id: '',
    });

    const handleStartEdit = (promo: any) => {
        setEditingPromo(promo);
        setData({
            name: promo.name || '',
            description: promo.description || '',
            type: promo.type || 'cashback_points',
            value: promo.value ? String(promo.value) : '',
            min_purchase: promo.min_purchase ? String(promo.min_purchase) : '',
            max_reward: promo.max_reward ? String(promo.max_reward) : '',
            start_date: promo.start_date || '',
            end_date: promo.end_date || '',
            buy_product_id: promo.buy_product_id ? String(promo.buy_product_id) : '',
            get_product_id: promo.get_product_id ? String(promo.get_product_id) : '',
            buy_quantity: promo.buy_quantity ? String(promo.buy_quantity) : '1',
            get_quantity: promo.get_quantity ? String(promo.get_quantity) : '1',
            applicable_on: promo.applicable_on || 'all',
            is_new_member_only: !!promo.is_new_member_only,
            max_free_qty: promo.max_free_qty ? String(promo.max_free_qty) : '',
            upgrade_from_option_id: promo.upgrade_from_option_id ? String(promo.upgrade_from_option_id) : '',
            upgrade_to_option_id: promo.upgrade_to_option_id ? String(promo.upgrade_to_option_id) : '',
        });
    };

    const handleCancelEdit = () => {
        setEditingPromo(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPromo) {
            post(route('admin.marketing.update', editingPromo.id), {
                onSuccess: () => {
                    setEditingPromo(null);
                    reset();
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Campaign promo berhasil diperbarui.',
                        icon: 'success',
                        confirmButtonColor: '#00C48C'
                    });
                }
            });
        } else {
            post(route('admin.marketing.store'), {
                onSuccess: () => {
                    reset();
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Campaign promo baru berhasil dibuat.',
                        icon: 'success',
                        confirmButtonColor: '#00C48C'
                    });
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Hapus Campaign?',
            text: 'Apakah Anda yakin ingin menghapus campaign promo ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#00C48C',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroyPromo(route('admin.marketing.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Dihapus!',
                            text: 'Campaign promo berhasil dihapus.',
                            icon: 'success',
                            confirmButtonColor: '#00C48C'
                        });
                    }
                });
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
                            <h3 className="font-poppins font-bold text-xl text-charcoal">{editingPromo ? 'Edit Campaign' : 'Buat Promo Baru'}</h3>
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
                                    required
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
                                        <option value="bogo">Buy 1 Get 1 (BOGO)</option>
                                        <option value="upgrade">Upgrade Kustomisasi</option>
                                    </select>
                                </div>
                                {data.type !== 'bogo' && data.type !== 'upgrade' && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Nilai (Rp/Poin)</label>
                                        <input 
                                            type="number" 
                                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                            placeholder="5000"
                                            value={data.value}
                                            onChange={e => setData('value', e.target.value)}
                                            required={data.type !== 'bogo' && data.type !== 'upgrade'}
                                        />
                                    </div>
                                )}
                            </div>

                             {data.type !== 'bogo' && data.type !== 'upgrade' ? (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Minimal Belanja</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        placeholder="50000"
                                        value={data.min_purchase}
                                        onChange={e => setData('min_purchase', e.target.value)}
                                        required={data.type !== 'bogo' && data.type !== 'upgrade'}
                                    />
                                </div>
                            ) : data.type === 'bogo' ? (
                                <div className="space-y-4 border-l-2 border-[#00C48C] pl-4 mt-2">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Produk yang Dibeli</label>
                                            <select 
                                                className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                                value={data.buy_product_id}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setData(prev => ({
                                                        ...prev,
                                                        buy_product_id: val,
                                                        get_product_id: val === 'all' ? 'all' : (prev.get_product_id === 'all' ? '' : prev.get_product_id)
                                                    }));
                                                }}
                                                required={data.type === 'bogo'}
                                            >
                                                <option value="">Pilih Produk...</option>
                                                <option value="all">⭐ Semua Menu (Beli Menu Apa Saja)</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Produk Gratis</label>
                                            <select 
                                                className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                                value={data.get_product_id}
                                                onChange={e => setData('get_product_id', e.target.value)}
                                                required={data.type === 'bogo'}
                                            >
                                                <option value="">Pilih Produk Gratis...</option>
                                                {data.buy_product_id === 'all' && (
                                                    <option value="all">Sama dengan Produk yang Dibeli (Beli A Gratis A)</option>
                                                )}
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Jumlah Beli</label>
                                            <input 
                                                type="number" 
                                                className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                                placeholder="1"
                                                value={data.buy_quantity}
                                                onChange={e => setData('buy_quantity', e.target.value)}
                                                required={data.type === 'bogo'}
                                                min="1"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Jumlah Gratis</label>
                                            <input 
                                                type="number" 
                                                className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                                placeholder="1"
                                                value={data.get_quantity}
                                                onChange={e => setData('get_quantity', e.target.value)}
                                                required={data.type === 'bogo'}
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 border-l-2 border-[#00C48C] pl-4 mt-2">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Kustomisasi Asal (Upgrade Dari)</label>
                                        <select 
                                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                            value={data.upgrade_from_option_id}
                                            onChange={e => setData('upgrade_from_option_id', e.target.value)}
                                            required={data.type === 'upgrade'}
                                        >
                                            <option value="">Pilih Opsi Kustomisasi...</option>
                                            {customizations?.map(c => (
                                                <optgroup key={c.id} label={c.name}>
                                                    {c.options?.map((o: any) => (
                                                        <option key={o.id} value={o.id}>{c.name}: {o.name} (+{rupiah(o.price)})</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Kustomisasi Tujuan (Upgrade Ke)</label>
                                        <select 
                                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                            value={data.upgrade_to_option_id}
                                            onChange={e => setData('upgrade_to_option_id', e.target.value)}
                                            required={data.type === 'upgrade'}
                                        >
                                            <option value="">Pilih Opsi Kustomisasi Tujuan...</option>
                                            {customizations?.map(c => (
                                                <optgroup key={c.id} label={c.name}>
                                                    {c.options?.map((o: any) => (
                                                        <option key={o.id} value={o.id}>{c.name}: {o.name} (+{rupiah(o.price)})</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {(data.type === 'bogo' || data.type === 'fixed_discount') && (
                                <div className="flex items-center space-x-2 py-1">
                                    <input 
                                        type="checkbox"
                                        id="is_new_member_only"
                                        checked={data.is_new_member_only}
                                        onChange={e => setData('is_new_member_only', e.target.checked)}
                                        className="rounded border-gray-300 text-[#00C48C] focus:ring-[#00C48C]"
                                    />
                                    <label htmlFor="is_new_member_only" className="text-xs font-bold text-gray-600 cursor-pointer">
                                        Hanya untuk Member Baru (1x pakai)
                                    </label>
                                </div>
                            )}

                            {data.type === 'bogo' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Maksimal Gratis (Kuantitas)</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        placeholder="Kosongkan jika kelipatan tak terbatas"
                                        value={data.max_free_qty}
                                        onChange={e => setData('max_free_qty', e.target.value)}
                                        min="1"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Promo Berlaku Di (Saluran)</label>
                                <select 
                                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                    value={data.applicable_on}
                                    onChange={e => setData('applicable_on', e.target.value)}
                                >
                                    <option value="all">Bisa Keduanya (Online & Offline)</option>
                                    <option value="online">Hanya Pembelian Online</option>
                                    <option value="offline">Hanya Pembelian Offline</option>
                                    <option value="gofood">Hanya GoFood</option>
                                    <option value="grabfood">Hanya GrabFood</option>
                                    <option value="shopeefood">Hanya ShopeeFood</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Mulai</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Selesai</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                {editingPromo && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all"
                                    >
                                        Batal
                                    </button>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-1 py-3 bg-[#00C48C] text-white font-bold rounded-xl text-sm hover:bg-[#00ab7a] transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                                >
                                    {editingPromo ? 'Simpan Edit' : 'Simpan Campaign'}
                                </button>
                            </div>
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
                                                {promo.type === 'bogo' ? (
                                                    <span>
                                                        {(!promo.buy_product && !promo.buyProduct) ? (
                                                            <span>Beli {promo.buy_quantity} Menu Apa Saja → Gratis {promo.get_quantity} Menu yang Sama (Semua Menu)</span>
                                                        ) : (
                                                            <span>Beli {promo.buy_quantity} {promo.buy_product?.name || promo.buyProduct?.name || 'Produk'} → Gratis {promo.get_quantity} {promo.get_product?.name || promo.getProduct?.name || 'Produk'}</span>
                                                        )}
                                                        {promo.max_free_qty && <span className="text-emerald-600 font-bold ml-1.5">(Maks {promo.max_free_qty} gratis)</span>}
                                                    </span>
                                                ) : promo.type === 'upgrade' ? (
                                                    <span>
                                                        Upgrade Kustomisasi: {promo.upgrade_from_option?.name || 'Kustomisasi A'} → {promo.upgrade_to_option?.name || 'Kustomisasi B'} (Gratis biaya upgrade)
                                                    </span>
                                                ) : (
                                                    <span>
                                                        Min. Belanja: {rupiah(promo.min_purchase)} • Reward: {promo.type === 'cashback_points' ? `${promo.value} Poin` : rupiah(promo.value)}
                                                    </span>
                                                )}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
                                                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-500">
                                                    <Calendar size={12} />
                                                    <span>{new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center space-x-1.5 text-[10px] font-black text-emerald-600 bg-[#E8F5E9] px-2 py-0.5 rounded-lg border border-emerald-100">
                                                    <TrendingUp size={12} />
                                                    <span>Digunakan: {promo.used_count || 0} kali</span>
                                                </div>
                                                <div className="flex items-center space-x-1.5 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                                                    <span>Biaya Promo: {rupiah(promo.marketing_cost || 0)}</span>
                                                </div>
                                                <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-lg border ${
                                                    promo.applicable_on === 'online' 
                                                    ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                                    : promo.applicable_on === 'offline' 
                                                    ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                                    : promo.applicable_on === 'gofood'
                                                    ? 'bg-red-50 text-red-600 border-red-100'
                                                    : promo.applicable_on === 'grabfood'
                                                    ? 'bg-green-50 text-green-600 border-green-100'
                                                    : promo.applicable_on === 'shopeefood'
                                                    ? 'bg-orange-50 text-orange-600 border-orange-100'
                                                    : 'bg-[#F0FAF6] text-[#00C48C] border-[#00C48C]/15'
                                                }`}>
                                                    {promo.applicable_on === 'online' 
                                                        ? 'Online Only' 
                                                        : promo.applicable_on === 'offline' 
                                                        ? 'Offline Only' 
                                                        : promo.applicable_on === 'gofood'
                                                        ? 'GoFood Only'
                                                        : promo.applicable_on === 'grabfood'
                                                        ? 'GrabFood Only'
                                                        : promo.applicable_on === 'shopeefood'
                                                        ? 'ShopeeFood Only'
                                                        : 'Online & Offline'}
                                                </span>
                                                {promo.is_new_member_only && (
                                                    <span className="px-2.5 py-0.5 text-[9px] font-black uppercase rounded-lg border bg-purple-50 text-purple-600 border-purple-100">
                                                        New Member Only
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => handleStartEdit(promo)}
                                            className="p-2 text-[#00C48C] bg-[#F0FAF6] hover:bg-[#E0F5EE] rounded-lg transition-all"
                                            title="Edit Promo"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => post(route('admin.marketing.toggle', promo.id))}
                                            className={`p-2 rounded-lg transition-all ${promo.is_active ? 'text-green-500 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                                            title={promo.is_active ? 'Matikan Promo' : 'Aktifkan Promo'}
                                        >
                                            <Power size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(promo.id)}
                                            className="p-2 text-red-400 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                                            title="Hapus Promo"
                                        >
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
