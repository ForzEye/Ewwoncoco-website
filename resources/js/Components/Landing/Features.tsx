import React from 'react';
import { Leaf, Sparkles, MessageCircle, Gift, ShieldCheck } from 'lucide-react';

const features = [
    {
        title: "Kualitas Premium",
        description: "Kami hanya menggunakan kelapa pilihan yang diambil langsung dari petani lokal untuk menjamin kesegaran 100%.",
        icon: Leaf,
        gradient: "from-[#00C48C]/15 to-[#00C48C]/5",
        iconColor: "text-[#00C48C]",
        accentBorder: "hover:border-[#00C48C]/25",
        number: "01"
    },
    {
        title: "Pengiriman Kilat",
        description: "Integrasi langsung dengan mitra pengiriman memastikan pesanan Anda sampai dalam waktu kurang dari 30 menit.",
        icon: Sparkles,
        gradient: "from-[#FF8A00]/15 to-[#FF8A00]/5",
        iconColor: "text-[#FF8A00]",
        accentBorder: "hover:border-[#FF8A00]/25",
        number: "02"
    },
    {
        title: "Chat Langsung",
        description: "Butuh koordinasi khusus? Gunakan fitur chat internal kami untuk berkomunikasi langsung dengan merchant.",
        icon: MessageCircle,
        gradient: "from-blue-500/15 to-blue-500/5",
        iconColor: "text-blue-500",
        accentBorder: "hover:border-blue-300",
        number: "03"
    },
    {
        title: "Reward Menarik",
        description: "Dapatkan cashback dan kumpulkan poin loyalitas dari setiap pesanan yang bisa ditukar dengan produk gratis.",
        icon: Gift,
        gradient: "from-amber-500/15 to-amber-500/5",
        iconColor: "text-amber-500",
        accentBorder: "hover:border-amber-300",
        number: "04"
    }
];

export default function Features() {
    return (
        <section id="features" className="relative py-24 bg-white overflow-hidden">
            {/* Subtle background accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#F0FAF6] to-transparent rounded-full blur-[80px] opacity-60"></div>

            <div className="container-max section-px relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0FAF6] border border-[#00C48C]/10 mb-6">
                        <Sparkles className="w-4 h-4 text-[#00C48C]" />
                        <span className="text-xs font-bold text-[#00C48C] uppercase tracking-[0.15em]">Keunggulan Layanan</span>
                    </div>
                    <h3 className="text-3xl md:text-[2.8rem] font-poppins font-black text-[#1A1A1A] leading-[1.15] tracking-tight">
                        Kesegaran Terbaik dengan{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C48C] to-[#00A070]">Layanan Modern</span>
                    </h3>
                    <p className="text-[#6B7280] mt-5 text-base max-w-xl mx-auto leading-relaxed">
                        Kami menghadirkan pengalaman memesan kelapa yang mudah, cepat, dan menyenangkan dengan teknologi terkini.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <div 
                            key={idx} 
                            className={`group relative p-8 rounded-3xl bg-white border border-gray-100 ${feature.accentBorder} hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-2`}
                            style={{animation: `fadeInUp 0.5s ease-out ${idx * 100}ms both`}}
                        >
                            {/* Subtle number */}
                            <span className="absolute top-6 right-6 text-[3rem] font-black text-gray-50 leading-none select-none group-hover:text-gray-100 transition-colors duration-500">
                                {feature.number}
                            </span>

                            <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-7 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10`}>
                                <feature.icon size={26} strokeWidth={2} className={feature.iconColor} />
                            </div>
                            <h4 className="text-lg font-poppins font-black text-[#1A1A1A] mb-3 relative z-10">{feature.title}</h4>
                            <p className="text-[#6B7280] text-sm leading-[1.7] font-medium relative z-10">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
