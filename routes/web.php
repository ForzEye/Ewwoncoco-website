<?php

use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Admin\CustomizationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\IngredientController;
use App\Http\Controllers\Admin\MarketingController;
use App\Http\Controllers\Admin\MerchantOrderController;
use App\Http\Controllers\Admin\MerchantProductController;
use App\Http\Controllers\Admin\MonitoringController;
use App\Http\Controllers\Admin\RecipeController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\StockManagementController;
use App\Http\Controllers\Admin\VoucherController;
use App\Http\Controllers\Api\AdminPointsController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CustomerController;
use App\Http\Controllers\Customer\LoyaltyController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\ReferralController;
use App\Http\Controllers\Customer\ReviewController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\POS\OnlineOrderController;
use App\Http\Controllers\POS\POSController;
use App\Http\Controllers\POS\ShiftController;
use App\Http\Controllers\POS\TransactionController;
use App\Http\Controllers\SuperAdmin\BranchManagementController;
use App\Http\Controllers\SuperAdmin\SuperAdminController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes (no auth required)
|--------------------------------------------------------------------------
*/

Route::get('/', [LandingController::class, 'index'])->name('home');
Route::get('/contact', [LandingController::class, 'contact'])->name('contact');
Route::get('/faq', [LandingController::class, 'faq'])->name('faq');

Route::get('/debug-promo', function() {
    $now = now();
    $promotions_raw = \App\Models\Promotion::all();
    $promotions_active = \App\Models\Promotion::active()->get();
    $user = auth()->user();
    
    $merchantId = $user ? ($user->merchant_id ?? 1) : 1;
    $promotions_for_user = \App\Models\Promotion::active()
        ->where('merchant_id', $merchantId)
        ->where('type', 'bogo')
        ->whereIn('applicable_on', ['offline', 'all'])
        ->get();
    
    return response()->json([
        'current_time_php' => $now->toDateTimeString(),
        'current_timezone_php' => date_default_timezone_get(),
        'laravel_timezone' => config('app.timezone'),
        'database_now' => \Illuminate\Support\Facades\DB::select('SELECT NOW() as db_time')[0]->db_time ?? null,
        'authenticated_user' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'role' => $user->role,
            'merchant_id' => $user->merchant_id,
        ] : null,
        'all_users_in_db' => \App\Models\User::all(['id', 'name', 'role', 'merchant_id'])->toArray(),
        'promotions_for_authenticated_user' => $promotions_for_user->map(function($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'merchant_id' => $p->merchant_id,
                'type' => $p->type,
                'applicable_on' => $p->applicable_on,
            ];
        }),
        'all_promotions_in_db' => $promotions_raw,
        'active_promotions_queried' => $promotions_active->pluck('id')->toArray(),
    ]);
});

Route::get('/clear-cache', function() {
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    return '🚀 Seluruh cache aplikasi berhasil dibersihkan!';
});

// Informational Pages (others)
Route::get('/terms', [LandingController::class, 'info'])->defaults('type', 'terms')->name('terms');
Route::get('/privacy', [LandingController::class, 'info'])->defaults('type', 'privacy')->name('privacy');
Route::get('/info/delivery', [LandingController::class, 'info'])->defaults('type', 'delivery')->name('info.delivery');
Route::get('/info/pickup', [LandingController::class, 'info'])->defaults('type', 'pickup')->name('info.pickup');

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:6,1')
        ->name('register.submit');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:6,1')
        ->name('login.submit');

    // Google OAuth
    Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('google.redirect');
    Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('google.callback');
});

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

