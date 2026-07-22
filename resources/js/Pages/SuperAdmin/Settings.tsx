import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';

import { 
    Globe, 
    Image as ImageIcon, 
    Type, 
    Save, 
    Check,
    Upload,
    Smartphone,
    Instagram,
    Mail,
    ChevronRight,
    Search,
    Settings as SettingsIcon,
    Download
} from 'lucide-react';

interface SettingsProps {
    settings: Record<string, any>;
    appSettings: Record<string, any>;
    appImages: Record<string, any>;
    appLastConnected: string | null;
}

export default function Settings({ settings, appSettings, appImages, appLastConnected }: SettingsProps) {
    const [activeTab, setActiveTab] = useState<'website' | 'mobile'>('website');

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        // Website Settings
        site_name: settings.site_name || 'EWWON COCO',
        site_title: settings.site_title || 'Fresh Coconut Drink',
        hero_title: settings.hero_title || 'Kesegaran Asli Kelapa Muda Di Depan Pintu Anda.',
        hero_subtitle: settings.hero_subtitle || 'Pesan es kelapa muda murni dan dessert kelapa premium secara online. Langsung dari cabang terdekat.',
        footer_text: settings.footer_text || 'Nikmati kesegaran es kelapa muda asli dan dessert premium kami.',
        contact_whatsapp: settings.contact_whatsapp || '',
        contact_email: settings.contact_email || '',
        instagram_url: settings.instagram_url || '',
        site_logo: null as File | null,
        site_favicon: null as File | null,
        otp_enabled: settings.otp_enabled !== undefined ? String(settings.otp_enabled) : '1',
        otp_email_enabled: settings.otp_email_enabled !== undefined ? String(settings.otp_email_enabled) : '1',
        wa_notifications_enabled: settings.wa_notifications_enabled !== undefined ? String(settings.wa_notifications_enabled) : '1',
        android_download_url: settings.android_download_url || '',
        opening_hours_weekday: settings.opening_hours_weekday || '09:00 - 21:00',
        opening_hours_weekday_label: settings.opening_hours_weekday_label || 'Senin - Jumat',
        opening_hours_weekend: settings.opening_hours_weekend || '10:00 - 22:00',
        opening_hours_weekend_label: settings.opening_hours_weekend_label || 'Sabtu - Minggu',

        // Daily BI Report Settings
        daily_report_enabled: settings.daily_report_enabled !== undefined ? String(settings.daily_report_enabled) : '1',
        daily_report_recipients: settings.daily_report_recipients || '',
        daily_report_time: settings.daily_report_time || '07:00',


        // Mobile App Settings
        app_landing_promo_text: appSettings.app_landing_promo_text || '',
        app_support_whatsapp: appSettings.app_support_whatsapp || settings.contact_whatsapp || '',
        app_landing_hero_image: null as File | null,
        app_screenshot: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(settings.site_logo || null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(settings.site_favicon || null);
    const [appScreenshotPreview, setAppScreenshotPreview] = useState<string | null>(settings.app_screenshot || null);
    
    // Support multiple app hero previews
    const initialAppHeroes = Array.isArray(appImages.app_landing_hero_image) 
        ? appImages.app_landing_hero_image 
        : (appImages.app_landing_hero_image ? [appImages.app_landing_hero_image] : []);
    
    const [appHeroPreviews, setAppHeroPreviews] = useState<string[]>(initialAppHeroes);
    const [sendingTestEmail, setSendingTestEmail] = useState(false);

    const handleTestSendDailyReport = () => {
        setSendingTestEmail(true);
        router.post(route('superadmin.settings.test_daily_report'), {
            test_email: data.daily_report_recipients,
        }, {
            onFinish: () => setSendingTestEmail(false),
        });
    };


    const isAppHealthy = () => {
        if (!appLastConnected) return false;
        const lastConnected = new Date(appLastConnected);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastConnected.getTime()) / (1000 * 60);
        return diffMinutes < 10; // Healthy if connected in last 10 minutes
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
        const file = e.target.files?.[0];
        if (file) {
            setData(field as any, file);
            const previewUrl = URL.createObjectURL(file);
            if (field === 'site_logo') setLogoPreview(previewUrl);
            else if (field === 'site_favicon') setFaviconPreview(previewUrl);
            else if (field === 'app_screenshot') setAppScreenshotPreview(previewUrl);
        }
    };

    const handleMultipleAppHeroes = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            // Append to existing files in form data
            const existingFiles = data.app_landing_hero_image as any || [];
            const updatedFiles = Array.isArray(existingFiles) ? [...existingFiles, ...newFiles] : [existingFiles, ...newFiles];
            
            setData('app_landing_hero_image' as any, updatedFiles as any);
            
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setAppHeroPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeAppHero = (index: number) => {
        const updatedPreviews = [...appHeroPreviews];
        updatedPreviews.splice(index, 1);
        setAppHeroPreviews(updatedPreviews);
        
        // Also update form data
        const existingFiles = data.app_landing_hero_image as any || [];
        if (Array.isArray(existingFiles)) {
            const updatedFiles = [...existingFiles];
            updatedFiles.splice(index, 1);
            setData('app_landing_hero_image' as any, updatedFiles as any);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('superadmin.settings.update'), {
            forceFormData: true,
        });
    };

    return (
        <SuperAdminLayout>
            <Head title="System Settings" />
            
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-poppins font-bold text-charcoal flex items-center gap-3">
                            <SettingsIcon className="text-[#00C48C]" />
                            Konfigurasi Platform
                        </h2>
                        <p className="text-gray-500 mt-1">Kelola branding dan konten website & aplikasi secara dinamis.</p>
                    </div>
                    {recentlySuccessful && (
                        <div className="bg-[#F0FAF6] text-[#00C48C] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                            <Check size={20} strokeWidth={3} />
                            Berhasil Disimpan
                        </div>
                    )}
                </div>

                {/* Tabs Selector */}
                <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
                    <button 
                        onClick={() => setActiveTab('website')}
                        className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'website' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Globe size={18} />
                        Website
                    </button>
                    <button 
                        onClick={() => setActiveTab('mobile')}
                        className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'mobile' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Smartphone size={18} />
                        Aplikasi Mobile
                    </button>
                </div>

                {activeTab === 'website' ? (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
                        {/* Left Column: Branding */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
                                <h3 className="font-poppins font-bold text-lg flex items-center gap-2 text-charcoal">
                                    <ImageIcon size={20} className="text-blue-500" />
                                    Branding Visual
                                </h3>

                                {/* Logo Upload */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Logo Utama</label>
                                    <div className="relative group aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-[#00C48C] hover:bg-[#F0FAF6]/30 transition-all cursor-pointer">
                                        {logoPreview ? (
                                            <img src={logoPreview} className="w-full h-full object-contain p-4" />
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400">
                                                <Upload size={32} strokeWidth={1.5} />
                                                <span className="text-[10px] font-bold mt-2 uppercase">Upload Logo</span>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => handleFileChange(e, 'site_logo')}
                                        />
                                    </div>
                                </div>

                                {/* Favicon Upload */}
                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Favicon (Icon Tab)</label>
                                    <div className="flex items-center gap-6">
                                        <div className="relative group w-16 h-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden hover:border-[#00C48C] transition-all cursor-pointer">
                                            {faviconPreview ? (
                                                <img src={faviconPreview} className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <Upload size={20} className="text-gray-400" />
                                            )}
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleFileChange(e, 'site_favicon')}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-charcoal">Browser Icon</p>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase">Format PNG/ICO <br/>(1:1 Ratio)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Settings */}
                            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                                <h3 className="font-poppins font-bold text-lg flex items-center gap-2 text-charcoal">
                                    <Smartphone size={20} className="text-amber-500" />
                                    Kontak & Sosial
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 ml-1">
                                            <Smartphone size={14} className="text-gray-400" />
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp</label>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={data.contact_whatsapp}
                                            onChange={e => setData('contact_whatsapp', e.target.value)}
                                            className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                            placeholder="62812xxx"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 ml-1">
                                            <Instagram size={14} className="text-gray-400" />
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instagram URL</label>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={data.instagram_url}
                                            onChange={e => setData('instagram_url', e.target.value)}
                                            className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                            placeholder="https://instagram.com/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 ml-1">
                                            <Mail size={14} className="text-gray-400" />
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Publik</label>
                                        </div>
                                        <input 
                                            type="email" 
                                            value={data.contact_email}
                                            onChange={e => setData('contact_email', e.target.value)}
                                            className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                            placeholder="hello@ewwoncoco.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Feature Toggles (OTP & WA) */}
                            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                                <h3 className="font-poppins font-bold text-lg flex items-center gap-2 text-charcoal">
                                    <SettingsIcon size={20} className="text-[#00C48C]" />
                                    Kontrol Fitur & OTP
                                </h3>
                                <div className="space-y-3">

                                    {/* OTP via WhatsApp */}
                                    <div className={`flex items-center justify-between p-3 rounded-xl transition-opacity ${
                                        data.otp_email_enabled !== '1' ? 'bg-gray-50 opacity-40 pointer-events-none' : 'bg-gray-50'
                                    }`}>
                                        <div className="flex-1 pr-2">
                                            <p className="text-xs font-bold text-charcoal">OTP via WhatsApp</p>
                                            <p className="text-[9px] text-gray-400">
                                                {data.otp_email_enabled !== '1'
                                                    ? 'Aktifkan OTP Email terlebih dahulu.'
                                                    : 'Nonaktifkan jika Fonnte/WA sedang bermasalah.'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setData('otp_enabled', data.otp_enabled === '1' ? '0' : '1')}
                                            className={`px-4 py-2 rounded-lg font-black text-[10px] tracking-wider uppercase transition-all ${
                                                data.otp_enabled === '1'
                                                    ? 'bg-[#F0FAF6] text-[#00C48C] border border-[#00C48C]'
                                                    : 'bg-red-50 text-red-500 border border-red-200'
                                            }`}
                                        >
                                            {data.otp_enabled === '1' ? 'AKTIF' : 'NONAKTIF'}
                                        </button>
                                    </div>

                                    {/* OTP via Email — master switch */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex-1 pr-2">
                                            <p className="text-xs font-bold text-charcoal flex items-center gap-1">
                                                <Mail size={11} className="inline" />
                                                OTP via Email
                                                <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded text-[8px] font-black uppercase">Master</span>
                                            </p>
                                            <p className="text-[9px] text-gray-400">
                                                {data.otp_email_enabled !== '1'
                                                    ? '⚠️ Semua OTP dinonaktifkan — registrasi tanpa verifikasi.'
                                                    : 'Jika dinonaktifkan, semua OTP (WA & Email) akan dimatikan.'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = data.otp_email_enabled === '1' ? '0' : '1';
                                                setData('otp_email_enabled', next);
                                                // Turning email off also forces WA off (both disabled)
                                                if (next === '0') setData('otp_enabled', '0');
                                            }}
                                            className={`px-4 py-2 rounded-lg font-black text-[10px] tracking-wider uppercase transition-all ${
                                                data.otp_email_enabled === '1'
                                                    ? 'bg-[#F0FAF6] text-[#00C48C] border border-[#00C48C]'
                                                    : 'bg-red-50 text-red-500 border border-red-200'
                                            }`}
                                        >
                                            {data.otp_email_enabled === '1' ? 'AKTIF' : 'NONAKTIF'}
                                        </button>
                                    </div>

                                    {/* WA Notifications (receipts) */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex-1 pr-2">
                                            <p className="text-xs font-bold text-charcoal">Notifikasi WA (Struk)</p>
                                            <p className="text-[9px] text-gray-400">Nonaktifkan untuk lewati pengiriman struk via Fonnte.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setData('wa_notifications_enabled', data.wa_notifications_enabled === '1' ? '0' : '1')}
                                            className={`px-4 py-2 rounded-lg font-black text-[10px] tracking-wider uppercase transition-all ${data.wa_notifications_enabled === '1' ? 'bg-[#F0FAF6] text-[#00C48C] border border-[#00C48C]' : 'bg-red-50 text-red-500 border border-red-200'}`}
                                        >
                                            {data.wa_notifications_enabled === '1' ? 'AKTIF' : 'NONAKTIF'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Daily BI Report Email Settings */}
                            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-poppins font-bold text-lg flex items-center gap-2 text-charcoal">
                                        <Mail size={20} className="text-[#00C48C]" />
                                        Laporan BI Harian (Email PDF)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setData('daily_report_enabled', data.daily_report_enabled === '1' ? '0' : '1')}
                                        className={`px-4 py-2 rounded-lg font-black text-[10px] tracking-wider uppercase transition-all ${
                                            data.daily_report_enabled === '1'
                                                ? 'bg-[#F0FAF6] text-[#00C48C] border border-[#00C48C]'
                                                : 'bg-red-50 text-red-500 border border-red-200'
                                        }`}
                                    >
                                        {data.daily_report_enabled === '1' ? 'AKTIF' : 'NONAKTIF'}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Penerima (Bos / Management)</label>
                                        <input 
                                            type="text" 
                                            value={data.daily_report_recipients}
                                            onChange={e => setData('daily_report_recipients', e.target.value)}
                                            className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                            placeholder="bos@ewwoncoco.com, owner@ewwoncoco.com"
                                        />
                                        <p className="text-[9px] text-gray-400 ml-1">Pisahkan dengan koma jika ada lebih dari 1 penerima.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jadwal Pengiriman Harian</label>
                                        <select
                                            value={data.daily_report_time}
                                            onChange={e => setData('daily_report_time', e.target.value)}
                                            className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        >
                                            <option value="21:00">21:00 Malam (Tutup Toko - Rekap Hari Ini)</option>
                                            <option value="22:00">22:00 Malam (Tutup Toko - Rekap Hari Ini)</option>
                                            <option value="23:00">23:00 Malam (Rekap Hari Ini)</option>
                                            <option value="23:59">23:59 Malam (Akhir Hari Ini)</option>
                                            <option value="07:00">07:00 Pagi (Rekomendasi Pagi - Rekap Kemarin)</option>
                                            <option value="08:00">08:00 Pagi (Rekap Kemarin)</option>
                                        </select>

                                    </div>

                                    <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                                        <a
                                            href={route('superadmin.settings.preview_daily_report')}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-charcoal font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Download size={14} />
                                            Preview PDF Laporan (Browser)
                                        </a>
                                        <button
                                            type="button"
                                            onClick={handleTestSendDailyReport}
                                            disabled={sendingTestEmail}
                                            className="w-full py-2.5 px-4 bg-[#F0FAF6] hover:bg-[#00C48C] hover:text-white text-[#00C48C] font-bold text-xs rounded-xl border border-[#00C48C]/30 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <Mail size={14} />
                                            {sendingTestEmail ? 'Mengirim...' : 'Kirim Test Email ke Bos Sekarang'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Right Column: Content CMS */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                                <h3 className="font-poppins font-bold text-xl flex items-center gap-3 text-charcoal">
                                    <Type size={24} className="text-[#00C48C]" />
                                    Konten Homepage (Dynamic CMS)
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Situs</label>
                                        <input 
                                            type="text" 
                                            value={data.site_name}
                                            onChange={e => setData('site_name', e.target.value)}
                                            className="w-full px-7 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#00C48C]/10 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Title Tag (SEO)</label>
                                        <input 
                                            type="text" 
                                            value={data.site_title}
                                            onChange={e => setData('site_title', e.target.value)}
                                            className="w-full px-7 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#00C48C]/10 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Hero Title (H1)</label>
                                    <textarea 
                                        value={data.hero_title}
                                        onChange={e => setData('hero_title', e.target.value)}
                                        className="w-full px-7 py-5 bg-gray-50 border-none rounded-2xl text-lg font-black text-charcoal leading-relaxed focus:ring-4 focus:ring-[#00C48C]/10 outline-none h-32 resize-none"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Hero Subtitle</label>
                                    <textarea 
                                        value={data.hero_subtitle}
                                        onChange={e => setData('hero_subtitle', e.target.value)}
                                        className="w-full px-7 py-5 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-500 leading-[1.8] focus:ring-4 focus:ring-[#00C48C]/10 outline-none h-24 resize-none"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Footer Text</label>
                                    <textarea 
                                        value={data.footer_text}
                                        onChange={e => setData('footer_text', e.target.value)}
                                        className="w-full px-7 py-5 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-500 leading-relaxed focus:ring-4 focus:ring-[#00C48C]/10 outline-none h-24 resize-none"
                                    />
                                </div>

                                <div className="border-t border-gray-100 pt-8 mt-8 space-y-6">
                                    <h4 className="text-sm font-poppins font-black text-charcoal uppercase tracking-wider">
                                        Jam Operasional
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Weekday Label */}
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Label Hari Kerja</label>
                                            <input 
                                                type="text" 
                                                value={data.opening_hours_weekday_label}
                                                onChange={e => setData('opening_hours_weekday_label', e.target.value)}
                                                className="w-full px-7 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#00C48C]/10 outline-none"
                                                placeholder="Senin - Jumat"
                                            />
                                        </div>
                                        {/* Weekday Hours */}
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Jam Operasional Hari Kerja</label>
                                            <input 
                                                type="text" 
                                                value={data.opening_hours_weekday}
                                                onChange={e => setData('opening_hours_weekday', e.target.value)}
                                                className="w-full px-7 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#00C48C]/10 outline-none"
                                                placeholder="09:00 - 21:00"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Weekend Label */}
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Label Akhir Pekan</label>
                                            <input 
                                                type="text" 
                                                value={data.opening_hours_weekend_label}
                                                onChange={e => setData('opening_hours_weekend_label', e.target.value)}
                                                className="w-full px-7 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#00C48C]/10 outline-none"
                                                placeholder="Sabtu - Minggu"
                                            />
                                        </div>
                                        {/* Weekend Hours */}
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Jam Operasional Akhir Pekan</label>
                                            <input 
                                                type="text" 
                                                value={data.opening_hours_weekend}
                                                onChange={e => setData('opening_hours_weekend', e.target.value)}
                                                className="w-full px-7 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#00C48C]/10 outline-none"
                                                placeholder="10:00 - 22:00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="px-10 py-5 bg-[#1A1A1A] hover:bg-[#00C48C] text-white font-black rounded-2xl shadow-xl shadow-gray-200 transition-all flex items-center gap-3 disabled:opacity-50 group"
                                    >
                                        <Save size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="uppercase tracking-widest text-xs">Simpan Perubahan</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
                        {/* Mobile App Specific Settings */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* App Status Indicator */}
                            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                                <h3 className="font-poppins font-bold text-lg flex items-center gap-2 text-charcoal">
                                    <Smartphone size={20} className="text-[#00C48C]" />
                                    Status Koneksi
                                </h3>
                                
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${isAppHealthy() ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-charcoal">
                                            {isAppHealthy() ? 'Aplikasi Terhubung' : 'Tidak Ada Koneksi'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                            Terakhir: {appLastConnected ? new Date(appLastConnected).toLocaleString('id-ID') : 'Belum pernah'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 leading-relaxed italic">Aplikasi mobile mengirimkan sinyal kesehatan secara berkala saat digunakan oleh pelanggan.</p>
                            </div>

                            {/* App Landing Hero */}
                            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                                <h3 className="font-poppins font-bold text-lg flex items-center gap-2 text-charcoal">
                                    <ImageIcon size={20} className="text-purple-500" />
                                    Visual Landing Apps
                                </h3>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Banner Utama (Multiple)</label>
                                    
                                    {/* Multiple Images Gallery */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {appHeroPreviews.map((url, idx) => (
                                            <div key={idx} className="relative group aspect-video bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                                <img src={url} className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={() => removeAppHero(idx)}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        
                                        {/* Upload Button Grid Item */}
                                        <div className="relative group aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-[#00C48C] hover:bg-[#F0FAF6]/30 transition-all cursor-pointer">
                                            <div className="flex flex-col items-center text-gray-400">
                                                <Upload size={24} />
                                                <span className="text-[8px] font-bold mt-1 uppercase">Tambah Banner</span>
                                            </div>
                                            <input 
                                                type="file" 
                                                multiple
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleMultipleAppHeroes}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-center">Rekomendasi: 1200x675px (16:9). Bisa pilih lebih dari 1.</p>
                                </div>
                            </div>

                            {/* App Screenshot Upload */}
                            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                                <h3 className="font-poppins font-bold text-lg flex items-center gap-2 text-charcoal">
                                    <Smartphone size={20} className="text-blue-500" />
                                    Screenshot Aplikasi
                                </h3>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gambar Tampilan Aplikasi</label>
                                    
                                    <div className="relative group aspect-[9/16] max-w-[200px] mx-auto bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-[#00C48C] hover:bg-[#F0FAF6]/30 transition-all cursor-pointer">
                                        {appScreenshotPreview ? (
                                            <img src={appScreenshotPreview} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400 p-4 text-center">
                                                <Upload size={32} strokeWidth={1.5} />
                                                <span className="text-[9px] font-bold mt-2 uppercase">Upload Screenshot</span>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => handleFileChange(e, 'app_screenshot')}
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400 text-center leading-relaxed">Rekomendasi ukuran: Aspek rasio 9:16 (seperti screenshot HP portrait).</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                                <h3 className="font-poppins font-bold text-xl flex items-center gap-3 text-charcoal">
                                    <Type size={24} className="text-amber-500" />
                                    Konten Aplikasi (Dynamic)
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Teks Promo Landing Page</label>
                                        <textarea 
                                            value={data.app_landing_promo_text}
                                            onChange={e => setData('app_landing_promo_text', e.target.value)}
                                            placeholder="Contoh: Dapatkan diskon 20% untuk pembelian pertama..."
                                            className="w-full px-7 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold text-charcoal leading-relaxed focus:ring-4 focus:ring-[#00C48C]/10 outline-none h-32 resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">WhatsApp Customer Service (Aplikasi)</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <input 
                                                    type="text" 
                                                    value={data.app_support_whatsapp}
                                                    onChange={e => setData('app_support_whatsapp', e.target.value)}
                                                    placeholder="Contoh: 6281234567890"
                                                    className="w-full px-7 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#00C48C]/10 outline-none"
                                                />
                                            </div>
                                            <div className="w-12 h-12 bg-[#25D366]/10 rounded-2xl flex items-center justify-center text-[#25D366]">
                                                <Smartphone size={24} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 ml-1">Nomor ini akan digunakan pada tombol bantuan di aplikasi mobile.</p>
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Link Download Aplikasi Android (APK)</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <input 
                                                    type="text" 
                                                    value={data.android_download_url}
                                                    onChange={e => setData('android_download_url', e.target.value)}
                                                    placeholder="Contoh: https://drive.google.com/uc?export=download&id=... atau https://domain.com/downloads/ewwoncoco.apk"
                                                    className="w-full px-7 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#00C48C]/10 outline-none"
                                                />
                                            </div>
                                            <div className="w-12 h-12 bg-[#00C48C]/10 rounded-2xl flex items-center justify-center text-[#00C48C]">
                                                <Download size={24} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 ml-1">Gunakan link penyimpanan file APK (seperti Google Drive, Dropbox, atau hosting) agar ketika tombol unduh di landing page diklik, user langsung diarahkan mengunduh berkas APK.</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="px-10 py-5 bg-[#1A1A1A] hover:bg-[#00C48C] text-white font-black rounded-2xl shadow-xl shadow-gray-200 transition-all flex items-center gap-3 disabled:opacity-50 group"
                                    >
                                        <Save size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="uppercase tracking-widest text-xs">Simpan Pengaturan Apps</span>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Preview Simulation */}
                            <div className="bg-[#1A1A1A] p-10 rounded-[40px] text-white relative overflow-hidden">
                                <div className="flex flex-col md:flex-row items-center gap-10">
                                    <div className="w-[200px] aspect-[9/19] bg-white rounded-[36px] border-[8px] border-[#333] relative overflow-hidden flex flex-col shadow-2xl scale-110">
                                        {/* Status Bar */}
                                        <div className="h-6 bg-white flex justify-between items-center px-4 pt-1">
                                            <div className="w-8 h-2 bg-gray-100 rounded-full" />
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 rounded-full bg-gray-100" />
                                                <div className="w-4 h-2 rounded-full bg-gray-100" />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                                            {/* 1. Banner Preview */}
                                            <div className="h-36 bg-gray-100 relative overflow-hidden">
                                                {appHeroPreviews.length > 0 ? (
                                                    <div className="flex h-full w-full">
                                                        {appHeroPreviews.map((url, idx) => (
                                                            <img key={idx} src={url} className="w-full h-full object-cover flex-shrink-0" style={{ display: idx === 0 ? 'block' : 'none' }} />
                                                        ))}
                                                        {appHeroPreviews.length > 1 && (
                                                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                                                {appHeroPreviews.map((_, idx) => (
                                                                    <div key={idx} className={`w-1 h-1 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/40'}`} />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <img src="https://images.unsplash.com/photo-1543157145-f78c636d023d?w=400" className="w-full h-full object-cover opacity-50" />
                                                )}
                                                {/* Notification icon simulation */}
                                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white/50" />
                                                </div>
                                            </div>

                                            {/* 2. Overlapping Member Card Simulation */}
                                            <div className="px-3 -mt-6 relative z-10">
                                                <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-50 p-3 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
                                                            <div className="w-3 h-3 rounded-full bg-[#00C48C]" />
                                                            <div className="w-10 h-2 bg-gray-200 rounded-full" />
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 opacity-50" />
                                                        </div>
                                                    </div>
                                                    <div className="h-px bg-gray-100 w-full" />
                                                    <div className="flex justify-between items-center px-1">
                                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full" />
                                                        <div className="w-2 h-2 border-r border-b border-gray-300 -rotate-45" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3. Greeting */}
                                            <div className="px-4 mt-4 space-y-1">
                                                <p className="text-[9px] font-black text-gray-800">Hi Budi, Silakan lakukan pesanan?</p>
                                            </div>

                                            {/* 4. Order Methods (Bento Style) */}
                                            <div className="grid grid-cols-2 gap-2 px-3 mt-3">
                                                <div className="aspect-[4/5] bg-white border border-[#E8F5E9] rounded-2xl p-2.5 flex flex-col">
                                                    <p className="text-[7px] font-black text-[#008B5E]">Pick Up</p>
                                                    <div className="w-full h-1 bg-gray-100 rounded-full mt-1" />
                                                    <div className="w-2/3 h-1 bg-gray-100 rounded-full mt-0.5" />
                                                    <div className="flex-1" />
                                                    <div className="self-end w-8 h-8 bg-[#F1F8F6] rounded-xl flex items-center justify-center">
                                                        <div className="w-4 h-4 bg-[#008B5E]/10 rounded-lg" />
                                                    </div>
                                                </div>
                                                <div className="aspect-[4/5] bg-white border border-[#FFF7F2] rounded-2xl p-2.5 flex flex-col">
                                                    <p className="text-[7px] font-black text-[#D35400]">Delivery</p>
                                                    <div className="w-full h-1 bg-gray-100 rounded-full mt-1" />
                                                    <div className="w-2/3 h-1 bg-gray-100 rounded-full mt-0.5" />
                                                    <div className="flex-1" />
                                                    <div className="self-end w-8 h-8 bg-[#FFF7F2] rounded-xl flex items-center justify-center">
                                                        <div className="w-4 h-4 bg-[#D35400]/10 rounded-lg" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 5. Feature Section Preview */}
                                            <div className="px-4 mt-5">
                                                <div className="w-24 h-2 bg-gray-100 rounded-full" />
                                                <div className="grid grid-cols-2 gap-2 mt-3">
                                                    <div className="h-20 bg-white border border-gray-100 rounded-xl p-2 space-y-2">
                                                        <div className="w-6 h-6 bg-gray-50 rounded-lg" />
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full" />
                                                        <div className="w-2/3 h-1 bg-gray-50 rounded-full" />
                                                    </div>
                                                    <div className="h-20 bg-white border border-gray-100 rounded-xl p-2 space-y-2">
                                                        <div className="w-6 h-6 bg-gray-50 rounded-lg" />
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full" />
                                                        <div className="w-2/3 h-1 bg-gray-50 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <h4 className="text-xl font-poppins font-bold">Pratinjau Aplikasi</h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">Lihat bagaimana perubahan Anda muncul di aplikasi mobile pelanggan. Gambar banner dan teks promo akan otomatis diperbarui tanpa perlu mengupdate aplikasi di Play Store.</p>
                                        <div className="flex gap-4 pt-4">
                                            <div className="px-4 py-2 bg-white/5 rounded-xl text-center">
                                                <p className="text-[8px] font-bold text-gray-500 uppercase">Platform</p>
                                                <p className="text-[10px] font-black">Android & iOS</p>
                                            </div>
                                            <div className="px-4 py-2 bg-white/5 rounded-xl text-center">
                                                <p className="text-[8px] font-bold text-gray-500 uppercase">Sync Type</p>
                                                <p className="text-[10px] font-black text-[#00C48C]">Real-time</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </SuperAdminLayout>
    );
}
