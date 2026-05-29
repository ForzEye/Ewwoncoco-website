import { MapPin, UtensilsCrossed, CreditCard, Truck, ArrowRight } from 'lucide-react';

const steps = [
    {
        icon: MapPin,
        title: 'Pilih Lokasi',
        description: 'Masukkan alamat pengiriman Anda untuk menemukan cabang EWWON COCO terdekat.',
        color: 'from-[#00C48C]',
    },
    {
        icon: UtensilsCrossed,
        title: 'Pilih Menu',
        description: 'Pilih minuman kelapa atau dessert favorit Anda dari menu segar kami.',
        color: 'from-[#FF8A00]',
    },
    {
        icon: CreditCard,
        title: 'Pembayaran',
        description: 'Bayar dengan mudah menggunakan QRIS atau opsi Cash on Delivery (COD).',
        color: 'from-blue-500',
    },
    {
        icon: Truck,
        title: 'Pesanan Diantar',
        description: 'Kurir GoSend atau GrabExpress akan mengantar pesanan langsung ke tempat Anda.',
        color: 'from-purple-500',
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="relative py-24 bg-white overflow-hidden border-b border-gray-50">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"></div>
            
            <div className="container-max section-px relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                        <span className="text-xs font-bold text-[#00C48C] uppercase tracking-[0.15em]">Cara Kerja</span>
                    </div>
                    <h3 className="text-3xl md:text-[2.8rem] font-poppins font-black text-[#1A1A1A] mb-5 tracking-tight leading-[1.15]">
                        Pesan Mudah,{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C48C] to-[#00A070]">Sampai Cepat</span>
                    </h3>
                    <p className="text-[#6B7280] text-base leading-relaxed">
                        Hanya butuh beberapa langkah mudah untuk menikmati kesegaran kelapa asli dari EWWON COCO tanpa harus keluar rumah.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connecting line (desktop only) */}
                    <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                    {steps.map((step, index) => (
                        <div 
                            key={index} 
                            className="relative text-center group"
                            style={{animation: `fadeInUp 0.5s ease-out ${index * 150}ms both`}}
                        >
                            {/* Step circle */}
                            <div className="relative w-[88px] h-[88px] mx-auto mb-8">
                                <div className="w-full h-full bg-white rounded-3xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] group-hover:shadow-[0_8px_30px_rgba(0,196,140,0.12)] group-hover:-translate-y-2 transition-all duration-500 border border-gray-100 group-hover:border-[#00C48C]/15">
                                    <step.icon className="w-9 h-9 text-[#00C48C] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.8} />
                                </div>
                                {/* Step number badge */}
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#1A1A1A] group-hover:bg-[#00C48C] text-white flex items-center justify-center font-poppins font-black text-xs border-[3px] border-white transition-colors duration-300 shadow-sm">
                                    {index + 1}
                                </div>
                            </div>
                            
                            {/* Arrow connector (desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-[36px] -right-4 z-20">
                                    <ArrowRight className="w-4 h-4 text-gray-300" />
                                </div>
                            )}
                            
                            <h4 className="font-poppins font-black text-lg text-[#1A1A1A] mb-3">{step.title}</h4>
                            <p className="text-sm text-[#6B7280] leading-[1.7] px-2 font-medium max-w-[240px] mx-auto">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
