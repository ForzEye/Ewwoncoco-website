import React from 'react';
import { Head } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';

interface InfoPageProps {
    type: string;
    title: string;
}

export default function InfoPage({ type, title }: InfoPageProps) {
    return (
        <LandingLayout>
            <Head title={`${title} - EWWON COCO`} />
            
            <div className="bg-white pt-24 pb-20 min-h-screen">
                {/* Hero Header */}
                <div className="bg-gray-50 py-16 border-b border-gray-100 mb-16">
                    <div className="container-max section-px">
                        <h1 className="text-4xl md:text-5xl font-heading font-black text-charcoal mb-4">
                            {title}
                        </h1>
                        <p className="text-gray-500 font-medium max-w-2xl">
                            Pelajari selengkapnya tentang layanan dan kebijakan kami untuk pengalaman terbaik di Ewwon Coco.
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container-max section-px">
                    <div className="max-w-4xl bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
                        <div className="prose prose-green max-w-none">
                            <p className="text-lg text-gray-muted leading-relaxed mb-6">
                                Konten untuk <span className="font-bold text-primary">{title}</span> sedang dalam tahap penyusunan oleh tim kami. 
                                Segera hadir untuk memberikan informasi terlengkap bagi Anda.
                            </p>
                            
                            <div className="bg-[#F0FAF6] p-6 rounded-2xl border border-[#00C48C]/10 flex items-start gap-4 mb-8">
                                <div className="text-2xl">🥥</div>
                                <div>
                                    <h4 className="font-bold text-charcoal mb-1">Butuh Bantuan Mendesak?</h4>
                                    <p className="text-sm text-gray-600">
                                        Jika Anda memiliki pertanyaan spesifik mengenai {title}, jangan ragu untuk menghubungi layanan pelanggan kami melalui WhatsApp.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="h-4 bg-gray-50 rounded-full w-full"></div>
                                <div className="h-4 bg-gray-50 rounded-full w-5/6"></div>
                                <div className="h-4 bg-gray-50 rounded-full w-4/6"></div>
                                <div className="h-4 bg-gray-50 rounded-full w-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
}
