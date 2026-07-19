import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';
import { 
    Mail, 
    Phone, 
    MapPin, 
    MessageCircle, 
    Instagram, 
    Send,
    ChevronRight,
    Clock,
    ShieldCheck
} from 'lucide-react';
import { PageProps } from '@/types';

export default function Contact() {
    const { site_settings } = usePage<PageProps>().props;

    return (
        <LandingLayout>
            <Head title="Hubungi Kami - EWWON COCO" />
            
            {/* Header Section */}
            <section className="relative py-24 bg-gradient-to-br from-[#F0FAF6] via-white to-[#FFF8F0] overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#00C48C]/5 rounded-full blur-[100px]"></div>
                <div className="container-max section-px relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#00C48C]/15 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <span className="w-2 h-2 rounded-full bg-[#00C48C] animate-pulse"></span>
                            <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">Kontak & Bantuan</span>
                        </div>
                        <h1 className="text-4xl md:text-[4.5rem] font-poppins font-black text-[#1A1A1A] leading-[1.05] mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
                            Ada Pertanyaan? <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C48C] to-[#00A070]">Kami Siap Membantu.</span>
                        </h1>
                        <p className="text-xl text-gray-500 leading-relaxed font-medium max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            Punya saran, keluhan, atau ingin bertanya seputar kemitraan? Tim kami siap memberikan respon cepat untuk Anda.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 bg-white">
                <div className="container-max section-px">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Contact Info Cards */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                {/* WhatsApp Card */}
                                <a 
                                    href={`https://wa.me/${site_settings.contact_whatsapp || '628123456789'}`}
                                    target="_blank"
                                    className="group p-8 rounded-[32px] bg-[#F0FAF6] border border-[#00C48C]/10 hover:border-[#00C48C]/30 hover:shadow-xl hover:shadow-[#00C48C]/5 transition-all duration-500 flex items-start gap-6"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#00C48C] group-hover:scale-110 transition-transform duration-500">
                                        <MessageCircle size={32} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-poppins font-black text-[#1A1A1A] mb-1">WhatsApp Chat</h3>
                                        <p className="text-sm text-gray-500 font-medium mb-4">Respon cepat via WhatsApp Messenger.</p>
                                        <div className="inline-flex items-center gap-2 text-[#00C48C] font-black text-sm uppercase tracking-wider">
                                            Chat Sekarang <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </a>

                                {/* Instagram Card */}
                                <a 
                                    href={site_settings.instagram_url || '#'}
                                    target="_blank"
                                    className="group p-8 rounded-[32px] bg-[#FFF5F8] border border-pink-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/20 transition-all duration-500 flex items-start gap-6"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform duration-500">
                                        <Instagram size={32} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-poppins font-black text-[#1A1A1A] mb-1">Instagram</h3>
                                        <p className="text-sm text-gray-500 font-medium mb-4">Follow kami untuk info promo terbaru.</p>
                                        <div className="inline-flex items-center gap-2 text-pink-500 font-black text-sm uppercase tracking-wider">
                                            Follow @ewwoncoco <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </a>

                                {/* Email Card */}
                                <div className="group p-8 rounded-[32px] bg-[#F5F7FF] border border-blue-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/20 transition-all duration-500 flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500">
                                        <Mail size={32} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-poppins font-black text-[#1A1A1A] mb-1">Email Resmi</h3>
                                        <p className="text-sm text-gray-500 font-medium mb-1">Kirim surat elektronik untuk kerjasama.</p>
                                        <p className="text-sm font-black text-blue-600">{site_settings.contact_email || 'hello@ewwoncoco.com'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Hours */}
                            <div className="p-10 bg-[#1A1A1A] rounded-[40px] text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                    <Clock size={150} />
                                </div>
                                <h4 className="text-xl font-poppins font-bold mb-6 flex items-center gap-3">
                                    <Clock className="text-[#00C48C]" />
                                    Jam Operasional
                                </h4>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                        <span className="text-gray-400 font-medium">{site_settings.opening_hours_weekday_label || 'Senin - Jumat'}</span>
                                        <span className="font-bold">{site_settings.opening_hours_weekday || '09:00 - 21:00'}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                        <span className="text-gray-400 font-medium">{site_settings.opening_hours_weekend_label || 'Sabtu - Minggu'}</span>
                                        <span className="font-bold">{site_settings.opening_hours_weekend || '10:00 - 22:00'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 text-[10px] text-[#00C48C] font-black uppercase tracking-widest">
                                        <ShieldCheck size={14} /> Terbuka di hari libur nasional
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-7 bg-[#F9F9F9] rounded-[48px] p-12 border border-[#F0F0F0]">
                            <h3 className="text-3xl font-poppins font-black text-[#1A1A1A] mb-2">Kirim Pesan</h3>
                            <p className="text-gray-500 mb-10 font-medium leading-relaxed">
                                Isi formulir di bawah ini, tim kami akan menghubungi Anda kembali dalam waktu maksimal 24 jam.
                            </p>

                            <form className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                                        <input 
                                            type="text" 
                                            placeholder="Misal: John Doe"
                                            className="w-full px-7 py-4.5 bg-white border-transparent focus:ring-4 focus:ring-[#00C48C]/5 focus:border-[#00C48C]/20 rounded-2xl text-sm font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Anda</label>
                                        <input 
                                            type="email" 
                                            placeholder="contoh@email.com"
                                            className="w-full px-7 py-4.5 bg-white border-transparent focus:ring-4 focus:ring-[#00C48C]/5 focus:border-[#00C48C]/20 rounded-2xl text-sm font-bold outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Subjek</label>
                                    <select className="w-full px-7 py-4.5 bg-white border-transparent focus:ring-4 focus:ring-[#00C48C]/5 focus:border-[#00C48C]/20 rounded-2xl text-sm font-bold outline-none transition-all appearance-none cursor-pointer">
                                        <option>Pertanyaan Produk</option>
                                        <option>Kemitraan / Franchise</option>
                                        <option>Keluhan Pelanggan</option>
                                        <option>Kerja Sama Bisnis</option>
                                        <option>Lainnya</option>
                                    </select>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Pesan Anda</label>
                                    <textarea 
                                        placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                                        className="w-full px-7 py-5 bg-white border-transparent focus:ring-4 focus:ring-[#00C48C]/5 focus:border-[#00C48C]/20 rounded-2xl text-sm font-bold outline-none transition-all min-h-[160px] resize-none"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-[#1A1A1A] hover:bg-[#00C48C] text-white font-black py-6 rounded-[32px] shadow-xl shadow-gray-200 transition-all flex items-center justify-center space-x-3 group"
                                >
                                    <Send size={20} className="group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                    <span className="uppercase tracking-[0.2em] text-[13px]">Kirim Pesan Sekarang</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section Placeholder */}
            <section className="py-24 bg-[#F9F9F9] overflow-hidden">
                <div className="container-max section-px text-center">
                    <div className="max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-poppins font-black text-[#1A1A1A] mb-4">Temukan Cabang Kami</h2>
                        <p className="text-gray-500 font-medium">Kunjungi outlet terdekat untuk merasakan kesegaran langsung di lokasi.</p>
                    </div>
                    
                    <div className="relative rounded-[48px] overflow-hidden bg-gray-200 h-[500px] border-8 border-white shadow-2xl group">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight={0} 
                            marginWidth={0} 
                            src="https://www.openstreetmap.org/export/embed.html?bbox=106.810%2C-6.235%2C106.822%2C-6.224&amp;layer=mapnik&amp;marker=-6.2297%2C106.8159"
                            style={{ border: 0 }}
                            title="Kantor Pusat Ewwon Coco"
                        ></iframe>
                        {/* Static Overlay for UX */}
                        <div className="absolute bottom-8 left-8 p-6 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-xs text-left animate-in slide-in-from-left-8">
                            <h4 className="font-poppins font-black text-sm text-charcoal mb-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00C48C]"></div>
                                Kantor Pusat
                            </h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                Jl. Kelapa Muda No. 123, Jakarta Selatan, Indonesia 12345
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
