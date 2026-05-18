import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ShoppingBag, ArrowRight, Star, Truck, Shield, Clock } from 'lucide-react';

export default function Hero() {
    const { auth, site_settings = {} } = usePage<PageProps>().props;

    return (
        <section className="relative overflow-hidden bg-white min-h-[700px] flex items-center border-b border-gray-50">
            {/* Subtle grain texture */}
            <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>

            <div className="container-max section-px relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-12">
                <div className="max-w-2xl" style={{ animation: 'fadeInUp 0.7s ease-out both' }}>
                    {/* Trust badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#00C48C]/15 shadow-[0_2px_12px_rgba(0,196,140,0.08)] mb-8">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C48C] opacity-60"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00C48C]"></span>
                        </span>
                        <span className="text-sm font-bold text-[#1A1A1A] tracking-wide">100% Kelapa Asli & Segar</span>
                        <Shield className="w-3.5 h-3.5 text-[#00C48C]" />
                    </div>

                    <h1 className="text-[3.2rem] lg:text-[4rem] font-poppins font-black text-[#1A1A1A] mb-7 tracking-tight">
                        {site_settings.hero_title || (
                            <>
                                Kesegaran Asli{' '}
                                <span className="relative inline-block">
                                    <span className="text-[#00C48C]">Kelapa Muda</span>
                                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M2 5.5C50 2 150 2 198 5.5" stroke="#00C48C" strokeWidth="3" strokeLinecap="round" opacity="0.3" /></svg>
                                </span>{' '}
                                <br />Di Depan Pintu Anda.
                            </>
                        )}
                    </h1>

                    <p className="text-lg text-[#6B7280] mb-10 leading-[1.8] max-w-lg font-medium">
                        {site_settings.hero_subtitle || 'Pesan es kelapa muda murni dan dessert kelapa premium secara online. Langsung dari cabang terdekat, diantar cepat ke rumah Anda dalam hitungan menit.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mb-12">
                        <Link
                            href={auth.user ? route('shop') : route('register')}
                            className="group inline-flex items-center gap-3 bg-[#1A1A1A] hover:bg-[#00C48C] text-white px-8 py-4 rounded-2xl font-poppins font-bold text-base transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,196,140,0.3)] hover:-translate-y-0.5"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Pesan Sekarang
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>

                        <a
                            href="/#how-it-works"
                            className="inline-flex items-center gap-2 text-[#1A1A1A] font-poppins font-bold px-6 py-4 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#00C48C] hover:text-[#00C48C] transition-all duration-300"
                        >
                            Lihat Cara Kerja
                        </a>
                    </div>

                    {/* Social proof strip */}
                    <div className="flex items-center gap-8 flex-wrap">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white bg-gray-200 overflow-hidden shadow-sm hover:z-20 hover:scale-110 transition-transform duration-300" style={{ zIndex: 6 - i }}>
                                        <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="Customer" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex gap-0.5 mb-0.5">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-[#00C48C] text-[#00C48C]" />)}
                                </div>
                                <p className="text-xs text-[#6B7280]"><span className="font-black text-[#1A1A1A]">4.9</span> dari 1,200+ ulasan</p>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                        <div className="flex items-center gap-2 text-xs font-bold text-[#6B7280]">
                            <Truck className="w-4 h-4 text-[#00C48C]" />
                            <span>Gratis Ongkir &lt; 3km</span>
                        </div>
                    </div>
                </div>

                <div className="relative hidden lg:flex items-center justify-center min-h-[550px]" style={{ animation: 'fadeInUp 0.9s ease-out 0.2s both' }}>
                    {/* Hero Product Image */}
                    <div className="relative z-10 animate-floating">
                        <img
                            src="/coconut_original.png"
                            alt="Es Kelapa Muda Premium EWWON COCO"
                            className="w-full max-w-md object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-700"
                        />
                    </div>

                    {/* Floating badge: Delivery */}
                    <div className="absolute left-[-10px] top-[20%] bg-white/95 backdrop-blur-xl px-5 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100/80 flex items-center gap-4 z-20 animate-floating" style={{ animationDelay: '1s' }}>
                        <div className="w-11 h-11 bg-gradient-to-br from-[#FF8A00]/15 to-[#FF8A00]/5 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-[#FF8A00]" />
                        </div>
                        <div>
                            <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-[0.15em] mb-0.5">Pengiriman</p>
                            <p className="text-sm font-black text-[#1A1A1A]">&lt; 30 Menit</p>
                        </div>
                    </div>

                    {/* Floating badge: Quality */}
                    <div className="absolute right-[-10px] bottom-[25%] bg-white/95 backdrop-blur-xl px-5 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100/80 flex items-center gap-4 z-20 animate-floating" style={{ animationDelay: '2.5s' }}>
                        <div className="w-11 h-11 bg-gradient-to-br from-[#00C48C]/15 to-[#00C48C]/5 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#00C48C]" />
                        </div>
                        <div>
                            <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-[0.15em] mb-0.5">Kualitas</p>
                            <p className="text-sm font-black text-[#1A1A1A]">100% Segar</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
