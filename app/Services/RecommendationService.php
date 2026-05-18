<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class RecommendationService
{
    /**
     * Get personalized recommendations for a user
     */
    public static function getForUser($userId, $limit = 6)
    {
        // 1. Get user's most ordered categories
        $favoriteCategories = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.customer_id', $userId)
            ->where('orders.status', 'delivered')
            ->select('products.category_id', DB::raw('count(*) as total'))
            ->groupBy('products.category_id')
            ->orderByDesc('total')
            ->limit(2)
            ->pluck('category_id')
            ->toArray();

        // 2. Get products in those categories that user hasn't bought or buys frequently
        $personalizedIds = Product::whereIn('category_id', $favoriteCategories)
            ->where('is_available', true)
            ->inRandomOrder()
            ->limit($limit / 2)
            ->pluck('id')
            ->toArray();

        // 3. Get trending products (best sellers in last 30 days)
        $trendingIds = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'delivered')
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->select('product_id', DB::raw('count(*) as sales'))
            ->groupBy('product_id')
            ->orderByDesc('sales')
            ->limit($limit)
            ->pluck('product_id')
            ->toArray();

        // 4. Combine and fetch products
        $allIds = array_unique(array_merge($personalizedIds, $trendingIds));
        
        $products = Product::whereIn('id', $allIds)
            ->where('is_available', true)
            ->with(['category', 'merchant'])
            ->limit($limit)
            ->get();

        // 5. Fallback: if empty, get any available products
        if ($products->isEmpty()) {
            $products = Product::where('is_available', true)
                ->with(['category', 'merchant'])
                ->inRandomOrder()
                ->limit($limit)
                ->get();
        }

        return $products;
    }

    /**
     * Get "Frequently Bought Together" for a specific product
     */
    public static function getFrequentlyBoughtTogether($productId, $limit = 4)
    {
        // Find orders containing this product
        $orderIds = OrderItem::where('product_id', $productId)
            ->pluck('order_id')
            ->toArray();

        // Find other products in those same orders
        $relatedProductIds = OrderItem::whereIn('order_id', $orderIds)
            ->where('product_id', '!=', $productId)
            ->select('product_id', DB::raw('count(*) as frequency'))
            ->groupBy('product_id')
            ->orderByDesc('frequency')
            ->limit($limit)
            ->pluck('product_id')
            ->toArray();

        return Product::whereIn('id', $relatedProductIds)
            ->where('is_available', true)
            ->with(['category'])
            ->get();
    }
}
