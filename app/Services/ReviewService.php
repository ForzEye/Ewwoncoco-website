<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Review;
use Illuminate\Support\Facades\Storage;

class ReviewService
{
    /**
     * Submit a review for an order
     */
    public static function submitReview(int $userId, int $orderId, int $rating, ?string $comment = null, $image = null): array
    {
        // Validate order belongs to user
        $order = Order::where('id', $orderId)
            ->where('customer_id', $userId)
            ->firstOrFail();

        // Check if already reviewed
        $existing = Review::where('order_id', $orderId)->first();
        if ($existing) {
            return ['success' => false, 'message' => 'Pesanan sudah direview'];
        }

        $imageUrl = null;
        if ($image && $image->isValid()) {
            $path = $image->store('reviews');
            $imageUrl = Storage::url($path);
        }

        $review = Review::create([
            'customer_id' => $userId,
            'order_id' => $orderId,
            'merchant_id' => $order->merchant_id,
            'rating' => $rating,
            'comment' => $comment,
            'image_url' => $imageUrl,
            'created_at' => now(),
        ]);

        return [
            'success' => true,
            'data' => [
                'review' => $review,
            ],
        ];
    }

    /**
     * Get product reviews
     */
    public static function getProductReviews(int $productId, int $page = 1, int $perPage = 10): array
    {
        $reviews = Review::where('product_id', $productId)
            ->with('customer:id,name,avatar_url')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $avgRating = Review::where('product_id', $productId)->avg('rating') ?? 0;

        return [
            'success' => true,
            'data' => [
                'items' => $reviews->items(),
                'average_rating' => round($avgRating, 1),
                'pagination' => [
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                    'per_page' => $reviews->perPage(),
                    'total' => $reviews->total(),
                ],
            ],
        ];
    }

    /**
     * Get review for an order
     */
    public static function getOrderReview(int $userId, int $orderId): ?array
    {
        $review = Review::where('order_id', $orderId)
            ->where('customer_id', $userId)
            ->first();

        return $review ? [
            'success' => true,
            'data' => [
                'review' => $review,
            ],
        ] : null;
    }

    /**
     * Check if order has been reviewed
     */
    public static function hasReviewed(int $orderId): bool
    {
        return Review::where('order_id', $orderId)->exists();
    }
}