/*
|--------------------------------------------------------------------------
| Customer Routes (auth required, role: customer)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {
    Route::get('/shop', [CustomerController::class, 'shop'])->name('shop');
    Route::get('/shop/{slug}', [CustomerController::class, 'merchant'])->name('merchant.detail');
    Route::get('/products/{slug}', [CustomerController::class, 'product'])->name('product.detail');

    Route::get('/cart', [CartController::class, 'index'])->name('cart');

    Route::get('/checkout', [OrderController::class, 'checkout'])->name('checkout');
    Route::post('/checkout', [OrderController::class, 'store'])->name('checkout.store');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders');
    Route::get('/orders/{id}', [OrderController::class, 'show'])->name('orders.detail');
    Route::post('/orders/{id}/payment-proof', [OrderController::class, 'uploadPaymentProof'])->name('orders.payment_proof');

    Route::get('/profile', [CustomerController::class, 'profile'])->name('profile');

    Route::get('/loyalty', [LoyaltyController::class, 'index'])->name('loyalty');
    Route::get('/referral', [ReferralController::class, 'index'])->name('referral');

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::get('/api/products/{id}/reviews', [ReviewController::class, 'productReviews'])->name('api.product.reviews');

    // Chat
    Route::get('/chats', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chats/merchant/{merchantId}', [ChatController::class, 'openRoom'])->name('chat.open');
    Route::get('/chats/{id}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chats/{id}/send', [ChatController::class, 'sendMessage'])->name('chat.send');

    // Delivery API (Internal)
    Route::get('/api/delivery/quote', [OrderController::class, 'getDeliveryQuote'])->name('delivery.quote');

    // FCM Notification
    Route::post('/api/notifications/token', [NotificationController::class, 'updateToken'])->name('notifications.token');
});

/*
|--------------------------------------------------------------------------
| Admin / Owner Routes (role: admin)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:admin,super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Products
    Route::get('/products', [MerchantProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [MerchantProductController::class, 'create'])->name('products.create');
    Route::post('/products', [MerchantProductController::class, 'store'])->name('products.store');
    Route::get('/products/{id}/edit', [MerchantProductController::class, 'edit'])->name('products.edit');
    Route::post('/products/{id}', [MerchantProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{id}', [MerchantProductController::class, 'destroy'])->name('products.destroy');

    // Customizations
    Route::get('/customizations', [CustomizationController::class, 'index'])->name('customizations.index');
    Route::post('/customizations', [CustomizationController::class, 'store'])->name('customizations.store');
    Route::post('/customizations/{id}', [CustomizationController::class, 'update'])->name('customizations.update');
    Route::delete('/customizations/{id}', [CustomizationController::class, 'destroy'])->name('customizations.destroy');

    // Orders
    Route::get('/orders', [MerchantOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [MerchantOrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{id}/status', [MerchantOrderController::class, 'updateStatus'])->name('orders.status');

    // Placeholders for other admin features
    Route::get('/inventory', function () {
        return Inertia::render('Admin/Inventory');
    })->name('inventory');
    Route::get('/analytics', function () {
        return Inertia::render('Admin/Analytics');
    })->name('analytics');
    Route::get('/vouchers', [VoucherController::class, 'index'])->name('vouchers');
    Route::post('/vouchers', [VoucherController::class, 'store'])->name('vouchers.store');
    Route::post('/vouchers/{id}/toggle', [VoucherController::class, 'toggle'])->name('vouchers.toggle');
    Route::delete('/vouchers/{id}', [VoucherController::class, 'destroy'])->name('vouchers.destroy');
    Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
    Route::get('/pos-history', function () {
        return Inertia::render('Admin/POSHistory');
    })->name('pos-history');

    // Reports & Analytics
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export', [ReportController::class, 'exportCsv'])->name('reports.export');

    // Marketing
    Route::get('/marketing', [MarketingController::class, 'index'])->name('marketing.index');
    Route::post('/marketing', [MarketingController::class, 'store'])->name('marketing.store');
    Route::post('/marketing/{id}/toggle', [MarketingController::class, 'toggle'])->name('marketing.toggle');
    Route::delete('/marketing/{id}', [MarketingController::class, 'destroy'])->name('marketing.destroy');

    // Inventory & Recipe Management
    Route::get('/inventory/ingredients', [IngredientController::class, 'index'])->name('inventory.ingredients.index');
    Route::post('/inventory/ingredients', [IngredientController::class, 'store'])->name('inventory.ingredients.store');
    Route::post('/inventory/ingredients/{id}', [IngredientController::class, 'update'])->name('inventory.ingredients.update');
    Route::delete('/inventory/ingredients/{id}', [IngredientController::class, 'destroy'])->name('inventory.ingredients.destroy');

    Route::get('/inventory/stock', [StockManagementController::class, 'index'])->name('inventory.stock.index');
    Route::post('/inventory/stock/in', [StockManagementController::class, 'stockIn'])->name('inventory.stock.in');
    Route::post('/inventory/stock/adjust', [StockManagementController::class, 'stockAdjust'])->name('inventory.stock.adjust');

    Route::get('/inventory/recipes', [RecipeController::class, 'index'])->name('inventory.recipes.index');
    Route::post('/inventory/recipes', [RecipeController::class, 'store'])->name('inventory.recipes.store');
    Route::delete('/inventory/recipes/{id}', [RecipeController::class, 'destroy'])->name('inventory.recipes.destroy');

    // Shift Management (Admin)
    Route::get('/shifts', [ShiftController::class, 'adminIndex'])->name('shifts.index');
    Route::post('/shifts/{id}/unlock', [ShiftController::class, 'unlock'])->name('shifts.unlock');
    Route::post('/shifts/{id}/force-close', [ShiftController::class, 'forceClose'])->name('shifts.force_close');
});

/*
|--------------------------------------------------------------------------
| POS Cashier Routes (role: kasir)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:kasir,super_admin'])->prefix('pos')->name('pos.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'cashierIndex'])->name('dashboard');
    Route::get('/', [POSController::class, 'index'])->name('screen');
    Route::post('/store', [POSController::class, 'store'])->name('store');
    Route::get('/find-customer', [AdminPointsController::class, 'findCustomer'])->name('find-customer');

    Route::get('/shifts', [ShiftController::class, 'index'])->name('shifts');
    Route::post('/shifts/open', [ShiftController::class, 'open'])->name('shifts.open');
    Route::post('/shifts/close', [ShiftController::class, 'close'])->name('shifts.close');

    Route::get('/history', [TransactionController::class, 'index'])->name('transactions');
    Route::get('/history/{id}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::post('/history/{id}/void', [TransactionController::class, 'void'])->name('transactions.void');

    // Online Orders (POS)
    Route::get('/online-orders', [OnlineOrderController::class, 'index'])->name('online_orders.index');
    Route::post('/online-orders/{id}/accept', [OnlineOrderController::class, 'accept'])->name('online_orders.accept');
    Route::post('/online-orders/{id}/reject', [OnlineOrderController::class, 'reject'])->name('online_orders.reject');
    Route::post('/online-orders/{id}/status', [OnlineOrderController::class, 'updateStatus'])->name('online_orders.status');
});

/*
|--------------------------------------------------------------------------
| Super Admin Routes (role: super_admin)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:super_admin'])->prefix('super-admin')->name('superadmin.')->group(function () {
    Route::get('/', [SuperAdminController::class, 'dashboard'])->name('dashboard');

    // User Management
    Route::get('/users', [SuperAdminController::class, 'users'])->name('users');
    Route::post('/users', [SuperAdminController::class, 'storeUser'])->name('users.store');
    Route::post('/users/{id}', [SuperAdminController::class, 'updateUser'])->name('users.update');

    // Merchant Management
    Route::get('/merchants', [SuperAdminController::class, 'merchants'])->name('merchants');
    Route::get('/merchants/{id}', [SuperAdminController::class, 'showMerchant'])->name('merchants.show');
    Route::post('/merchants/{id}/toggle', [SuperAdminController::class, 'toggleMerchantStatus'])->name('merchants.toggle');

    // Branch Management
    Route::get('/branches', [BranchManagementController::class, 'index'])->name('branches.index');
    Route::post('/branches', [BranchManagementController::class, 'store'])->name('branches.store');
    Route::post('/branches/{id}', [BranchManagementController::class, 'update'])->name('branches.update');
    Route::delete('/branches/{id}', [BranchManagementController::class, 'destroy'])->name('branches.destroy');

    // System Settings
    Route::get('/settings', [SuperAdminController::class, 'settings'])->name('settings');
    Route::post('/settings', [SuperAdminController::class, 'updateSettings'])->name('settings.update');

    // Global Order Management
    Route::get('/orders', [SuperAdminController::class, 'orders'])->name('orders');

    // Placeholders for analytics
    Route::get('/analytics', [SuperAdminController::class, 'analytics'])->name('analytics');
    // Monitoring
    Route::get('/monitoring', [MonitoringController::class, 'index'])->name('monitoring');
    Route::get('/api/monitoring/otp-logs', [MonitoringController::class, 'getOtpLogs'])->name('api.monitoring.otp');
    Route::get('/api/monitoring/error-logs', [MonitoringController::class, 'getErrorLogs'])->name('api.monitoring.errors');
    Route::post('/api/monitoring/error-logs/clear', [MonitoringController::class, 'clearErrorLogs'])->name('api.monitoring.errors.clear');
});
