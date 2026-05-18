<?php

namespace App\Services;

class InsightService
{
    public static function generateAdminInsights($stats, $todayStats, $chartData)
    {
        $insights = [];

        // 1. Revenue Insight
        if ($todayStats['revenue'] > 0) {
            $insights[] = [
                'type' => 'success',
                'title' => 'Performa Penjualan',
                'text' => 'Omzet hari ini mencapai ' . number_format($todayStats['revenue'] / 1000, 0) . 'rb. Pertahankan ritme ini!',
                'icon' => 'TrendingUp'
            ];
        }

        // 2. Orders Trend
        $totalOrders = $stats['total_orders'];
        if ($totalOrders > 0) {
            $insights[] = [
                'type' => 'info',
                'title' => 'Volume Transaksi',
                'text' => 'Total ' . $totalOrders . ' pesanan telah diproses. Sistem mendeteksi pertumbuhan stabil.',
                'icon' => 'ShoppingBag'
            ];
        }

        // 3. Efficiency Insight
        if ($todayStats['voids'] > 2) {
            $insights[] = [
                'type' => 'warning',
                'title' => 'Anomali Kasir',
                'text' => 'Terdeteksi ' . $todayStats['voids'] . ' pembatalan (void) hari ini. Perlu pengecekan operasional.',
                'icon' => 'AlertCircle'
            ];
        }

        // 4. Time-based (Simple prediction)
        $currentHour = date('H');
        if ($currentHour >= 11 && $currentHour <= 14) {
            $insights[] = [
                'type' => 'magic',
                'title' => 'AI Prediction',
                'text' => 'Jam sibuk (Lunch Peak) sedang berlangsung. Pastikan stok bahan baku siap.',
                'icon' => 'Sparkles'
            ];
        } else {
             $insights[] = [
                'type' => 'magic',
                'title' => 'AI Recommendation',
                'text' => 'Waktu luang terdeteksi. Gunakan untuk restock bahan baku atau kebersihan outlet.',
                'icon' => 'Sparkles'
            ];
        }

        return $insights;
    }

    public static function generateSuperAdminInsights($stats)
    {
        $insights = [];

        // 1. Growth
        $insights[] = [
            'type' => 'magic',
            'title' => 'Ekosistem Growth',
            'text' => 'Total ' . $stats['total_merchants'] . ' merchant aktif. Skalabilitas sistem saat ini sangat sehat.',
            'icon' => 'Sparkles'
        ];

        // 2. Revenue Insight
        $insights[] = [
            'type' => 'success',
            'title' => 'Total Revenue Global',
            'text' => 'Perputaran uang di seluruh sistem mencapai ' . number_format($stats['total_revenue'] / 1000000, 1) . ' Juta Rupiah.',
            'icon' => 'TrendingUp'
        ];

        // 3. User Engagement
        $insights[] = [
            'type' => 'info',
            'title' => 'User Base',
            'text' => 'Terdapat ' . $stats['total_users'] . ' pengguna terdaftar. Rekomendasi: Tingkatkan kampanye marketing mobile.',
            'icon' => 'Users'
        ];

        return $insights;
    }
}
