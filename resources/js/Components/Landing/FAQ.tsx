import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShoppingCart, Truck, Wallet, ShieldCheck, Sparkles } from 'lucide-react';

const faqCategories = [
    {
        id: 'produk',
        label: 'Produk & Menu',
        icon: ShoppingCart,
        items: [
            {
                question: "Apakah kelapa yang digunakan benar-benar asli?",
                answer: "Tentu saja! Kami hanya menggunakan kelapa muda pilihan yang dikupas langsung saat ada pesanan untuk menjaga kesegaran dan rasa manis alaminya. Tanpa pengawet dan pemanis buatan."
            },
            {
                question: "Berapa lama daya tahan produk Ewwon Coco?",
                answer: "Karena produk kami 100% alami tanpa pengawet, kami menyarankan untuk segera dikonsumsi dalam waktu 2-3 jam setelah diterima. Jika disimpan di kulkas, daya tahan maksimal adalah 12 jam."
            },
            {
                question: "Apakah tersedia pilihan tingkat kemanisan (sugar level)?",
                answer: "Ya, Anda bisa menyesuaikan tingkat kemanisan untuk menu Shake atau menu dengan gula tambahan. Silakan tuliskan di catatan pesanan: No Sugar, Less Sugar (50%), atau Normal Sugar."
            }
        ]
    },
    {
        id: 'pengiriman',
        label: 'Pengiriman & Pickup',
        icon: Truck,
        items: [
            {
                question: "Berapa lama waktu pengirimannya?",
                answer: "Rata-rata pesanan sampai dalam waktu 20-30 menit. Tim kami menyiapkan pesanan dalam 5 menit, dan sisanya adalah waktu perjalanan kurir mitra (Gojek/Grab) ke lokasi Anda."
            },
            {
                question: "Apakah saya bisa mengambil sendiri pesanan saya (Pickup)?",
                answer: "Bisa sekali! Saat checkout, pilih opsi 'Ambil Sendiri'. Anda tidak akan dikenakan biaya kirim dan bisa langsung mengambil pesanan di outlet pilihan Anda setelah status pesanan berubah menjadi 'Siap Diambil'."
            },
            {
                question: "Area mana saja yang terjangkau pengiriman?",
                answer: "Kami melayani pengiriman dalam radius 10-15 km dari setiap outlet Ewwon Coco. Silakan aktifkan fitur lokasi pada browser/handphone Anda untuk melihat outlet terdekat."
            }
        ]
    },
    {
        id: 'pembayaran',
        label: 'Pembayaran & Promo',
        icon: Wallet,
        items: [
            {
                question: "Metode pembayaran apa saja yang tersedia?",
                answer: "Kami menerima pembayaran melalui QRIS (GoPay, OVO, Dana, ShopeePay, LinkAja) dan pembayaran tunai (Cash) untuk pesanan langsung di outlet atau COD untuk beberapa area."
            },
            {
                question: "Bagaimana cara menggunakan kode voucher?",
                answer: "Masukkan kode voucher Anda pada halaman 'Review Pesanan' sebelum melakukan pembayaran. Pastikan pesanan Anda memenuhi syarat dan ketentuan (minimal pembelian atau menu tertentu)."
            },
            {
                question: "Apa keuntungan menjadi Member Ewwon Coco?",
                answer: "Sebagai member, Anda akan mendapatkan Poin Loyalitas setiap kali belanja. Poin bisa ditukar dengan diskon belanja atau menu gratis. Anda juga akan mendapatkan info promo eksklusif lebih awal."
            }
        ]
    },
    {
        id: 'kemitraan',
        label: 'Kemitraan & Bisnis',
        icon: Sparkles,
        items: [
            {
                question: "Bagaimana cara bergabung menjadi Mitra Franchise?",
                answer: "Kami membuka peluang kemitraan bagi Anda yang ingin membuka outlet Ewwon Coco. Silakan hubungi tim Business Development kami melalui halaman 'Kontak' atau klik tombol WhatsApp bantuan."
            },
            {
                question: "Apakah Ewwon Coco menerima pesanan dalam jumlah besar (Catering)?",
                answer: "Tentu! Kami melayani pesanan untuk acara kantor, pernikahan, atau gathering. Untuk pesanan di atas 50 cup, kami menyarankan pemesanan H-1 untuk memastikan ketersediaan bahan baku."
            }
        ]
    }
];

