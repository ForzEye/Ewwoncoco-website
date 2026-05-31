<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PosTransaction;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $merchant = Auth::user()->merchant;

        if (! $merchant) {
            // If super admin, maybe handle differently, but for now just redirect or error gracefully
            return redirect()->route('admin.dashboard')->with('error', 'Anda tidak memiliki toko yang terdaftar.');
        }

        $merchantId = $merchant->id;
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->toDateString();

        $startDateTime = $startDate.' 00:00:00';
        $endDateTime = $endDate.' 23:59:59';

        // 1. Sales Summary
        $onlineQuery = Order::where('merchant_id', $merchantId)
            ->where('payment_status', 'confirmed')
            ->whereBetween('created_at', [$startDateTime, $endDateTime]);

        $posQuery = PosTransaction::where('merchant_id', $merchantId)
            ->whereBetween('transaction_at', [$startDateTime, $endDateTime]);

        $summary = [
            'total_revenue' => $onlineQuery->sum('total') + $posQuery->sum('total'),
            'total_orders' => $onlineQuery->count() + $posQuery->count(),
            'online_revenue' => $onlineQuery->sum('total'),
            'pos_revenue' => $posQuery->sum('total'),
            'pos_cash_revenue' => (float) PosTransaction::where('merchant_id', $merchantId)
                ->where('payment_method', 'cash')
                ->whereBetween('transaction_at', [$startDateTime, $endDateTime])->sum('total'),
            'pos_qris_revenue' => (float) PosTransaction::where('merchant_id', $merchantId)
                ->where('payment_method', 'qris')
                ->whereBetween('transaction_at', [$startDateTime, $endDateTime])->sum('total'),
            'online_qris_revenue' => (float) Order::where('merchant_id', $merchantId)
                ->where('payment_status', 'confirmed')
                ->where('payment_method', 'qris')
                ->whereBetween('created_at', [$startDateTime, $endDateTime])->sum('total'),
            'online_transfer_revenue' => (float) Order::where('merchant_id', $merchantId)
                ->where('payment_status', 'confirmed')
                ->where('payment_method', 'manual_transfer')
                ->whereBetween('created_at', [$startDateTime, $endDateTime])->sum('total'),
            'cash_revenue' => (float) (Order::where('merchant_id', $merchantId)
                ->where('payment_status', 'confirmed')
                ->where('payment_method', 'cash')
                ->whereBetween('created_at', [$startDateTime, $endDateTime])->sum('total') +
                PosTransaction::where('merchant_id', $merchantId)
                    ->where('payment_method', 'cash')
                    ->whereBetween('transaction_at', [$startDateTime, $endDateTime])->sum('total')),
            'qris_revenue' => (float) (Order::where('merchant_id', $merchantId)
                ->where('payment_status', 'confirmed')
                ->where('payment_method', 'qris')
                ->whereBetween('created_at', [$startDateTime, $endDateTime])->sum('total') +
                PosTransaction::where('merchant_id', $merchantId)
                    ->where('payment_method', 'qris')
                    ->whereBetween('transaction_at', [$startDateTime, $endDateTime])->sum('total')),
        ];

        // 2. Chart Data: Daily Revenue
        $onlineDaily = $onlineQuery->select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total) as revenue')
        )->groupBy('date')->get()->pluck('revenue', 'date');

        $posDaily = $posQuery->select(
            DB::raw('DATE(transaction_at) as date'),
            DB::raw('SUM(total) as revenue')
        )->groupBy('date')->get()->pluck('revenue', 'date');

        // Merge daily data
        $chartData = [];
        $period = new \DatePeriod(
            new \DateTime($startDate),
            new \DateInterval('P1D'),
            (new \DateTime($endDate))->modify('+1 day')
        );

        foreach ($period as $date) {
            $formattedDate = $date->format('Y-m-d');
            $chartData[] = [
                'name' => $date->format('d M'),
                'online' => $onlineDaily[$formattedDate] ?? 0,
                'pos' => $posDaily[$formattedDate] ?? 0,
                'total' => ($onlineDaily[$formattedDate] ?? 0) + ($posDaily[$formattedDate] ?? 0),
            ];
        }

        // 3. Top Products (Online + POS Combined)
        $onlineItems = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.merchant_id', $merchantId)
            ->where('orders.payment_status', 'confirmed')
            ->whereBetween('orders.created_at', [$startDateTime, $endDateTime])
            ->select('order_items.product_id', 'order_items.quantity', 'order_items.subtotal');

        $posItems = DB::table('pos_transaction_items')
            ->join('pos_transactions', 'pos_transaction_items.transaction_id', '=', 'pos_transactions.id')
            ->where('pos_transactions.merchant_id', $merchantId)
            ->whereBetween('pos_transactions.transaction_at', [$startDateTime, $endDateTime])
            ->select('pos_transaction_items.product_id', 'pos_transaction_items.quantity', 'pos_transaction_items.subtotal');

        $topProducts = DB::table(DB::raw("({$onlineItems->toSql()} UNION ALL {$posItems->toSql()}) as combined_items"))
            ->mergeBindings($onlineItems)
            ->mergeBindings($posItems)
            ->join('products', 'combined_items.product_id', '=', 'products.id')
            ->select('products.name', DB::raw('SUM(combined_items.quantity) as sold'), DB::raw('SUM(combined_items.subtotal) as revenue'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('sold')
            ->limit(8)
            ->get();

        // 4. Recent Transactions for Report Table
        $onlineRecent = Order::where('merchant_id', $merchantId)
            ->where('payment_status', 'confirmed')
            ->whereBetween('created_at', [$startDateTime, $endDateTime])
            ->select('order_number as trx_no', 'created_at as date', 'payment_method', 'total', DB::raw("'ONLINE' as type"))
            ->orderByDesc('created_at')
            ->limit(15)
            ->get();

        $posRecent = PosTransaction::where('merchant_id', $merchantId)
            ->whereBetween('transaction_at', [$startDateTime, $endDateTime])
            ->select('transaction_number as trx_no', 'transaction_at as date', 'payment_method', 'total', DB::raw("'POS' as type"))
            ->orderByDesc('transaction_at')
            ->limit(15)
            ->get();

        $recentTransactions = $onlineRecent->concat($posRecent)->sortByDesc('date')->values()->all();

        // 5. BI: HPP & Profitability Analysis
        $totalHpp = 0;

        // Online Items HPP
        $onlineItemsData = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.merchant_id', $merchantId)
            ->where('orders.payment_status', 'confirmed')
            ->whereBetween('orders.created_at', [$startDateTime, $endDateTime])
            ->select('order_items.product_id', 'order_items.quantity')
            ->get();

        // POS Items HPP
        $posItemsData = DB::table('pos_transaction_items')
            ->join('pos_transactions', 'pos_transaction_items.transaction_id', '=', 'pos_transactions.id')
            ->where('pos_transactions.merchant_id', $merchantId)
            ->whereBetween('pos_transactions.transaction_at', [$startDateTime, $endDateTime])
            ->select('pos_transaction_items.product_id', 'pos_transaction_items.quantity')
            ->get();

        $allItems = $onlineItemsData->concat($posItemsData);
        $productIds = $allItems->pluck('product_id')->unique();

        // Pre-fetch all recipes and current avg costs for these products
        $recipes = Recipe::whereIn('product_id', $productIds)
            ->with('ingredient.branchStocks')
            ->get()
            ->groupBy('product_id');

        foreach ($allItems as $item) {
            $productRecipes = $recipes->get($item->product_id);
            if ($productRecipes) {
                foreach ($productRecipes as $recipe) {
                    // Get average cost from first branch (simplified for BI summary)
                    $avgCost = $recipe->ingredient->branchStocks->first()?->average_cost ?? 0;
                    $totalHpp += ($recipe->quantity * $item->quantity * $avgCost);
                }
            }
        }

        $summary['total_hpp'] = $totalHpp;
        $summary['gross_profit'] = $summary['total_revenue'] - $totalHpp;
        $summary['profit_margin'] = $summary['total_revenue'] > 0 ? ($summary['gross_profit'] / $summary['total_revenue']) * 100 : 0;

        return Inertia::render('Admin/Reports/Index', [
            'summary' => $summary,
            'chartData' => $chartData,
            'topProducts' => $topProducts,
            'recentTransactions' => $recentTransactions,
            'merchant' => $merchant,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function exportCsv(Request $request)
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $merchantId = $merchant->id;
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->toDateString();

        $fileName = "Report_{$startDate}_to_{$endDate}.csv";

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=$fileName",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($merchantId, $startDate, $endDate) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Tanggal', 'No. Transaksi', 'Tipe', 'Metode', 'Total']);

            // Online Orders
            $online = Order::where('merchant_id', $merchantId)
                ->where('payment_status', 'confirmed')
                ->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
                ->get();

            foreach ($online as $row) {
                fputcsv($file, [$row->created_at, $row->order_number, 'Online', $row->payment_method, $row->total]);
            }

            // POS Transactions
            $pos = PosTransaction::where('merchant_id', $merchantId)
                ->whereBetween('transaction_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
                ->get();

            foreach ($pos as $row) {
                fputcsv($file, [$row->transaction_at, $row->transaction_number, 'POS', $row->payment_method, $row->total]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
