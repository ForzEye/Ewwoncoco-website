<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Landing page publik — tidak perlu auth.
     * Data produk terlaris diambil via API endpoint terpisah oleh React.
     */
    public function index(): Response
    {
        return Inertia::render('Landing/Home', [
            // SEO meta
            'meta' => [
                'title'       => 'EWWON COCO — Satu Platform. Kelola Semua Operasional.',
                'description' => 'Platform digital commerce internal yang menggabungkan online ordering dan POS kasir dalam satu ekosistem terpadu.',
            ],
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Landing/Contact');
    }

    public function faq(): Response
    {
        return Inertia::render('Landing/FAQ');
    }

    public function info(string $type): Response
    {
        $titles = [
            'faq'      => 'Frequently Asked Questions (FAQ)',
            'terms'    => 'Syarat & Ketentuan',
            'privacy'  => 'Kebijakan Privasi',
            'contact'  => 'Hubungi Kami',
            'delivery' => 'Informasi Pengiriman',
            'pickup'   => 'Informasi Ambil Sendiri (Pickup)',
        ];

        return Inertia::render('Landing/InfoPage', [
            'type' => $type,
            'title' => $titles[$type] ?? 'Informasi',
        ]);
    }
}
