<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#00C48C" />
        
        {{-- Favicon --}}
        <link rel="icon" type="image/x-icon" href="{{ \App\Models\SystemSetting::getVal('site_favicon', asset('favicon.ico')) }}" />

        {{-- Preconnect to Google Fonts to speed up asset loading --}}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

        {{-- SEO Meta --}}
        <meta name="description" content="EWWON COCO — Platform digital commerce internal. Satu platform untuk kelola semua operasional bisnis: online ordering, POS kasir, inventaris, pengiriman, dan analitik." />
        <meta name="robots" content="index, follow" />

        {{-- Open Graph --}}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="EWWON COCO" />
        <meta property="og:title" content="EWWON COCO — Satu Platform. Kelola Semua Operasional." />
        <meta property="og:description" content="Platform digital commerce internal yang menggabungkan online ordering dan POS kasir dalam satu ekosistem terpadu." />
        <meta property="og:image" content="{{ asset('images/og-image.png') }}" />

        {{-- CSRF --}}
        <meta name="csrf-token" content="{{ csrf_token() }}" />

        {{-- Inertia Head --}}
        @inertiaHead

        {{-- Ziggy Routes --}}
        @routes

        {{-- Vite Assets --}}
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    </head>
    <body class="antialiased">
        @inertia
    </body>
</html>
