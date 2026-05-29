import { Head, Link, usePage } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import Hero from '@/Components/Landing/Hero';
import HowItWorks from '@/Components/Landing/HowItWorks';
import TopSelling from '@/Components/Landing/TopSelling';
import Features from '@/Components/Landing/Features';
import FAQ from '@/Components/Landing/FAQ';
import { Star, Quote, ShieldCheck, Award, Clock, Users, ArrowRight, CheckCircle2, Sparkles, MessageSquare, Gift, ShoppingBag, User as UserIcon, Bell, Home as HomeIcon, MapPin, Send, Plus, Check, Download } from 'lucide-react';
import { PageProps } from '@/types';

interface HomeProps {
    meta: {
        title: string;
        description: string;
    };
}

export default function Home({ meta }: HomeProps) {
    const { site_settings = {} } = usePage<PageProps>().props;

    return (
        <LandingLayout>
            <Head>
                <title>{site_settings.site_title || meta?.title || 'EWWON COCO'}</title>
                <meta name="description" content={site_settings.hero_subtitle || meta?.description || 'Kesegaran kelapa asli dari EWWON COCO'} />
            </Head>

            <Hero />


            
            <Features />

            <HowItWorks />
            
            <TopSelling />

            {/* Mobile App Download Section */}
            <section className="relative py-12 md:py-24 bg-[#1A1A1A] text-white overflow-hidden border-b border-gray-900 rounded-3xl md:rounded-[48px] mx-4 my-8 md:mx-8">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00C48C]/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#FF8A00]/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="container-max section-px relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                    {/* Left Column: Branding and Download Info */}
                    <div className="lg:col-span-7 space-y-8" style={{ animation: 'fadeInUp 0.7s ease-out both' }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
                            <Sparkles className="w-4 h-4 text-[#00C48C]" />
                            <span className="text-xs font-bold text-[#00C48C] uppercase tracking-[0.15em]">Aplikasi Resmi</span>
                        </div>
                        <h3 className="text-3xl md:text-[3rem] font-poppins font-black text-white leading-[1.1] tracking-tight">
                            Nikmati Kemudahan Dalam <br/>
                            <span className="text-[#00C48C]">Genggaman Anda</span>
                        </h3>
                        <p className="text-gray-400 leading-[1.8] font-medium text-lg max-w-xl">
                            Unduh aplikasi mobile resmi EWWON COCO untuk pengalaman memesan es kelapa muda dan dessert premium yang lebih cepat, hemat, dan terintegrasi penuh.
                        </p>

                        {/* Feature bullets */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {[
                                { title: 'Pemesanan Instan', desc: 'Pesan cepat kurang dari 5 detik' },
                                { title: 'Poin & Loyalty Reward', desc: 'Dapatkan poin ganda setiap transaksi' },
                                { title: 'Pelacakan Real-Time', desc: 'Pantau status pesanan & posisi kurir' },
                                { title: 'Promo Khusus Aplikasi', desc: 'Diskon & voucher eksklusif pengguna baru' }
                            ].map((feat, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <div className="w-6 h-6 rounded-full bg-[#00C48C]/20 border border-[#00C48C]/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00C48C]" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-white text-sm">{feat.title}</h5>
                                        <p className="text-xs text-gray-400 font-medium">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Direct Android APK Download Button */}
                        <div className="pt-6">
                            <a 
                                href={site_settings.android_download_url || "/downloads/ewwoncoco.apk"} 
                                download={(!site_settings.android_download_url || !site_settings.android_download_url.startsWith('http')) ? "ewwoncoco.apk" : undefined}
                                target={(site_settings.android_download_url && site_settings.android_download_url.startsWith('http')) ? "_blank" : undefined}
                                rel={(site_settings.android_download_url && site_settings.android_download_url.startsWith('http')) ? "noopener noreferrer" : undefined}
                                className="group inline-flex items-center gap-4 bg-[#00C48C] hover:bg-[#00ab7a] text-white px-8 py-4.5 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-[#00C48C]/15 font-poppins"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider leading-none">UNDUH SEKARANG</p>
                                    <p className="text-base font-black text-white leading-tight mt-1">Aplikasi Android (APK)</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Premium CSS Mobile Mockup */}
                    <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-8 md:pt-0" style={{ animation: 'fadeInUp 0.9s ease-out 0.2s both' }}>
                        {/* Backdrop pulsing glow behind mock */}
                        <div className="absolute w-72 h-72 bg-[#00C48C]/20 rounded-full blur-[80px] animate-pulse pointer-events-none"></div>

                        {/* Mobile mockup wrapper */}
                        <div className="relative w-[300px] h-[600px] bg-zinc-950 rounded-[48px] p-3 border-[4px] border-zinc-800 shadow-[0_24px_70px_rgba(0,0,0,0.8)] overflow-hidden group">
                            {/* Phone notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-950 rounded-b-2xl z-40 flex items-center justify-center">
                                <div className="w-12 h-1 bg-zinc-800 rounded-full"></div>
                            </div>

                            {/* App Screen Content Container */}
                            <div className="w-full h-full rounded-[36px] overflow-hidden relative z-30 bg-white">
                                <img 
                                    src={site_settings.app_screenshot || "/images/app_screenshot.jpg"} 
                                    alt="Aplikasi EWWON COCO" 
                                    className="w-full h-full object-cover animate-fadeIn" 
                                    loading="lazy" 
                                />
                            </div>

                            {/* Phone Home indicator bar */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-800 rounded-full z-40"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges Section */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="container-max section-px">
                    <div className="text-center mb-10">
                        <p className="text-xs font-bold text-[#6B7280] uppercase tracking-[0.2em]">Keamanan & Kepercayaan</p>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
                        {[
                            { icon: ShieldCheck, text: 'Pembayaran Aman', sub: 'QRIS Certified' },
                            { icon: Award, text: 'Bahan Terjamin', sub: '100% Organik' },
                            { icon: CheckCircle2, text: 'Higienis', sub: 'BPOM Compliant' },
                            { icon: Users, text: 'Terpercaya', sub: '5000+ Customer' },
                        ].map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-[#F0FAF6] flex items-center justify-center group-hover:bg-[#00C48C] transition-colors duration-300">
                                    <badge.icon className="w-5 h-5 text-[#00C48C] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-[#1A1A1A]">{badge.text}</p>
                                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{badge.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <FAQ />
            
            {/* Premium CTA */}
            <section className="relative py-16 md:py-28 bg-white text-center overflow-hidden border-t border-gray-50">
                <div className="container-max section-px relative z-10">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#00C48C]/15 shadow-sm mb-8">
                        <Sparkles className="w-4 h-4 text-[#00C48C]" />
                        <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-[0.15em]">Promo Spesial</span>
                    </div>
                    <h2 className="text-3xl md:text-[4rem] font-poppins font-black text-[#1A1A1A] mb-6 leading-[1.1] md:leading-[1.05] tracking-tight max-w-3xl mx-auto">
                        Siap Menikmati Kesegaran{' '}
                        <span className="text-[#00C48C]">Kelapa Asli?</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto mb-12 text-base md:text-lg font-medium leading-relaxed">
                        Daftar sekarang dan nikmati diskon spesial untuk pesanan pertama Anda. 
                        Kurir kami siap mengantar kesegaran dalam waktu kurang dari 30 menit.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link 
                            href={route('register')} 
                            className="group inline-flex items-center gap-3 bg-[#1A1A1A] hover:bg-[#00C48C] text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-poppins font-bold text-base md:text-lg shadow-xl shadow-gray-200 transition-all duration-300 hover:-translate-y-1"
                        >
                            Daftar Sekarang
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    
                    {/* Bottom trust line */}
                    <div className="mt-12 flex flex-wrap justify-center items-center gap-4 md:gap-6 text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00C48C]" /> Gratis ongkir &lt; 3km</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00C48C]" /> Pembayaran aman QRIS</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00C48C]" /> 100% Segar Alami</span>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