export default function FAQ() {
    const [activeTab, setActiveTab] = useState('produk');
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    const currentCategory = faqCategories.find(cat => cat.id === activeTab);

    return (
        <section id="faq" className="relative py-12 bg-white">
            <div className="container-max section-px relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4 hidden lg:block">Pilih Kategori</p>
                                <div className="flex flex-row overflow-x-auto gap-3 pb-4 -mx-4 px-4 scrollbar-none lg:mx-0 lg:px-0 lg:flex-col lg:overflow-x-visible lg:pb-0 lg:space-y-2">
                                    {faqCategories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setActiveTab(cat.id);
                                                setOpenIdx(0); // Reset accordion when tab changes
                                            }}
                                            className={`flex items-center gap-3 px-5 py-3.5 lg:px-6 lg:py-4 rounded-2xl transition-all duration-300 shrink-0 ${
                                                activeTab === cat.id 
                                                ? 'bg-[#1A1A1A] text-white shadow-xl shadow-gray-200 lg:translate-x-2' 
                                                : 'text-gray-500 bg-gray-50/50 hover:bg-gray-50 hover:text-charcoal'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center transition-colors ${
                                                activeTab === cat.id ? 'bg-[#00C48C]' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                <cat.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                                            </div>
                                            <span className="font-poppins font-bold text-xs lg:text-sm">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="hidden lg:block p-8 bg-[#F0FAF6] rounded-[32px] border border-[#00C48C]/10 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h4 className="font-poppins font-black text-[#1A1A1A] mb-2">Bantuan Khusus?</h4>
                                    <p className="text-xs text-[#2D6A4F] font-medium leading-relaxed">Hubungi Support Center kami jika pertanyaan Anda belum terjawab.</p>
                                    <button className="mt-4 flex items-center gap-2 text-[10px] font-black text-[#00C48C] uppercase tracking-widest hover:translate-x-2 transition-transform">
                                        Hubungi Sekarang <ChevronDown className="-rotate-90 w-4 h-4" />
                                    </button>
                                </div>
                                <ShieldCheck className="absolute -bottom-6 -right-6 text-[#00C48C]/5 w-32 h-32" />
                            </div>
                        </div>
                    </div>

                    {/* Accordion Content */}
                    <div className="lg:col-span-8">
                        <div className="space-y-4">
                            {currentCategory?.items.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className={`bg-white rounded-[32px] border overflow-hidden transition-all duration-500 ${
                                        openIdx === idx 
                                        ? 'border-[#00C48C]/20 shadow-xl shadow-[#00C48C]/5' 
                                        : 'border-gray-100 hover:border-gray-200'
                                    }`}
                                >
                                    <button 
                                        onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                        className="w-full px-8 py-7 text-left flex items-center justify-between group"
                                    >
                                        <span className={`font-poppins font-black text-[15px] leading-tight transition-colors duration-300 ${
                                            openIdx === idx ? 'text-[#00C48C]' : 'text-[#1A1A1A] group-hover:text-[#00C48C]'
                                        }`}>
                                            {item.question}
                                        </span>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-4 transition-all duration-500 ${
                                            openIdx === idx ? 'bg-[#1A1A1A] rotate-180' : 'bg-gray-50'
                                        }`}>
                                            <ChevronDown size={20} className={openIdx === idx ? 'text-[#00C48C]' : 'text-gray-400'} />
                                        </div>
                                    </button>
                                    <div 
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                            openIdx === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="px-8 pb-8">
                                            <div className="w-full h-px bg-gray-50 mb-6"></div>
                                            <p className="text-gray-500 text-[15px] font-medium leading-[1.8]">
                                                {item.answer}
                                            </p>
                                            {idx === 0 && activeTab === 'produk' && (
                                                <div className="mt-6 flex gap-2">
                                                    <div className="px-3 py-1.5 bg-green-50 text-green-600 text-[9px] font-black uppercase rounded-lg">100% Organik</div>
                                                    <div className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg">Tanpa Pengawet</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Category Footer Info */}
                        <div className="mt-12 p-10 border-2 border-dashed border-gray-100 rounded-[40px] flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                <HelpCircle size={32} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-[#1A1A1A]">Informasi {currentCategory?.label}</p>
                                <p className="text-xs text-gray-500 mt-1">Jawaban di atas adalah ringkasan bantuan untuk kategori ini. <br className="hidden sm:block" />Klik 'Hubungi Kami' jika Anda membutuhkan bantuan lebih spesifik.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
