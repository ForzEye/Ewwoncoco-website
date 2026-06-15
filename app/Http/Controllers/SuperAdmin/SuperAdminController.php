<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\PosTransaction;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\InsightService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;

class SuperAdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_merchants' => Merchant::count(),
            'total_orders' => Order::count(),
            'total_pos' => PosTransaction::count(),
            'total_revenue' => Order::where('payment_status', 'confirmed')->sum('total') + PosTransaction::sum('total'),
            'today_orders' => Order::whereDate('created_at', now()->today())->count(),
            'today_revenue' => Order::whereDate('created_at', now()->today())->where('payment_status', 'confirmed')->sum('total') +
                               PosTransaction::whereDate('transaction_at', now()->today())->sum('total'),
        ];

        // Chart data (simulated for now, 7 days)
        $chartData = collect(range(6, 0))->map(function ($days) {
            $date = now()->subDays($days)->format('Y-m-d');

            return [
                'name' => now()->subDays($days)->format('D'),
                'revenue' => Order::whereDate('created_at', $date)->where('payment_status', 'confirmed')->sum('total') +
                             PosTransaction::whereDate('transaction_at', $date)->sum('total'),
            ];
        });

        $insights = InsightService::generateSuperAdminInsights($stats);

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => $stats,
            'chartData' => $chartData,
            'insights' => $insights,
        ]);
    }

    public function orders(Request $request)
    {
        $branches = \App\Models\Branch::with('merchant')->get();
        $selectedBranchId = $request->input('branch_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $search = $request->input('search');

        if ($selectedBranchId) {
            $branch = \App\Models\Branch::with('merchant')->findOrFail($selectedBranchId);

            // Fetch Online Orders
            $onlineOrdersQuery = Order::where('branch_id', $selectedBranchId)
                ->with(['customer', 'cashier'])
                ->orderBy('created_at', 'desc');

            // Fetch POS Transactions
            $posTransactionsQuery = PosTransaction::where('branch_id', $selectedBranchId)
                ->with(['customer', 'cashier'])
                ->orderBy('transaction_at', 'desc');

            if ($startDate) {
                $onlineOrdersQuery->where('created_at', '>=', $startDate . ' 00:00:00');
                $posTransactionsQuery->where(function($q) use ($startDate) {
                    $q->where('transaction_at', '>=', $startDate . ' 00:00:00')
                      ->orWhere(function($sq) use ($startDate) {
                          $sq->whereNull('transaction_at')->where('created_at', '>=', $startDate . ' 00:00:00');
                      });
                });
            }

            if ($endDate) {
                $onlineOrdersQuery->where('created_at', '<=', $endDate . ' 23:59:59');
                $posTransactionsQuery->where(function($q) use ($endDate) {
                    $q->where('transaction_at', '<=', $endDate . ' 23:59:59')
                      ->orWhere(function($sq) use ($endDate) {
                          $sq->whereNull('transaction_at')->where('created_at', '<=', $endDate . ' 23:59:59');
                      });
                });
            }

            if ($search) {
                $onlineOrdersQuery->where(function($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('customer', function($cq) use ($search) {
                          $cq->where('name', 'like', "%{$search}%");
                      });
                });
                $posTransactionsQuery->where(function($q) use ($search) {
                    $q->where('transaction_number', 'like', "%{$search}%")
                      ->orWhere('customer_name', 'like', "%{$search}%")
                      ->orWhereHas('customer', function($cq) use ($search) {
                          $cq->where('name', 'like', "%{$search}%");
                      });
                });
            }

            $onlineOrders = $onlineOrdersQuery->get()->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'total' => (float)$order->total,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'payment_method' => $order->payment_method,
                    'created_at' => $order->created_at->toIso8601String(),
                    'customer_name' => $order->customer?->name ?? 'Guest',
                    'type' => 'ONLINE',
                ];
            });

            $posTransactions = $posTransactionsQuery->get()->map(function ($pos) {
                return [
                    'id' => $pos->id,
                    'order_number' => $pos->transaction_number,
                    'total' => (float)$pos->total,
                    'status' => 'delivered',
                    'payment_status' => 'confirmed',
                    'payment_method' => $pos->payment_method,
                    'created_at' => ($pos->transaction_at ?: $pos->created_at)->toIso8601String(),
                    'customer_name' => $pos->customer_name ?? ($pos->customer?->name ?? 'Pelanggan Umum'),
                    'type' => 'POS',
                ];
            });

            // Combine and sort
            $combinedOrders = $onlineOrders->concat($posTransactions)
                ->sortByDesc('created_at')
                ->values()
                ->all();

            $perPage = 15;
            $page = Paginator::resolveCurrentPage() ?: 1;
            $allOrdersCollection = collect($combinedOrders);
            $paginatedCombinedOrders = new LengthAwarePaginator(
                $allOrdersCollection->forPage($page, $perPage)->values()->all(),
                $allOrdersCollection->count(),
                $perPage,
                $page,
                [
                    'path' => Paginator::resolveCurrentPath(),
                    'query' => $request->query(),
                ]
            );

            // Fetch Stock Movements with filters
            $stockMovementsQuery = \App\Models\StockMovement::where('branch_id', $selectedBranchId)
                ->with(['ingredient', 'user'])
                ->orderBy('created_at', 'desc');

            if ($request->input('stock_type')) {
                $stockMovementsQuery->where('type', $request->input('stock_type'));
            }

            if ($request->input('stock_search')) {
                $searchStock = $request->input('stock_search');
                $stockMovementsQuery->whereHas('ingredient', function ($q) use ($searchStock) {
                    $q->where('name', 'like', "%{$searchStock}%");
                });
            }

            $stockMovements = $stockMovementsQuery->limit(100)->get()->map(function($sm) {
                return [
                    'id' => $sm->id,
                    'type' => $sm->type,
                    'quantity' => (float)$sm->quantity,
                    'notes' => $sm->notes,
                    'created_at' => $sm->created_at->toIso8601String(),
                    'ingredient' => $sm->ingredient ? [
                        'id' => $sm->ingredient->id,
                        'name' => $sm->ingredient->name,
                        'unit' => $sm->ingredient->unit,
                    ] : null,
                    'user' => $sm->user ? [
                        'name' => $sm->user->name,
                    ] : null,
                ];
            });

            // Fetch Current Stock Level
            $stockData = \App\Models\BranchIngredient::where('branch_id', $selectedBranchId)
                ->with('ingredient')
                ->get()
                ->map(function ($si) {
                    return [
                        'id' => $si->id,
                        'stock' => (float)$si->stock,
                        'min_stock' => (float)$si->min_stock,
                        'average_cost' => (float)$si->average_cost,
                        'ingredient' => $si->ingredient ? [
                            'id' => $si->ingredient->id,
                            'name' => $si->ingredient->name,
                            'unit' => $si->ingredient->unit,
                        ] : null,
                    ];
                });

            // Fetch Cashier Shifts (limit 30)
            $shifts = \App\Models\PosShift::where('branch_id', $selectedBranchId)
                ->with('cashier')
                ->orderBy('created_at', 'desc')
                ->limit(30)
                ->get()
                ->map(function ($shift) {
                    $expectedCashSales = PosTransaction::where('shift_id', $shift->id)
                        ->where('payment_method', 'cash')
                        ->sum('total');

                    $expectedQrisSales = PosTransaction::where('shift_id', $shift->id)
                        ->where('payment_method', 'qris')
                        ->sum('total');

                    $expectedGofoodSales = PosTransaction::where('shift_id', $shift->id)
                        ->where('payment_method', 'gofood')
                        ->sum('total');

                    $expectedGrabfoodSales = PosTransaction::where('shift_id', $shift->id)
                        ->where('payment_method', 'grabfood')
                        ->sum('total');

                    $expectedShopeefoodSales = PosTransaction::where('shift_id', $shift->id)
                        ->where('payment_method', 'shopeefood')
                        ->sum('total');

                    return [
                        'id' => $shift->id,
                        'cashier_name' => $shift->cashier?->name ?? 'Unknown',
                        'opened_at' => $shift->opened_at ? $shift->opened_at->toIso8601String() : null,
                        'closed_at' => $shift->closed_at ? $shift->closed_at->toIso8601String() : null,
                        'opening_cash' => (float)$shift->opening_cash,
                        'expected_cash' => (float)($shift->opening_cash + $expectedCashSales),
                        'actual_cash' => $shift->closing_cash !== null ? (float)$shift->closing_cash : null,
                        'expected_qris' => (float)$expectedQrisSales,
                        'actual_qris' => $shift->closing_qris !== null ? (float)$shift->closing_qris : null,
                        'expected_gofood' => (float)$expectedGofoodSales,
                        'actual_gofood' => $shift->closing_gojek !== null ? (float)$shift->closing_gojek : null,
                        'expected_grabfood' => (float)$expectedGrabfoodSales,
                        'actual_grabfood' => $shift->closing_grab !== null ? (float)$shift->closing_grab : null,
                        'expected_shopeefood' => (float)$expectedShopeefoodSales,
                        'actual_shopeefood' => $shift->closing_shopeefood !== null ? (float)$shift->closing_shopeefood : null,
                        'notes' => $shift->notes,
                    ];
                });

            return Inertia::render('SuperAdmin/Orders', [
                'branches' => $branches,
                'selectedBranchId' => (int) $selectedBranchId,
                'branchDetail' => [
                    'branch' => $branch,
                    'combinedOrders' => $paginatedCombinedOrders,
                    'stockMovements' => $stockMovements,
                    'stockData' => $stockData,
                    'shifts' => $shifts,
                ],
                'filters' => [
                    'stock_type' => $request->input('stock_type', ''),
                    'stock_search' => $request->input('stock_search', ''),
                    'start_date' => $startDate ?? '',
                    'end_date' => $endDate ?? '',
                    'search' => $search ?? '',
                ]
            ]);
        }

        // Global Orders (Default)
        $ordersQuery = Order::with(['merchant', 'customer', 'branch'])
            ->orderBy('created_at', 'desc');

        if ($startDate) {
            $ordersQuery->where('created_at', '>=', $startDate . ' 00:00:00');
        }
        if ($endDate) {
            $ordersQuery->where('created_at', '<=', $endDate . ' 23:59:59');
        }
        if ($search) {
            $ordersQuery->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('merchant', function($mq) use ($search) {
                      $mq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $ordersQuery->paginate(20)
            ->withQueryString();

        return Inertia::render('SuperAdmin/Orders', [
            'branches' => $branches,
            'selectedBranchId' => null,
            'orders' => $orders,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate ?? '',
                'search' => $search ?? '',
            ],
        ]);
    }

    public function users(Request $request)
    {
        $users = User::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('SuperAdmin/Users', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
            'merchants' => Merchant::select('id', 'name')->get(),
        ]);
    }

    public function exportUsers(Request $request)
    {
        $fileName = "Users_Export_" . now()->format('Y-m-d_H-i-s') . ".csv";

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=$fileName",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $usersQuery = User::with('merchant')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->orderBy('created_at', 'desc');

        $callback = function () use ($usersQuery) {
            $file = fopen('php://output', 'w');
            // Add UTF-8 BOM for proper Excel reading
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, ['ID', 'Nama', 'Email', 'No. Telp', 'Role', 'Status', 'Merchant', 'Tanggal Terdaftar']);

            $usersQuery->chunk(100, function ($users) use ($file) {
                foreach ($users as $user) {
                    $status = $user->is_active ? 'Aktif' : 'Nonaktif';
                    $roleLabel = match ($user->role) {
                        'super_admin' => 'Super Admin',
                        'admin' => 'Admin',
                        'kasir' => 'Kasir',
                        default => 'Customer',
                    };
                    fputcsv($file, [
                        $user->id,
                        $user->name,
                        $user->email,
                        $user->phone,
                        $roleLabel,
                        $status,
                        $user->merchant?->name ?? '-',
                        $user->created_at ? $user->created_at->timezone('Asia/Jakarta')->toDateTimeString() : '-',
                    ]);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function updateUser(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:super_admin,admin,kasir,customer',
            'is_active' => 'required|boolean',
        ]);

        $user = User::findOrFail($id);

        // Prevent super admin from deactivating themselves or changing their own role
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Anda tidak bisa mengubah role atau status akun Anda sendiri.');
        }

        $user->update($request->only(['role', 'is_active', 'merchant_id']));

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:super_admin,admin,kasir,customer',
            'merchant_id' => 'nullable|required_if:role,admin|required_if:role,kasir|exists:merchants,id',
        ], [
            'email.unique' => 'Email ini sudah digunakan oleh pengguna lain.',
            'phone.unique' => 'Nomor telepon ini sudah digunakan oleh pengguna lain.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'merchant_id.required_if' => 'Merchant wajib dipilih untuk role Admin dan Kasir.',
            'merchant_id.exists' => 'Merchant yang dipilih tidak valid.',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => bcrypt($validated['password']),
            'role' => $validated['role'],
            'merchant_id' => $validated['merchant_id'] ?? null,
            'is_active' => true,
            'email_verified_at' => now(), // Auto-verify since created by super admin
        ]);

        return back()->with('success', 'User berhasil dibuat.');
    }

    public function merchants(Request $request)
    {
        $merchants = Merchant::query()
            ->with('owner')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('SuperAdmin/Merchants', [
            'merchants' => $merchants,
            'filters' => $request->only(['search']),
        ]);
    }

    public function showMerchant($id)
    {
        $merchant = Merchant::with(['owner', 'branches', 'products'])->findOrFail($id);

        return Inertia::render('SuperAdmin/MerchantDetail', [
            'merchant' => $merchant,
        ]);
    }

    public function toggleMerchantStatus($id)
    {
        $merchant = Merchant::findOrFail($id);
        $merchant->update(['is_active' => ! $merchant->is_active]);

        return back()->with('success', 'Status merchant berhasil diperbarui.');
    }

    public function settings()
    {
        $settings = SystemSetting::all()->pluck('value', 'key');
        $appSettings = AppSetting::all();

        // Transform app settings for easy frontend use
        $appSettingsMap = $appSettings->pluck('value', 'key');

        // Also provide full URLs for images
        $appImages = [];
        foreach ($appSettings->where('type', 'image') as $s) {
            $appImages[$s->key] = $s->value ? Storage::disk('s3')->url($s->value) : null;
        }

        return Inertia::render('SuperAdmin/Settings', [
            'settings' => $settings,
            'appSettings' => $appSettingsMap,
            'appImages' => $appImages,
            'appLastConnected' => AppSetting::getVal('app_last_connected_at'),
        ]);
    }

    public function analytics()
    {
        // 1. Revenue & Order Trends (Last 6 Months)
        $monthlyStats = collect(range(5, 0))->map(function ($months) {
            $start = now()->subMonths($months)->startOfMonth();
            $end = now()->subMonths($months)->endOfMonth();

            $onlineRevenue = Order::whereBetween('created_at', [$start, $end])
                ->whereIn('payment_status', ['confirmed', 'completed'])
                ->sum('total');

            $posRevenue = PosTransaction::whereBetween('transaction_at', [$start, $end])
                ->sum('total');

            $onlineOrders = Order::whereBetween('created_at', [$start, $end])
                ->where('status', '!=', 'cancelled')
                ->count();
            $posOrders = PosTransaction::whereBetween('transaction_at', [$start, $end])->count();

            return [
                'name' => $start->format('M'),
                'revenue' => $onlineRevenue + $posRevenue,
                'orders' => $onlineOrders + $posOrders,
                'online' => $onlineRevenue,
                'pos' => $posRevenue,
            ];
        });

        // 2. Top Merchants by Revenue
        $topMerchants = Merchant::select('merchants.id', 'merchants.name')
            ->join('orders', 'merchants.id', '=', 'orders.merchant_id')
            ->selectRaw('SUM(orders.total) as total_revenue')
            ->whereIn('orders.payment_status', ['confirmed', 'completed'])
            ->groupBy('merchants.id', 'merchants.name')
            ->havingRaw('total_revenue > 0')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        // 3. Top Products (Global)
        // Combine Online Order Items and POS Transaction Items
        $topProducts = DB::table('products')
            ->select('products.id', 'products.name')
            ->selectRaw('(
                SELECT SUM(order_items.quantity) 
                FROM order_items 
                JOIN orders ON order_items.order_id = orders.id 
                WHERE order_items.product_id = products.id AND orders.status != "cancelled"
            ) + (
                SELECT SUM(pos_transaction_items.quantity) 
                FROM pos_transaction_items 
                WHERE pos_transaction_items.product_id = products.id
            ) as total_sold')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // 4. Payment Method Distribution
        $paymentDistribution = [
            ['name' => 'Cash (POS)', 'value' => PosTransaction::where('payment_method', 'cash')->count()],
            ['name' => 'QRIS (POS)', 'value' => PosTransaction::where('payment_method', 'qris')->count()],
            ['name' => 'Transfer (Online)', 'value' => Order::where('status', '!=', 'cancelled')->count()],
        ];

        return Inertia::render('SuperAdmin/Analytics', [
            'monthlyStats' => $monthlyStats,
            'topMerchants' => $topMerchants,
            'topProducts' => $topProducts,
            'paymentDistribution' => $paymentDistribution,
        ]);
    }

    public function updateSettings(Request $request)
    {
        // Handle Logo Upload
        if ($request->hasFile('site_logo')) {
            $path = $request->file('site_logo')->store('settings', 's3');
            SystemSetting::setVal('site_logo', Storage::disk('s3')->url($path), 'branding');
        }

        // Handle Favicon Upload
        if ($request->hasFile('site_favicon')) {
            $path = $request->file('site_favicon')->store('settings', 's3');
            SystemSetting::setVal('site_favicon', Storage::disk('s3')->url($path), 'branding');
        }

        // Handle App Screenshot Upload
        if ($request->hasFile('app_screenshot')) {
            $path = $request->file('app_screenshot')->store('settings', 's3');
            SystemSetting::setVal('app_screenshot', Storage::disk('s3')->url($path), 'branding');
        }

        // Handle App Hero Image Upload (Support Multiple)
        if ($request->has('app_landing_hero_image')) {
            $images = $request->app_landing_hero_image;
            $paths = [];

            if (is_array($images)) {
                foreach ($images as $img) {
                    if ($img instanceof UploadedFile) {
                        $paths[] = $img->store('app', 's3');
                    } elseif (is_string($img)) {
                        // Keep existing S3 path (remove the full URL part if it's there)
                        $s3Url = Storage::disk('s3')->url('');
                        $paths[] = str_replace($s3Url, '', $img);
                    }
                }
            } elseif ($images instanceof UploadedFile) {
                $paths[] = $images->store('app', 's3');
            }

            if (! empty($paths)) {
                AppSetting::updateOrCreate(
                    ['key' => 'app_landing_hero_image'],
                    ['value' => json_encode($paths), 'type' => 'image', 'group' => 'landing']
                );
            }
        }
        // Handle System Text Settings
        $textSettings = [
            'site_name', 'site_title', 'hero_title', 'hero_subtitle',
            'footer_text', 'contact_whatsapp', 'contact_email', 'instagram_url',
            'otp_enabled', 'otp_email_enabled', 'wa_notifications_enabled', 'android_download_url',
        ];

        foreach ($textSettings as $key) {
            if ($request->has($key)) {
                SystemSetting::setVal($key, $request->input($key), 'general');
            }
        }

        // Handle App Text Settings
        $appTextSettings = ['app_landing_promo_text', 'app_support_whatsapp'];
        foreach ($appTextSettings as $key) {
            if ($request->has($key)) {
                AppSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $request->input($key), 'type' => 'text', 'group' => 'landing']
                );
            }
        }

        return back()->with('success', 'Pengaturan berhasil diperbarui.');
    }
}
