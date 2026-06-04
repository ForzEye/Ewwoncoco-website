<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function shop(Request $request)
    {
        $merchants = Merchant::where('is_active', true)->get();
        $products = Product::where('is_available', true)
            ->with([
                'merchant.branches' => function ($query) {
                    $query->where('is_active', true);
                },
                'recipes.ingredient.branchStocks'
            ])
            ->paginate(12);

        $products->getCollection()->transform(function ($product) {
            $branch = $product->merchant ? $product->merchant->branches->first() : null;
            $branchId = $branch ? $branch->id : null;
            $product->stock = $product->calculateDynamicStock($branchId);
            return $product;
        });

        return Inertia::render('Customer/Shop', [
            'merchants' => $merchants,
            'products' => $products,
        ]);
    }

    public function merchant(Request $request, $slug)
    {
        $merchant = Merchant::where('slug', $slug)->firstOrFail();
        $firstActiveBranch = $merchant->branches()->where('is_active', true)->first();
        $branchId = $firstActiveBranch ? $firstActiveBranch->id : null;

        $products = Product::where('merchant_id', $merchant->id)
            ->where('is_available', true)
            ->with([
                'recipes.ingredient.branchStocks' => function ($query) use ($branchId) {
                    if ($branchId) {
                        $query->where('branch_id', $branchId);
                    }
                }
            ])
            ->get();

        $products->transform(function ($product) use ($branchId) {
            $product->stock = $product->calculateDynamicStock($branchId);
            return $product;
        });

        return Inertia::render('Customer/MerchantDetail', [
            'merchant' => $merchant,
            'products' => $products,
        ]);
    }

    public function product(Request $request, $slug)
    {
        $product = Product::where('slug', $slug)
            ->with([
                'merchant.branches' => function ($query) {
                    $query->where('is_active', true);
                },
                'category',
                'customizations.options',
                'recipes.ingredient.branchStocks'
            ])
            ->firstOrFail();

        $branch = $product->merchant ? $product->merchant->branches->first() : null;
        $branchId = $branch ? $branch->id : null;
        $product->stock = $product->calculateDynamicStock($branchId);

        $reviews = Review::with('customer:id,name,avatar_url')
            ->where('product_id', $product->id)
            ->latest()
            ->limit(5)
            ->get();

        $avgRating = Review::where('product_id', $product->id)->avg('rating') ?: 0;
        $reviewCount = Review::where('product_id', $product->id)->count();

        return Inertia::render('Customer/ProductDetail', [
            'product' => $product,
            'reviews' => $reviews,
            'avgRating' => round($avgRating, 1),
            'reviewCount' => $reviewCount,
        ]);
    }

    public function profile(Request $request)
    {
        return Inertia::render('Customer/Profile', [
            'user' => $request->user(),
        ]);
    }
}
