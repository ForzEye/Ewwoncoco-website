import { Head, Link, usePage } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import Hero from '@/Components/Landing/Hero';
import HowItWorks from '@/Components/Landing/HowItWorks';
import TopSelling from '@/Components/Landing/TopSelling';
import Features from '@/Components/Landing/Features';
import FAQ from '@/Components/Landing/FAQ';
import { Star, Quote, ShieldCheck, Award, Clock, Users, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
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

            {/* Mobile-Style Order Methods (Bento Section) */}
            <section className="relative -mt-12 mb-12 z-20 container-max section-px">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pick Up Card */}
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col group hover:border-[#00C48C]/30 transition-all duration-500">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="text-2xl font-poppins font-black text-[#008B5E] mb-2">Pick Up</h3>
                                <p className="text-gray-500 font-medium">Ambil di store tanpa antri</p>
                            </div>
                            <div className="w-14 h-14 bg-[#F1F8F6] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <ArrowRight className="w-6 h-6 text-[#008B5E]" />
                            </div>
                        </div>
                        <div className="flex-1 flex items-end justify-end opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle2 className="w-24 h-24 text-[#008B5E]" />
                        </div>
                    </div>

                    {/* Delivery Card */}
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col group hover:border-[#D35400]/30 transition-all duration-500">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="text-2xl font-poppins font-black text-[#D35400] mb-2">Delivery</h3>
                                <p className="text-gray-500 font-medium">Garansi tepat waktu, dijamin!</p>
                            </div>
                            <div className="w-14 h-14 bg-[#FFF7F2] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <ArrowRight className="w-6 h-6 text-[#D35400]" />
                            </div>
                        </div>
                        <div className="flex-1 flex items-end justify-end opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock className="w-24 h-24 text-[#D35400]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Numbers Bar */}
            <section className="relative py-12 bg-white border-b border-gray-50">
                <div className="container-max section-px">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { number: '10,000+', label: 'Pesanan Terkirim', icon: CheckCircle2, color: 'text-[#00C48C]' },
                            { number: '4.9/5.0', label: 'Rating Pelanggan', icon: Star, color: 'text-[#00C48C]' },
                            { number: '< 30 Min', label: 'Rata-rata Pengiriman', icon: Clock, color: 'text-[#00C48C]' },
                            { number: '5,000+', label: 'Pelanggan Setia', icon: Users, color: 'text-[#00C48C]' },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center group" style={{animation: `fadeInUp 0.5s ease-out ${idx * 80}ms both`}}>
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <h4 className="text-2xl md:text-3xl font-poppins font-black text-[#1A1A1A] mb-1">{stat.number}</h4>
                                <p className="text-xs font-bold text-[#6B7280] uppercase tracking-[0.1em]">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <Features />

            <HowItWorks />
            
            <TopSelling />

            {/* Social Proof / Testimonials */}
            <section className="relative py-24 bg-white overflow-hidden border-b border-gray-50">
                <div className="container-max section-px relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#00C48C]/15 shadow-sm mb-6">
                            <Quote className="w-4 h-4 text-[#00C48C]" />
                            <span className="text-xs font-bold text-[#00C48C] uppercase tracking-[0.15em]">Testimoni</span>
                        </div>
                        <h3 className="text-3xl md:text-[2.8rem] font-poppins font-black text-[#1A1A1A] leading-[1.15] tracking-tight">
                            Ribuan Pelanggan Telah <br/>
                            <span className="text-[#00C48C]">Merasakan Kesegarannya</span>
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: "Budi Santoso", role: "Pekerja Kantoran", text: "Penyelamat di siang hari yang panas! Kelapanya benar-benar segar dan manis alaminya pas. Kurirnya juga super cepat, tidak pernah mengecewakan.", img: 30 },
                            { name: "Siti Aminah", role: "Ibu Rumah Tangga", text: "Anak-anak suka sekali dengan puding kelapanya. Lembut dan sangat terasa kelapa aslinya. Pasti akan pesan lagi untuk acara keluarga.", img: 31 },
                            { name: "Reza Pahlevi", role: "Mahasiswa", text: "Harganya sangat worth it dengan kualitas yang diberikan. Sering banget pesan pakai promo jadi makin hemat. Highly recommended!", img: 32 }
                        ].map((testimonial, idx) => (
                            <div 
                                key={idx} 
                                className="relative bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group"
                                style={{animation: `fadeInUp 0.5s ease-out ${idx * 120}ms both`}}
                            >
                                {/* Quote mark */}
                                <div className="absolute top-6 right-6 text-[4rem] font-serif text-gray-50 leading-none select-none group-hover:text-[#00C48C]/10 transition-colors">"</div>
                                
                                <div className="flex gap-1 mb-5">
                                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-[#00C48C] text-[#00C48C]" />)}
                                </div>
                                <p className="text-[#6B7280] leading-[1.8] font-medium mb-8 relative z-10">"{testimonial.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-sm">
                                        <img src={`https://i.pravatar.cc/150?img=${testimonial.img}`} alt={testimonial.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h5 className="font-poppins font-black text-[#1A1A1A] text-sm">{testimonial.name}</h5>
                                        <p className="text-xs text-[#6B7280] font-medium">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
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
            <section className="relative py-28 bg-white text-center overflow-hidden border-t border-gray-50">
                <div className="container-max section-px relative z-10">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#00C48C]/15 shadow-sm mb-8">
                        <Sparkles className="w-4 h-4 text-[#00C48C]" />
                        <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-[0.15em]">Promo Spesial</span>
                    </div>
                    <h2 className="text-4xl md:text-[4rem] font-poppins font-black text-[#1A1A1A] mb-6 leading-[1.05] tracking-tight max-w-3xl mx-auto">
                        Siap Menikmati Kesegaran{' '}
                        <span className="text-[#00C48C]">Kelapa Asli?</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto mb-12 text-lg font-medium leading-relaxed">
                        Daftar sekarang dan nikmati diskon spesial untuk pesanan pertama Anda. 
                        Kurir kami siap mengantar kesegaran dalam waktu kurang dari 30 menit.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link 
                            href={route('register')} 
                            className="group inline-flex items-center gap-3 bg-[#1A1A1A] hover:bg-[#00C48C] text-white px-10 py-5 rounded-2xl font-poppins font-bold text-lg shadow-xl shadow-gray-200 transition-all duration-300 hover:-translate-y-1"
                        >
                            Daftar Sekarang
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    
                    {/* Bottom trust line */}
                    <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00C48C]" /> Gratis ongkir &lt; 3km</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00C48C]" /> Pembayaran aman QRIS</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00C48C]" /> 100% Segar Alami</span>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
