<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Merchant;
use App\Models\Product;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function shop(Request $request)
    {
        // Simple placeholder for shop
        // We'll fetch active merchants and products later as needed
        $merchants = Merchant::where('is_active', true)->get();
        $products = Product::where('is_available', true)->with('merchant')->paginate(12);

        return Inertia::render('Customer/Shop', [
            'merchants' => $merchants,
            'products' => $products
        ]);
    }

    public function merchant(Request $request, $slug)
    {
        $merchant = Merchant::where('slug', $slug)->firstOrFail();
        $products = Product::where('merchant_id', $merchant->id)->where('is_available', true)->get();

        return Inertia::render('Customer/MerchantDetail', [
            'merchant' => $merchant,
            'products' => $products
        ]);
    }

    public function product(Request $request, $slug)
    {
        $product = Product::where('slug', $slug)->with(['merchant', 'category'])->firstOrFail();
        
        $reviews = \App\Models\Review::with('customer:id,name,avatar_url')
            ->where('product_id', $product->id)
            ->latest()
            ->limit(5)
            ->get();

        $avgRating = \App\Models\Review::where('product_id', $product->id)->avg('rating') ?: 0;
        $reviewCount = \App\Models\Review::where('product_id', $product->id)->count();

        return Inertia::render('Customer/ProductDetail', [
            'product' => $product,
            'reviews' => $reviews,
            'avgRating' => round($avgRating, 1),
            'reviewCount' => $reviewCount
        ]);
    }

    public function profile(Request $request)
    {
        return Inertia::render('Customer/Profile', [
            'user' => $request->user()
        ]);
    }
}
