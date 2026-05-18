import { Head, Link } from '@inertiajs/react';
import React, { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-light-green flex flex-col justify-center items-center p-4">
            <Head title={title} />
            
            <Link href="/" className="mb-8 flex items-center justify-center bg-primary text-white w-16 h-16 rounded-2xl text-3xl shadow-sm hover:scale-105 transition-transform">
                🥥
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
