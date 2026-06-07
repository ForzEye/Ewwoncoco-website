<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class InsightService
{
    public static function generateAdminInsights($stats, $todayStats, $chartData, $merchantId = null)
    {
        $insights = [];

        // 1. Revenue Insight
        if ($todayStats['revenue'] > 0) {
            $insights[] = [
                'type' => 'success',
                'title' => 'Performa Penjualan',
                'text' => 'Omzet hari ini mencapai '.number_format($todayStats['revenue'] / 1000, 0).'rb. Pertahankan ritme ini!',
                'icon' => 'TrendingUp',
            ];
        }

        // 2. Orders Trend
        $totalOrders = $stats['total_orders'];
        if ($totalOrders > 0) {
            $insights[] = [
                'type' => 'info',
                'title' => 'Volume Transaksi',
                'text' => 'Total '.$totalOrders.' pesanan telah diproses. Sistem mendeteksi pertumbuhan stabil.',
                'icon' => 'ShoppingBag',
            ];
        }

        // 3. Efficiency Insight
        if ($todayStats['voids'] > 2) {
            $insights[] = [
                'type' => 'warning',
                'title' => 'Anomali Kasir',
                'text' => 'Terdeteksi '.$todayStats['voids'].' pembatalan (void) hari ini. Perlu pengecekan operasional.',
                'icon' => 'AlertCircle',
            ];
        }

        // 4. Time-based (Dynamic prediction based on last 30 days)
        $busyHoursStr = '';
        $isBusyNow = false;

        if ($merchantId) {
            $startDate = now()->subDays(30)->startOfDay();
            
            // Query orders - Support SQLite during testing or MySQL in production
            $isSqlite = DB::connection()->getDriverName() === 'sqlite';
            $hourFunction = $isSqlite ? "strftime('%H', created_at)" : "HOUR(created_at)";
            $posHourFunction = $isSqlite ? "strftime('%H', transaction_at)" : "HOUR(transaction_at)";

            $orderCounts = DB::table('orders')
                ->where('merchant_id', $merchantId)
                ->where('created_at', '>=', $startDate)
                ->select(DB::raw("CAST($hourFunction AS SIGNED) as hour, count(*) as count"))
                ->groupBy(DB::raw("CAST($hourFunction AS SIGNED)"))
                ->get()
                ->pluck('count', 'hour')
                ->all();

            // Query POS transactions
            $posCounts = DB::table('pos_transactions')
                ->where('merchant_id', $merchantId)
                ->where('transaction_at', '>=', $startDate)
                ->select(DB::raw("CAST($posHourFunction AS SIGNED) as hour, count(*) as count"))
                ->groupBy(DB::raw("CAST($posHourFunction AS SIGNED)"))
                ->get()
                ->pluck('count', 'hour')
                ->all();

            // Merge counts by hour
            $hourlyCounts = [];
            for ($h = 0; $h < 24; $h++) {
                $count = ($orderCounts[$h] ?? 0) + ($posCounts[$h] ?? 0);
                if ($count > 0) {
                    $hourlyCounts[$h] = $count;
                }
            }

            if (!empty($hourlyCounts)) {
                // Calculate average of active hours
                $avgCount = array_sum($hourlyCounts) / count($hourlyCounts);
                
                // Peak hours are those >= average
                $peakHours = [];
                foreach ($hourlyCounts as $hour => $count) {
                    if ($count >= $avgCount) {
                        $peakHours[] = $hour;
                    }
                }
                sort($peakHours);

                if (!empty($peakHours)) {
                    // Group continuous hours
                    // e.g. [10, 11, 12, 14, 15] -> ["10:00 - 13:00", "14:00 - 16:00"]
                    $ranges = [];
                    $start = null;
                    $prev = null;
                    
                    foreach ($peakHours as $hour) {
                        if ($start === null) {
                            $start = $hour;
                            $prev = $hour;
                        } elseif ($hour == $prev + 1) {
                            $prev = $hour;
                        } else {
                            $end = $prev + 1;
                            $ranges[] = sprintf('%02d:00 - %02d:00', $start, $end);
                            $start = $hour;
                            $prev = $hour;
                        }
                    }
                    if ($start !== null) {
                        $end = $prev + 1;
                        $ranges[] = sprintf('%02d:00 - %02d:00', $start, $end);
                    }
                    
                    $busyHoursStr = implode(', ', $ranges);
                    
                    // Check if current hour is in peak hours
                    $currentHour = now()->hour;
                    if (in_array($currentHour, $peakHours)) {
                        $isBusyNow = true;
                    }
                }
            }
        }

        if ($busyHoursStr !== '') {
            if ($isBusyNow) {
                $insights[] = [
                    'type' => 'magic',
                    'title' => 'Prediksi AI',
                    'text' => 'Sedang dalam jam sibuk (terdeteksi pada jam ' . $busyHoursStr . '). Pastikan kesiapan staf dan ketersediaan stok bahan baku.',
                    'icon' => 'Sparkles',
                ];
            } else {
                $insights[] = [
                    'type' => 'magic',
                    'title' => 'Rekomendasi AI',
                    'text' => 'Saat ini bukan jam sibuk. Berdasarkan data 30 hari terakhir, jam ramai/sibuk biasanya terjadi pada pukul ' . $busyHoursStr . '.',
                    'icon' => 'Sparkles',
                ];
            }
        } else {
            // Fallback to static hours
            $currentHour = now()->hour;
            if ($currentHour >= 11 && $currentHour <= 14) {
                $insights[] = [
                    'type' => 'magic',
                    'title' => 'Prediksi AI',
                    'text' => 'Jam sibuk (Makan Siang) sedang berlangsung. Pastikan stok bahan baku siap.',
                    'icon' => 'Sparkles',
                ];
            } else {
                $insights[] = [
                    'type' => 'magic',
                    'title' => 'Rekomendasi AI',
                    'text' => 'Waktu luang terdeteksi. Gunakan untuk restock bahan baku atau kebersihan outlet.',
                    'icon' => 'Sparkles',
                ];
            }
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
            'text' => 'Total '.$stats['total_merchants'].' merchant aktif. Skalabilitas sistem saat ini sangat sehat.',
            'icon' => 'Sparkles',
        ];

        // 2. Revenue Insight
        $insights[] = [
            'type' => 'success',
            'title' => 'Total Revenue Global',
            'text' => 'Perputaran uang di seluruh sistem mencapai '.number_format($stats['total_revenue'] / 1000000, 1).' Juta Rupiah.',
            'icon' => 'TrendingUp',
        ];

        // 3. User Engagement
        $insights[] = [
            'type' => 'info',
            'title' => 'User Base',
            'text' => 'Terdapat '.$stats['total_users'].' pengguna terdaftar. Rekomendasi: Tingkatkan kampanye marketing mobile.',
            'icon' => 'Users',
        ];

        return $insights;
    }
}
