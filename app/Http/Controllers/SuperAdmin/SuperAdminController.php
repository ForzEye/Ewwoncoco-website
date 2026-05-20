<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\PosTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

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
                             PosTransaction::whereDate('transaction_at', $date)->sum('total')
            ];
        });

        $insights = \App\Services\InsightService::generateSuperAdminInsights($stats);

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => $stats,
            'chartData' => $chartData,
            'insights' => $insights
        ]);
    }

    public function orders(Request $request)
    {
        $orders = Order::with(['merchant', 'customer', 'branch'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('SuperAdmin/Orders', [
            'orders' => $orders
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
            'merchants' => Merchant::select('id', 'name')->get()
        ]);
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
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'role' => 'required|in:super_admin,admin,kasir,customer',
            'merchant_id' => 'required_if:role,admin,kasir',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => bcrypt($request->password),
            'role' => $request->role,
            'merchant_id' => $request->merchant_id,
            'is_active' => true,
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
            'filters' => $request->only(['search'])
        ]);
    }

    public function showMerchant($id)
    {
        $merchant = Merchant::with(['owner', 'branches', 'products'])->findOrFail($id);

        return Inertia::render('SuperAdmin/MerchantDetail', [
            'merchant' => $merchant
        ]);
    }

    public function toggleMerchantStatus($id)
    {
        $merchant = Merchant::findOrFail($id);
        $merchant->update(['is_active' => !$merchant->is_active]);

        return back()->with('success', 'Status merchant berhasil diperbarui.');
    }
    public function settings()
    {
        $settings = SystemSetting::all()->pluck('value', 'key');
        $appSettings = \App\Models\AppSetting::all();
        
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
            'appLastConnected' => \App\Models\AppSetting::getVal('app_last_connected_at')
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
                'pos' => $posRevenue
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
            'paymentDistribution' => $paymentDistribution
        ]);
    }

    public function updateSettings(Request $request)
    {
        // Handle Logo Upload
        if ($request->hasFile('site_logo')) {
            $path = $request->file('site_logo')->store('settings');
            SystemSetting::setVal('site_logo', Storage::url($path), 'branding');
        }

        // Handle Favicon Upload
        if ($request->hasFile('site_favicon')) {
            $path = $request->file('site_favicon')->store('settings');
            SystemSetting::setVal('site_favicon', Storage::url($path), 'branding');
        }

        // Handle App Hero Image Upload (Support Multiple)
        if ($request->has('app_landing_hero_image')) {
            $images = $request->app_landing_hero_image;
            $paths = [];

            if (is_array($images)) {
                foreach ($images as $img) {
                    if ($img instanceof \Illuminate\Http\UploadedFile) {
                        $paths[] = $img->store('app', 's3');
                    } elseif (is_string($img)) {
                        // Keep existing S3 path (remove the full URL part if it's there)
                        $s3Url = Storage::disk('s3')->url('');
                        $paths[] = str_replace($s3Url, '', $img);
                    }
                }
            } elseif ($images instanceof \Illuminate\Http\UploadedFile) {
                $paths[] = $images->store('app', 's3');
            }

            if (!empty($paths)) {
                \App\Models\AppSetting::updateOrCreate(
                    ['key' => 'app_landing_hero_image'],
                    ['value' => json_encode($paths), 'type' => 'image', 'group' => 'landing']
                );
            }
        }
        // Handle System Text Settings
        $textSettings = [
            'site_name', 'site_title', 'hero_title', 'hero_subtitle', 
            'footer_text', 'contact_whatsapp', 'contact_email', 'instagram_url',
            'otp_enabled', 'wa_notifications_enabled'
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
                \App\Models\AppSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $request->input($key), 'type' => 'text', 'group' => 'landing']
                );
            }
        }

        return back()->with('success', 'Pengaturan berhasil diperbarui.');
    }
}
