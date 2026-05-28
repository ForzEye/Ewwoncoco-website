import React, { useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Store,
    FileText,
    Instagram,
    MessageCircle,
    Music2,
    Save,
    Phone,
    MapPin,
    ArrowRight,
    Sparkles,
    Layout,
    QrCode,
    CreditCard,
    Building2,
    User,
    Upload,
    Hash
} from 'lucide-react';
import { Merchant } from '@/types';

interface SettingsProps {
    merchant: Merchant;
    branch?: any;
    loyalty_settings?: any;
    auth: any;
}

export default function Settings({ merchant, branch, loyalty_settings, auth }: SettingsProps) {
    const qrisInputRef = useRef<HTMLInputElement>(null);
    const [qrisPreview, setQrisPreview] = useState<string | null>(
        merchant.qris_image_url ? merchant.qris_image_url : null
    );

    const { data, setData, post, processing, errors } = useForm<any>({
        name: merchant.name || '',
        phone: merchant.phone || '',
        address: merchant.address || '',
        lat: branch?.lat || '',
        lng: branch?.lng || '',
        receipt_header: merchant.receipt_header || '',
        receipt_footer: merchant.receipt_footer || '',
        receipt_font_size: merchant.receipt_font_size ?? 9,
        receipt_paper_width: merchant.receipt_paper_width ?? '58mm',
        receipt_extra_bold: merchant.receipt_extra_bold ?? false,
        receipt_left_margin: merchant.receipt_left_margin ?? 0,
        receipt_font_weight: (merchant as any).receipt_font_weight ?? 790,
        instagram_handle: merchant.instagram_handle || '',
        whatsapp_number: merchant.whatsapp_number || '',
        tiktok_handle: merchant.tiktok_handle || '',
        bank_name: (merchant as any).bank_name || '',
        bank_account_number: (merchant as any).bank_account_number || '',
        bank_account_name: (merchant as any).bank_account_name || '',
        qris_image: null as File | null,
        loyalty_settings: {
            point_per_rupiah: 20000,
            referral_reward_points: 20,
            minimum_redeem_points: 10,
            point_to_discount_ratio: 1000,
            ...(loyalty_settings || {})
        }
    });

    const isSuperAdmin = auth?.user?.role === 'super_admin';

    const handleQrisFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('qris_image', file);
            const reader = new FileReader();
            reader.onload = (ev) => setQrisPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use post with forceFormData to support file upload
        post(route('admin.settings.update'), {
            forceFormData: true,
        });
    };

    const handleLoyaltyChange = (key: string, value: any) => {
        setData('loyalty_settings', {
            ...data.loyalty_settings,
            [key]: value
        });
    };

    return (
        <AdminLayout title="Identitas Bisnis">
            <Head title="Pengaturan Toko - EWWON COCO" />

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left: Form Fields */}
                <form onSubmit={handleSubmit} className="flex-1 space-y-10">
                    {/* Profil Toko */}
                    <div className="bg-white p-10 rounded-[40px] border border-[#F0F0F0] shadow-sm space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-11 h-11 bg-[#F0FAF6] text-[#2D6A4F] rounded-2xl flex items-center justify-center">
                                <Store size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A]">Profil Merchant</h3>
                                <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-widest mt-0.5">Informasi dasar outlet Anda</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Nama Brand / Toko</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        disabled={!isSuperAdmin}
                                        className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                    <Store className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D0D0D0]" size={18} />
                                </div>
                                {errors.name && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.name}</p>}
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Telepon Operasional</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
                                    />
                                    <Phone className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D0D0D0]" size={18} />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2.5">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Alamat Pusat</label>
                                <div className="relative">
                                    <textarea
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        disabled={!isSuperAdmin}
                                        className="w-full px-7 py-5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-3xl text-[14px] font-bold outline-none transition-all min-h-[120px] resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                    <MapPin className="absolute right-6 top-6 text-[#D0D0D0]" size={18} />
                                </div>
                            </div>

                            {/* GPS Coordinates & Picker */}
                            <div className="md:col-span-2 space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Koordinat GPS Lokasi</label>
                                    {isSuperAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (navigator.geolocation) {
                                                    navigator.geolocation.getCurrentPosition((position) => {
                                                        setData((prev: any) => ({
                                                            ...prev,
                                                            lat: position.coords.latitude.toFixed(8),
                                                            lng: position.coords.longitude.toFixed(8)
                                                        }));
                                                    }, (error) => {
                                                        alert('Gagal mendeteksi lokasi otomatis. Silakan masukkan koordinat secara manual.');
                                                    });
                                                } else {
                                                    alert('Geolocation tidak didukung oleh browser Anda.');
                                                }
                                            }}
                                            className="px-4 py-2 bg-[#F0FAF6] hover:bg-[#2D6A4F] text-[#2D6A4F] hover:text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Dapatkan GPS Otomatis
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-gray-400 ml-1">Latitude (Garis Lintang)</span>
                                        <input
                                            type="text"
                                            value={data.lat}
                                            onChange={e => setData('lat', e.target.value)}
                                            disabled={!isSuperAdmin}
                                            placeholder="Contoh: -6.20880000"
                                            className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-gray-400 ml-1">Longitude (Garis Bujur)</span>
                                        <input
                                            type="text"
                                            value={data.lng}
                                            onChange={e => setData('lng', e.target.value)}
                                            disabled={!isSuperAdmin}
                                            placeholder="Contoh: 106.84560000"
                                            className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                {isSuperAdmin ? (
                                    <p className="text-[9.5px] text-amber-600 font-bold ml-1 flex items-center gap-1.5 bg-amber-50 p-3 rounded-xl">
                                        <span>⚠️</span>
                                        <span>Penting: Masukkan koordinat GPS dengan akurat agar peta dan layanan pengantaran driver di aplikasi mobile pelanggan berfungsi dengan benar.</span>
                                    </p>
                                ) : (
                                    <p className="text-[9.5px] text-gray-500 font-medium ml-1 flex items-center gap-1.5 bg-gray-50 p-3 rounded-xl">
                                        <span>ℹ️</span>
                                        <span>Nama toko, alamat pusat, dan koordinat GPS hanya dapat diubah oleh Super Admin. Hubungi Super Admin jika ingin melakukan perubahan.</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pengaturan Struk — Very important for the user */}
                    <div className="bg-white p-10 rounded-[40px] border border-[#F0F0F0] shadow-sm space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-11 h-11 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                                <FileText size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A]">Konfigurasi Struk</h3>
                                <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-widest mt-0.5">Tampilan cetak kasir (58mm)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Header Struk (Nama Brand/Sapaan)</label>
                                <textarea
                                    value={data.receipt_header}
                                    onChange={e => setData('receipt_header', e.target.value)}
                                    placeholder="Contoh: EWWON COCO MALANG"
                                    className="w-full px-7 py-5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-3xl text-[13px] font-black outline-none transition-all min-h-[100px] resize-none"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Footer Struk (Terima Kasih/Promo)</label>
                                <textarea
                                    value={data.receipt_footer}
                                    onChange={e => setData('receipt_footer', e.target.value)}
                                    placeholder="Contoh: Follow IG kami @ewwon.coco untuk promo menarik!"
                                    className="w-full px-7 py-5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-3xl text-[13px] font-black outline-none transition-all min-h-[100px] resize-none"
                                />
                            </div>

                            {/* Baris Baru: Pengaturan Fisik Cetak */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#F0F0F0]">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Lebar Kertas Thermal</label>
                                    <div className="flex gap-4">
                                        {['58mm', '80mm'].map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => setData('receipt_paper_width', size)}
                                                className={`flex-1 py-4 px-6 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all border ${
                                                    data.receipt_paper_width === size
                                                        ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white shadow-lg shadow-[#2D6A4F]/10'
                                                        : 'bg-[#F9F9F9] border-transparent text-[#808080] hover:bg-[#F0F0F0]'
                                                }`}
                                            >
                                                {size} {size === '58mm' ? '(Standar)' : '(Lebar)'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                                        <span>Ukuran Huruf Struk</span>
                                        <span className="text-[#2D6A4F] font-bold text-[11px]">{data.receipt_font_size}px ({data.receipt_font_size === 9 ? 'Default' : data.receipt_font_size < 9 ? 'Lebih Kecil' : 'Lebih Besar'})</span>
                                    </label>
                                    <div className="flex items-center gap-4 bg-[#F9F9F9] px-6 py-4 rounded-2xl">
                                        <span className="text-[10px] font-bold text-[#B0B0B0]">A</span>
                                        <input
                                            type="range"
                                            min="7"
                                            max="12"
                                            step="1"
                                            value={data.receipt_font_size}
                                            onChange={e => setData('receipt_font_size', parseInt(e.target.value))}
                                            className="flex-1 accent-[#2D6A4F] cursor-pointer"
                                        />
                                        <span className="text-[14px] font-black text-[#2D6A4F]">A</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                                        <span>Posisi Horizontal Struk</span>
                                        <span className={`font-bold text-[11px] ${data.receipt_left_margin === 0 ? 'text-[#808080]' : data.receipt_left_margin < 0 ? 'text-amber-600' : 'text-[#2D6A4F]'}`}>
                                            {data.receipt_left_margin === 0 ? 'Pas di Tengah (0mm)' : data.receipt_left_margin < 0 ? `Geser Kiri (${data.receipt_left_margin}mm)` : `Geser Kanan (+${data.receipt_left_margin}mm)`}
                                        </span>
                                    </label>
                                    <div className="flex items-center gap-4 bg-[#F9F9F9] px-6 py-4 rounded-2xl">
                                        <span className="text-[9px] font-bold text-[#B0B0B0]">◄ KIRI</span>
                                        <input
                                            type="range"
                                            min="-15"
                                            max="15"
                                            step="1"
                                            value={data.receipt_left_margin}
                                            onChange={e => setData('receipt_left_margin', parseInt(e.target.value))}
                                            className="flex-1 accent-[#2D6A4F] cursor-pointer"
                                        />
                                        <span className="text-[9px] font-bold text-[#B0B0B0]">KANAN ►</span>
                                    </div>
                                    <p className="text-[9px] text-[#A0A0A0] leading-relaxed ml-1">
                                        * Geser ke arah <strong>KIRI</strong> (nilai minus) jika cetakan struk fisik Anda terlalu menjorok ke Kanan.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                                        <span>Ketebalan Huruf (Font Weight)</span>
                                        <span className="text-[#2D6A4F] font-bold text-[11px]">
                                            {data.receipt_font_weight} ({data.receipt_font_weight <= 400 ? 'Normal' : data.receipt_font_weight <= 700 ? 'Tebal (Bold)' : data.receipt_font_weight === 790 ? 'Tebal Sedang (790)' : 'Ekstra Tebal'})
                                        </span>
                                    </label>
                                    <div className="flex items-center gap-4 bg-[#F9F9F9] px-6 py-4 rounded-2xl">
                                        <span className="text-[10px] font-bold text-[#B0B0B0]">100</span>
                                        <input
                                            type="range"
                                            min="100"
                                            max="950"
                                            step="10"
                                            value={data.receipt_font_weight}
                                            onChange={e => setData('receipt_font_weight', parseInt(e.target.value))}
                                            className="flex-1 accent-[#2D6A4F] cursor-pointer"
                                        />
                                        <span className="text-[14px] font-black text-[#2D6A4F]">950</span>
                                    </div>
                                    <p className="text-[9px] text-[#808080] font-bold leading-relaxed ml-1">
                                        * Geser slider ini untuk mengatur ketebalan teks struk secara terpisah. Nilai default optimal untuk cetak thermal adalah 790.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white p-10 rounded-[40px] border border-[#F0F0F0] shadow-sm space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-11 h-11 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                                <Instagram size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A]">Media Sosial & Kontak</h3>
                                <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-widest mt-0.5">Integrasi komunikasi pelanggan</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Instagram (@handle)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.instagram_handle}
                                        onChange={e => setData('instagram_handle', e.target.value)}
                                        placeholder="@ewwon.coco"
                                        className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
                                    />
                                    <Instagram className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D0D0D0]" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">WhatsApp Business</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.whatsapp_number}
                                        onChange={e => setData('whatsapp_number', e.target.value)}
                                        placeholder="08123456789"
                                        className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
                                    />
                                    <MessageCircle className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D0D0D0]" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">TikTok Handle</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.tiktok_handle}
                                        onChange={e => setData('tiktok_handle', e.target.value)}
                                        placeholder="@ewwon.official"
                                        className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
                                    />
                                    <Music2 className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D0D0D0]" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pembayaran Online — QRIS & Transfer Bank */}
                    <div className="bg-white p-10 rounded-[40px] border border-[#F0F0F0] shadow-sm space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                <CreditCard size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A]">Pembayaran Online</h3>
                                <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-widest mt-0.5">QRIS statis &amp; rekening transfer bank</p>
                            </div>
                        </div>

                        {/* QRIS Static Image */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Gambar QRIS Statis</label>
                            <div className="flex items-start gap-6">
                                {/* Preview */}
                                <div
                                    className="w-36 h-36 rounded-3xl border-2 border-dashed border-[#E0E0E0] flex items-center justify-center bg-[#F9F9F9] shrink-0 overflow-hidden cursor-pointer hover:border-[#2D6A4F]/40 transition-colors"
                                    onClick={() => qrisInputRef.current?.click()}
                                >
                                    {qrisPreview ? (
                                        <img src={qrisPreview} alt="QRIS Preview" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-[#C0C0C0]">
                                            <QrCode size={36} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Upload QRIS</span>
                                        </div>
                                    )}
                                </div>
                                {/* Upload Button */}
                                <div className="flex-1 space-y-3">
                                    <p className="text-[12px] text-gray-500 leading-relaxed">
                                        Upload gambar QRIS statis dari bank/e-wallet Anda. Gambar ini akan ditampilkan kepada pelanggan saat memilih metode pembayaran QRIS di aplikasi.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => qrisInputRef.current?.click()}
                                        className="flex items-center gap-2 px-5 py-3 bg-[#F0FAF6] text-[#2D6A4F] font-black rounded-2xl text-[12px] uppercase tracking-widest hover:bg-[#2D6A4F] hover:text-white transition-all"
                                    >
                                        <Upload size={15} />
                                        {qrisPreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                                    </button>
                                    <p className="text-[9px] text-gray-400 ml-1">Format PNG/JPG, maks 2MB. Pastikan QR code terlihat jelas.</p>
                                    <input
                                        ref={qrisInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        className="hidden"
                                        onChange={handleQrisFileChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bank Transfer */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Nama Bank</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.bank_name}
                                        onChange={e => setData('bank_name', e.target.value)}
                                        placeholder="Contoh: BCA, Mandiri, BRI"
                                        className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
                                    />
                                    <Building2 className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D0D0D0]" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Nomor Rekening</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.bank_account_number}
                                        onChange={e => setData('bank_account_number', e.target.value)}
                                        placeholder="Contoh: 1234567890"
                                        className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
                                    />
                                    <Hash className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D0D0D0]" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Nama Pemilik Rekening</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.bank_account_name}
                                        onChange={e => setData('bank_account_name', e.target.value)}
                                        placeholder="Contoh: EWWON COCO"
                                        className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
                                    />
                                    <User className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D0D0D0]" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Info box */}
                        <div className="bg-blue-50 rounded-2xl p-5 flex gap-3">
                            <CreditCard size={18} className="text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-blue-600 font-bold leading-relaxed">
                                Info pembayaran ini akan tampil otomatis di aplikasi saat pelanggan memilih metode <strong>Transfer Bank</strong> atau <strong>QRIS</strong> saat checkout.
                            </p>
                        </div>
                    </div>

                    {/* Loyalty Configuration - SuperAdmin Only */}
                    {isSuperAdmin && (
                        <div className="bg-white p-10 rounded-[40px] border border-[#F0F0F0] shadow-sm space-y-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-11 h-11 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                                    <Sparkles size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-poppins font-black text-[18px] text-[#1A1A1A]">Loyalty System</h3>
                                    <p className="text-[11px] font-bold text-[#B5AFA6] uppercase tracking-widest mt-0.5">Konfigurasi poin & reward</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Threshold Poin (Rp / 1 Poin)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.loyalty_settings.point_per_rupiah}
                                            onChange={e => handleLoyaltyChange('point_per_rupiah', e.target.value)}
                                            className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400 ml-1">Pelanggan dapat 1 poin setiap belanja kelipatan ini.</p>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Point to Discount Ratio (Rp)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.loyalty_settings.point_to_discount_ratio}
                                            onChange={e => handleLoyaltyChange('point_to_discount_ratio', e.target.value)}
                                            className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400 ml-1">Nilai Rupiah untuk setiap 1 poin yang ditukar.</p>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Reward Referral (Poin)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.loyalty_settings.referral_reward_points}
                                            onChange={e => handleLoyaltyChange('referral_reward_points', e.target.value)}
                                            className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400 ml-1">Poin yang didapat pengundang saat referral belanja pertama.</p>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-[#B5AFA6] uppercase tracking-[0.2em] ml-1">Minimal Tukar Poin</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.loyalty_settings.minimum_redeem_points}
                                            onChange={e => handleLoyaltyChange('minimum_redeem_points', e.target.value)}
                                            className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400 ml-1">Minimal saldo poin untuk bisa digunakan.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-10 py-5 bg-[#1A1A1A] hover:bg-[#2D6A4F] text-white font-black rounded-3xl flex items-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-gray-200 group"
                        >
                            <Save size={20} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                            <span className="uppercase tracking-[0.2em] text-[13px]">{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>

                {/* Right: Info / Preview Sidebar */}
                <div className="lg:w-[350px] space-y-8">
                    <div className="bg-gradient-to-br from-[#2D6A4F] to-[#40916C] p-10 rounded-[40px] text-white shadow-xl shadow-[#2D6A4F]/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <Sparkles className="w-12 h-12 mb-6 opacity-80" />
                            <h4 className="font-poppins font-black text-[22px] leading-tight mb-4">Branding<br />Digital</h4>
                            <p className="text-[11px] font-bold text-white/70 leading-relaxed mb-8 uppercase tracking-widest">Atur identitas brand Anda untuk muncul di struk dan halaman belanja pelanggan.</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-[11px] font-black">
                                    <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center">✓</div>
                                    Teks Struk Dinamis
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-black">
                                    <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center">✓</div>
                                    Ikon Sosmed Otomatis
                                </div>
                            </div>
                        </div>
                        <Layout className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10 -rotate-12" />
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-poppins font-black text-[15px] text-[#1A1A1A]">Pratinjau Cetak</h4>
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest">Live Calibrator</span>
                        </div>
                        
                        <div className="bg-[#F5F3EF] rounded-3xl p-6 border border-[#E8E4DD] flex items-center justify-center min-h-[300px] overflow-hidden">
                            {/* Receipt Container */}
                            <div 
                                style={{
                                    fontSize: `${data.receipt_font_size}px`,
                                    fontWeight: data.receipt_font_weight,
                                    transform: `translateX(${data.receipt_left_margin * 1.5}px)`,
                                    width: data.receipt_paper_width === '58mm' ? '170px' : '230px',
                                    textShadow: data.receipt_font_weight > 700 ? '0.15px 0px 0px #1A1A1A, 0px 0.15px 0px #1A1A1A' : 'none',
                                    transition: 'transform 0.15s ease-out, width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                className="bg-white p-5 shadow-md text-[#1A1A1A] font-mono leading-tight flex flex-col border border-transparent shrink-0"
                            >
                                <div className="text-center mb-4">
                                    <p className="font-black uppercase tracking-tighter mb-1 leading-none animate-pulse-slow" style={{ fontSize: `${data.receipt_font_size + 2}px` }}>
                                        {data.receipt_header || 'HEADER STRUK'}
                                    </p>
                                    <p className="font-bold" style={{ fontSize: `${data.receipt_font_size}px` }}>Cabang Malang</p>
                                    <p className="opacity-80" style={{ fontSize: `${data.receipt_font_size - 1.5}px` }}>Jl. Raya No. 123</p>
                                </div>

                                <div className="border-t border-b border-dashed border-gray-400 py-2.5 mb-3 space-y-1 w-full" style={{ fontSize: `${data.receipt_font_size - 1.5}px` }}>
                                    <div className="flex justify-between"><span className="opacity-60">WAKTU:</span><span>25-05-2026 17:30</span></div>
                                    <div className="flex justify-between"><span className="opacity-60">KASIR:</span><span>ADMIN</span></div>
                                </div>

                                <div className="space-y-3 mb-4 w-full">
                                    <div className="space-y-0.5">
                                        <p className="font-bold uppercase" style={{ fontSize: `${data.receipt_font_size - 0.5}px` }}>Es Kelapa Original</p>
                                        <div className="flex justify-between items-end opacity-90" style={{ fontSize: `${data.receipt_font_size}px` }}>
                                            <span>1 x 15.000</span>
                                            <span className="font-bold">15.000</span>
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-bold uppercase" style={{ fontSize: `${data.receipt_font_size - 0.5}px` }}>Coco Dessert Bowl</p>
                                        <div className="flex justify-between items-end opacity-90" style={{ fontSize: `${data.receipt_font_size}px` }}>
                                            <span>2 x 15.000</span>
                                            <span className="font-bold">30.000</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-gray-400 pt-2.5 space-y-1 w-full">
                                    <div className="flex justify-between font-bold" style={{ fontSize: `${data.receipt_font_size + 1}px` }}>
                                        <span>TOTAL</span>
                                        <span>45.000</span>
                                    </div>
                                    <div className="flex justify-between opacity-80" style={{ fontSize: `${data.receipt_font_size - 0.5}px` }}>
                                        <span>TUNAI</span>
                                        <span>50.000</span>
                                    </div>
                                    <div className="flex justify-between font-bold border-t border-dotted border-gray-300 pt-1.5 mt-1" style={{ fontSize: `${data.receipt_font_size}px` }}>
                                        <span>KEMBALI</span>
                                        <span>5.000</span>
                                    </div>
                                </div>

                                <div className="text-center mt-6 pt-3 border-t border-dashed border-gray-400">
                                    <p className="font-bold" style={{ fontSize: `${data.receipt_font_size}px` }}>TERIMA KASIH</p>
                                    <p className="leading-relaxed mt-1" style={{ fontSize: `${data.receipt_font_size - 1.5}px` }}>
                                        {data.receipt_footer || 'Teks footer struk akan muncul di sini...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
