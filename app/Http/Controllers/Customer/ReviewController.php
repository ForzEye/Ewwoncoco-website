<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Store a new review
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_id'   => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'nullable|string|max:1000',
        ]);

        $order = Order::findOrFail($request->order_id);

        // Security Checks
        if ($order->customer_id !== Auth::id()) {
            return back()->with('error', 'Anda tidak diizinkan memberikan ulasan untuk pesanan ini.');
        }

        if ($order->status !== 'delivered') {
            return back()->with('error', 'Ulasan hanya dapat diberikan setelah pesanan terkirim.');
        }

        // Check if user already reviewed this product for this order
        $existingReview = Review::where('order_id', $request->order_id)
            ->where('product_id', $request->product_id)
            ->where('customer_id', Auth::id())
            ->first();

        if ($existingReview) {
            return back()->with('error', 'Anda sudah memberikan ulasan untuk produk ini.');
        }

        Review::create([
            'customer_id' => Auth::id(),
            'order_id'    => $request->order_id,
            'product_id'  => $request->product_id,
            'merchant_id' => $order->merchant_id,
            'rating'      => $request->rating,
            'comment'     => $request->comment,
            'created_at'  => now(),
        ]);

        return back()->with('success', 'Ulasan Anda berhasil dikirim. Terima kasih!');
    }

    /**
     * Get reviews for a product
     */
    public function productReviews($productId)
    {
        $reviews = Review::with('customer:id,name,avatar_url')
            ->where('product_id', $productId)
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }
}
