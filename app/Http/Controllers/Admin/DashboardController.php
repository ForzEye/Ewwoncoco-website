<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Order;
use App\Models\PosShift;
use App\Models\PosTransaction;
use App\Models\Product;
use App\Services\InsightService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $merchant = Auth::user()->merchant;

        if (! $merchant) {
            return redirect()->route('home')->with('error', 'Akses ditolak.');
        }

        $merchantId = $merchant->id;

        // Statistics for current merchant
        $stats = [
            'total_revenue' => Order::where('merchant_id', $merchantId)->where('payment_status', 'confirmed')->sum('total') +
                              PosTransaction::where('merchant_id', $merchantId)->sum('total'),
            'total_orders' => Order::where('merchant_id', $merchantId)->count() +
                             PosTransaction::where('merchant_id', $merchantId)->count(),
            'pending_orders' => Order::where('merchant_id', $merchantId)->where('status', 'pending')->count(),
            'total_products' => Product::where('merchant_id', $merchantId)->count(),
        ];

        // Today's specific stats (Resets every day)
        $todayStats = [
            'revenue' => Order::where('merchant_id', $merchantId)->where('payment_status', 'confirmed')->whereDate('created_at', now())->sum('total') +
                         PosTransaction::where('merchant_id', $merchantId)->whereDate('transaction_at', now())->sum('total'),
            'orders' => Order::where('merchant_id', $merchantId)->whereDate('created_at', now())->count() +
                        PosTransaction::where('merchant_id', $merchantId)->whereDate('transaction_at', now())->count(),
            'voids' => PosShift::whereHas('branch', function ($q) use ($merchantId) {
                $q->where('merchant_id', $merchantId);
            })->whereDate('opened_at', now())->sum('void_count'),
        ];

        // Chart Data: Last 7 Days
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $label = now()->subDays($i)->isoFormat('ddd');

            $onlineSales = Order::where('merchant_id', $merchantId)
                ->where('payment_status', 'confirmed')
                ->whereDate('created_at', $date)
                ->sum('total');

            $posSales = PosTransaction::where('merchant_id', $merchantId)
                ->whereDate('transaction_at', $date)
                ->sum('total');

            $chartData[] = [
                'name' => $label,
                'sales' => (float) ($onlineSales + $posSales),
                'orders' => Order::where('merchant_id', $merchantId)->whereDate('created_at', $date)->count() +
                           PosTransaction::where('merchant_id', $merchantId)->whereDate('transaction_at', $date)->count(),
            ];
        }

        // Branch Status
        $branches = Branch::where('merchant_id', $merchantId)
            ->withCount(['orders as orders' => function ($q) {
                $q->whereIn('status', ['pending', 'confirmed', 'preparing']);
            }])
            ->get()
            ->map(function ($branch) {
                return [
                    'name' => $branch->name,
                    'status' => 'Online', // Simplified
                    'orders' => $branch->orders,
                ];
            });

        // Active Shifts for Monitoring
        $activeShifts = PosShift::whereHas('branch', function ($q) use ($merchantId) {
            $q->where('merchant_id', $merchantId);
        })
            ->whereNull('closed_at')
            ->with(['cashier', 'branch'])
            ->latest()
            ->get();

        $insights = InsightService::generateAdminInsights($stats, $todayStats, $chartData, $merchantId);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'todayStats' => $todayStats,
            'chartData' => $chartData,
            'branches' => $branches,
            'activeShifts' => $activeShifts,
            'insights' => $insights,
        ]);
    }

    public function cashierIndex()
    {
        $user = Auth::user();
        $merchant = $user->merchant;

        // Find branch assigned to this cashier (simple logic for now: first branch or matching)
        $branch = Branch::where('merchant_id', $merchant->id)->first(); // In real app, cashier is tied to specific branch

        if (! $branch) {
            return redirect()->route('home')->with('error', 'Cabang tidak ditemukan.');
        }

        $stats = [
            'today_sales' => PosTransaction::where('branch_id', $branch->id)->whereDate('transaction_at', now())->sum('total'),
            'today_orders' => PosTransaction::where('branch_id', $branch->id)->whereDate('transaction_at', now())->count(),
            'online_pending' => Order::where('branch_id', $branch->id)->where('status', 'pending')->count(),
        ];

        $currentShift = PosShift::where('cashier_id', $user->id)
            ->where('branch_id', $branch->id)
            ->whereNull('closed_at')
            ->first();

        $recentTransactions = PosTransaction::where('branch_id', $branch->id)
            ->latest('transaction_at')
            ->limit(5)
            ->get();

        return Inertia::render('Cashier/Dashboard', [
            'branch' => $branch,
            'stats' => $stats,
            'currentShift' => $currentShift,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
