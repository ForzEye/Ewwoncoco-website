<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PosTransaction;
use App\Models\PosTransactionItem;
use App\Models\Branch;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DailySalesReportService
{
    /**
     * Get aggregated daily sales statistics for a given date.
     *
     * @param string|Carbon|null $date
     * @return array
     */
    public function getDailyReportData($date = null): array
    {
        $targetDate = $date ? Carbon::parse($date) : Carbon::yesterday();
        $dateStr = $targetDate->toDateString();
        
        // Indonesian Date Format
        Carbon::setLocale('id');
        $formattedDate = $targetDate->translatedFormat('l, d F Y');

        // 1. Online Orders (Paid / Completed)
        $onlineOrdersQuery = Order::whereDate('created_at', $dateStr)
            ->whereNotIn('status', ['cancelled', 'rejected']);

        $onlineCount = (clone $onlineOrdersQuery)->count();
        $onlineRevenue = (clone $onlineOrdersQuery)->sum('total');
        $onlineDiscount = (clone $onlineOrdersQuery)->sum('discount');

        // 2. POS Transactions
        $posQuery = PosTransaction::where(function ($q) use ($dateStr) {
            $q->whereDate('transaction_at', $dateStr)
              ->orWhere(function ($q2) use ($dateStr) {
                  $q2->whereNull('transaction_at')
                     ->whereDate('created_at', $dateStr);
              });
        });

        $posCount = (clone $posQuery)->count();
        $posRevenue = (clone $posQuery)->sum('total');
        $posDiscount = (clone $posQuery)->sum('discount');

        // Combined High Level Stats
        $totalRevenue = $onlineRevenue + $posRevenue;
        $totalTransactions = $onlineCount + $posCount;
        $averageOrderValue = $totalTransactions > 0 ? ($totalRevenue / $totalTransactions) : 0;
        $totalDiscount = $onlineDiscount + $posDiscount;

        // 3. Payment Method Breakdown
        $paymentMethods = [];
        
        // Online Orders Payment Methods
        $onlinePayments = Order::whereDate('created_at', $dateStr)
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->select('payment_method', DB::raw('COUNT(*) as total_count'), DB::raw('SUM(total) as total_amount'))
            ->groupBy('payment_method')
            ->get();

        foreach ($onlinePayments as $p) {
            $method = strtoupper($p->payment_method ?: 'ONLINE');
            $paymentMethods[$method] = [
                'name' => $method,
                'count' => ($paymentMethods[$method]['count'] ?? 0) + $p->total_count,
                'amount' => ($paymentMethods[$method]['amount'] ?? 0) + $p->total_amount,
            ];
        }

        // POS Payment Methods
        $posPayments = PosTransaction::where(function ($q) use ($dateStr) {
            $q->whereDate('transaction_at', $dateStr)
              ->orWhere(function ($q2) use ($dateStr) {
                  $q2->whereNull('transaction_at')
                     ->whereDate('created_at', $dateStr);
              });
        })
        ->select('payment_method', DB::raw('COUNT(*) as total_count'), DB::raw('SUM(total) as total_amount'))
        ->groupBy('payment_method')
        ->get();

        foreach ($posPayments as $p) {
            $method = strtoupper($p->payment_method ?: 'CASH');
            $paymentMethods[$method] = [
                'name' => $method,
                'count' => ($paymentMethods[$method]['count'] ?? 0) + $p->total_count,
                'amount' => ($paymentMethods[$method]['amount'] ?? 0) + $p->total_amount,
            ];
        }

        // Sort Payment Methods by Amount Descending
        usort($paymentMethods, fn($a, $b) => $b['amount'] <=> $a['amount']);

        // 4. Top Selling Products
        $productStats = [];

        // Order Items
        $orderItems = OrderItem::whereHas('order', function ($q) use ($dateStr) {
            $q->whereDate('created_at', $dateStr)
              ->whereNotIn('status', ['cancelled', 'rejected']);
        })
        ->with(['product'])
        ->get();

        foreach ($orderItems as $item) {
            $pId = $item->product_id;
            $pName = $item->product ? $item->product->name : ('Produk #' . $pId);
            if (!isset($productStats[$pId])) {
                $productStats[$pId] = [
                    'id' => $pId,
                    'name' => $pName,
                    'qty' => 0,
                    'total' => 0,
                ];
            }
            $productStats[$pId]['qty'] += $item->quantity;
            $productStats[$pId]['total'] += $item->subtotal;
        }

        // POS Items
        $posItems = PosTransactionItem::whereHas('transaction', function ($q) use ($dateStr) {
            $q->where(function ($q2) use ($dateStr) {
                $q2->whereDate('transaction_at', $dateStr)
                   ->orWhere(function ($q3) use ($dateStr) {
                       $q3->whereNull('transaction_at')
                          ->whereDate('created_at', $dateStr);
                   });
            });
        })
        ->with(['product'])
        ->get();

        foreach ($posItems as $item) {
            $pId = $item->product_id;
            $pName = $item->product ? $item->product->name : ('Produk #' . $pId);
            if (!isset($productStats[$pId])) {
                $productStats[$pId] = [
                    'id' => $pId,
                    'name' => $pName,
                    'qty' => 0,
                    'total' => 0,
                ];
            }
            $productStats[$pId]['qty'] += $item->quantity;
            $productStats[$pId]['total'] += $item->subtotal;
        }

        usort($productStats, fn($a, $b) => $b['total'] <=> $a['total']);
        $topProducts = array_slice($productStats, 0, 7);

        // 5. Branch Breakdown
        $branchStats = [];
        $branches = Branch::all();
        foreach ($branches as $branch) {
            $bOnline = Order::where('branch_id', $branch->id)
                ->whereDate('created_at', $dateStr)
                ->whereNotIn('status', ['cancelled', 'rejected'])
                ->sum('total');

            $bPos = PosTransaction::where('branch_id', $branch->id)
                ->where(function ($q) use ($dateStr) {
                    $q->whereDate('transaction_at', $dateStr)
                      ->orWhere(function ($q2) use ($dateStr) {
                          $q2->whereNull('transaction_at')
                             ->whereDate('created_at', $dateStr);
                      });
                })
                ->sum('total');

            $bTotal = $bOnline + $bPos;
            if ($bTotal > 0) {
                $branchStats[] = [
                    'name' => $branch->name,
                    'total' => $bTotal,
                ];
            }
        }

        return [
            'date_raw' => $dateStr,
            'date_formatted' => $formattedDate,
            'total_revenue' => $totalRevenue,
            'total_transactions' => $totalTransactions,
            'average_order_value' => $averageOrderValue,
            'total_discount' => $totalDiscount,
            'online_count' => $onlineCount,
            'online_revenue' => $onlineRevenue,
            'pos_count' => $posCount,
            'pos_revenue' => $posRevenue,
            'payment_methods' => array_values($paymentMethods),
            'top_products' => $topProducts,
            'branch_stats' => $branchStats,
        ];
    }
}
