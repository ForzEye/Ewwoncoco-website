import React from 'react';
import { Head } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import FAQSection from '@/Components/Landing/FAQ';
import { 
    HelpCircle, 
    MessageSquare, 
    Search,
    ChevronRight,
    ArrowRight
} from 'lucide-react';

export default function FAQ() {
    return (
        <LandingLayout>
            <Head title="FAQ - EWWON COCO" />
            
            {/* Header Section */}
            <section className="relative py-24 bg-white overflow-hidden border-b border-gray-50">
                <div className="container-max section-px relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#00C48C]/15 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <HelpCircle className="w-4 h-4 text-[#00C48C]" />
                        <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-[0.15em]">Pusat Bantuan</span>
                    </div>
                    <h1 className="text-4xl md:text-[4rem] font-poppins font-black text-[#1A1A1A] mb-6 leading-[1.1] tracking-tight max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                        Pertanyaan yang Sering{' '}
                        <span className="text-[#00C48C]">Ditanyakan.</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto mb-12 text-lg font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Cari jawaban cepat untuk pertanyaan Anda seputar produk, pengiriman, hingga kemitraan Ewwon Coco.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative group animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00C48C] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Cari pertanyaan Anda..."
                            className="w-full bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-charcoal focus:ring-4 focus:ring-[#00C48C]/5 focus:border-[#00C48C]/20 outline-none transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Component Section */}
            <div className="py-20 bg-white">
                <FAQSection />
            </div>

            {/* CTA Section */}
            <section className="py-24 bg-[#F9F9F9] border-t border-gray-100">
                <div className="container-max section-px">
                    <div className="bg-white rounded-[48px] p-12 md:p-20 shadow-xl shadow-gray-100 border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00C48C]/5 rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125"></div>
                        
                        <div className="relative z-10 max-w-xl text-center md:text-left">
                            <h3 className="text-3xl font-poppins font-black text-[#1A1A1A] mb-4">Masih Butuh Bantuan?</h3>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed">
                                Jika Anda tidak menemukan jawaban yang dicari, jangan ragu untuk menghubungi tim bantuan kami secara langsung.
                            </p>
                        </div>

                        <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <a 
                                href="/contact" 
                                className="inline-flex items-center justify-center gap-3 bg-[#1A1A1A] hover:bg-charcoal text-white px-10 py-5 rounded-2xl font-poppins font-bold shadow-lg shadow-gray-200 transition-all hover:-translate-y-1"
                            >
                                <MessageSquare size={20} />
                                Hubungi Kami
                            </a>
                            <a 
                                href="https://wa.me/628123456789" 
                                target="_blank"
                                className="inline-flex items-center justify-center gap-3 bg-[#00C48C] hover:bg-[#00A878] text-white px-10 py-5 rounded-2xl font-poppins font-bold shadow-lg shadow-[#00C48C]/20 transition-all hover:-translate-y-1"
                            >
                                Chat WhatsApp
                                <ArrowRight size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
