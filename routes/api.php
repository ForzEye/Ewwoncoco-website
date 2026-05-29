<?php

use App\Http\Controllers\Api\MobileApiController;
use App\Http\Controllers\Api\PointsController;
use App\Http\Controllers\NotificationController;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Public endpoints
|--------------------------------------------------------------------------
*/

// Products: top selling (public — landing page)
Route::get('/products/top-selling', function () {
    $products = Product::where('is_available', true)
        ->latest()
        ->take(3)
        ->get();

    return response()->json($products);
});

/*
|--------------------------------------------------------------------------
| Webhooks — GoSend & GrabExpress (no auth, verified via signature)
|--------------------------------------------------------------------------
*/

Route::prefix('webhooks')->group(function () {
    Route::post('/gosend', function (Request $request) {
        // Akan diimplementasi di Section 10
        return response()->json(['status' => 'received']);
    })->middleware('verify.webhook:gosend')->name('webhooks.gosend');

    Route::post('/grabexpress', function (Request $request) {
        // Akan diimplementasi di Section 10
        return response()->json(['status' => 'received']);
    })->middleware('verify.webhook:grabexpress')->name('webhooks.grabexpress');
});

/*
|--------------------------------------------------------------------------
| Authenticated API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

/*
|--------------------------------------------------------------------------
| Mobile App API v1
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {
    // Public endpoints
    Route::get('/outlets', [MobileApiController::class, 'getOutlets']);
    Route::get('/categories', [MobileApiController::class, 'getCategories']);
    Route::get('/outlets/{branchId}/products', [MobileApiController::class, 'getProducts']);
    Route::post('/login', [MobileApiController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/register', [MobileApiController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/otp/send', [MobileApiController::class, 'sendOtp'])->middleware('throttle:otp-send');
    Route::post('/otp/verify', [MobileApiController::class, 'verifyOtp'])->middleware('throttle:otp-verify');
    Route::get('/promos', [MobileApiController::class, 'getPromos']);
    Route::get('/health', [MobileApiController::class, 'health'])->middleware('throttle:30,1');
    Route::get('/settings', [MobileApiController::class, 'getSettings']);

    // Protected routes for Mobile
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [MobileApiController::class, 'getUserProfile']);
        Route::post('/orders', [MobileApiController::class, 'storeOrder'])->middleware('throttle:orders');
        Route::get('/orders', [MobileApiController::class, 'getOrders']);
        Route::get('/orders/{orderId}', [MobileApiController::class, 'getOrderDetail']);
        Route::post('/orders/{orderId}/payment-proof', [MobileApiController::class, 'uploadPaymentProof']);
        Route::get('/notifications', [MobileApiController::class, 'getNotifications']);
        Route::post('/notifications/token', [NotificationController::class, 'updateToken']);

        // Chat
        Route::get('/chat/rooms', [MobileApiController::class, 'getChatRooms']);
        Route::post('/chat/merchants/{merchantId}/open', [MobileApiController::class, 'openChatRoom']);
        Route::get('/chat/rooms/{roomId}/messages', [MobileApiController::class, 'getChatMessages']);
        Route::post('/chat/rooms/{roomId}/messages', [MobileApiController::class, 'sendChatMessage'])->middleware('throttle:chat');

        // Points & Loyalty
        Route::get('/points/balance', [PointsController::class, 'getBalance']);
        Route::get('/points/history', [PointsController::class, 'getHistory']);
        Route::post('/points/redeem', [PointsController::class, 'redeemPoints']);
        Route::get('/points/referral-code', [PointsController::class, 'getReferralCode']);
        Route::post('/points/apply-referral', [PointsController::class, 'applyReferralCode']);
        Route::get('/points/settings', [PointsController::class, 'getSettings']);

        // Reviews
        Route::post('/reviews', [PointsController::class, 'submitReview']);
        Route::get('/products/{productId}/reviews', [PointsController::class, 'getProductReviews']);
        Route::get('/orders/{orderId}/review', [PointsController::class, 'getOrderReview']);

        // Vouchers
        Route::get('/vouchers', [MobileApiController::class, 'getVouchers']);
        Route::post('/vouchers/redeem', [MobileApiController::class, 'redeemVoucher']);
        Route::get('/vouchers/my', [MobileApiController::class, 'getMyVouchers']);
        Route::post('/vouchers/validate', [MobileApiController::class, 'validateVoucher'])->middleware('throttle:vouchers');

        // Profile
        Route::put('/user/profile', [MobileApiController::class, 'updateProfile']);
        Route::post('/user/avatar', [MobileApiController::class, 'uploadAvatar']);

        // Favorites
        Route::get('/user/favorites', [MobileApiController::class, 'getFavorites']);
        Route::post('/user/favorites/{productId}/toggle', [MobileApiController::class, 'toggleFavorite']);

        // Addresses
        Route::get('/user/addresses', [MobileApiController::class, 'getAddresses']);
        Route::post('/user/addresses', [MobileApiController::class, 'storeAddress']);
        Route::delete('/user/addresses/{id}', [MobileApiController::class, 'deleteAddress']);

        // AI Recommendations
        Route::get('/recommendations', [MobileApiController::class, 'getRecommendations']);
        Route::get('/products/{productId}/related', [MobileApiController::class, 'getRelatedProducts']);
    });
});
