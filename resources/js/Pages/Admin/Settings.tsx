import React from 'react';
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
    Layout
} from 'lucide-react';
import { Merchant } from '@/types';

interface SettingsProps {
    merchant: Merchant;
    loyalty_settings?: any;
    auth: any;
}

export default function Settings({ merchant, loyalty_settings, auth }: SettingsProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: merchant.name || '',
        phone: merchant.phone || '',
        address: merchant.address || '',
        receipt_header: merchant.receipt_header || '',
        receipt_footer: merchant.receipt_footer || '',
        instagram_handle: merchant.instagram_handle || '',
        whatsapp_number: merchant.whatsapp_number || '',
        tiktok_handle: merchant.tiktok_handle || '',
        loyalty_settings: {
            point_per_rupiah: 25000,
            referral_reward_points: 20,
            minimum_redeem_points: 10,
            point_to_discount_ratio: 1,
            ...(loyalty_settings || {})
        }
    });

    const isSuperAdmin = auth?.user?.role === 'super_admin';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'));
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
                                        className="w-full px-7 py-4.5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-2xl text-[14px] font-black outline-none transition-all"
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
                                        className="w-full px-7 py-5 bg-[#F9F9F9] border-transparent focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/5 focus:border-[#2D6A4F]/20 rounded-3xl text-[14px] font-bold outline-none transition-all min-h-[120px] resize-none"
                                    />
                                    <MapPin className="absolute right-6 top-6 text-[#D0D0D0]" size={18} />
                                </div>
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
                            <h4 className="font-poppins font-black text-[22px] leading-tight mb-4">Branding<br/>Digital</h4>
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

                    <div className="bg-white p-8 rounded-[40px] border border-[#F0F0F0] shadow-sm">
                        <h4 className="font-poppins font-black text-[15px] text-[#1A1A1A] mb-6">Pratinjau Struk</h4>
                        <div className="bg-gray-50 rounded-3xl p-6 border border-[#F0F0F0] font-mono text-[9px] text-[#8A8A8A] space-y-2 leading-tight">
                            <p className="text-center font-black text-[#1A1A1A] text-[11px] mb-2 uppercase">{data.receipt_header || 'HEADER STRUK'}</p>
                            <div className="border-t border-dashed border-gray-300 py-2">
                                <div className="flex justify-between"><span>Menu Item x1</span><span>Rp 15.000</span></div>
                                <div className="flex justify-between"><span>Menu Item x2</span><span>Rp 30.000</span></div>
                            </div>
                            <div className="border-t border-dashed border-gray-300 py-2 flex justify-between font-black text-[#1A1A1A]">
                                <span>TOTAL</span><span>Rp 45.000</span>
                            </div>
                            <p className="text-center mt-4 px-2">{data.receipt_footer || 'Teks footer akan muncul di sini...'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
