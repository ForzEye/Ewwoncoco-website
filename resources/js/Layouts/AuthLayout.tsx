import { Head, Link, usePage } from '@inertiajs/react';
import React, { ReactNode } from 'react';
import { PageProps } from '@/types';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
    const { site_settings = {} } = usePage<PageProps>().props;
    const logoUrl = (site_settings as any)?.site_logo || '/images/logo.png';

    return (
        <div className="min-h-screen bg-light-green flex flex-col justify-center items-center p-4">
            <Head title={title} />
            
            <Link href="/" className="mb-8 flex items-center justify-center hover:scale-105 transition-transform">
                <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
            </Link>
            
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border-base p-6 sm:p-8 animate-fadeInUp">
                {children}
            </div>

            <div className="mt-8 text-center text-sm text-gray-muted">
                &copy; {new Date().getFullYear()} EWWON COCO. All rights reserved.
            </div>
        </div>
    );
}
