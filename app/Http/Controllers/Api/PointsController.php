<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PointsService;
use App\Services\ReviewService;
use Illuminate\Http\Request;

class PointsController extends Controller
{
    /**
     * Get user point balance
     */
    public function getBalance(Request $request)
    {
        $userId = $request->user()->id;
        $balance = PointsService::getBalance($userId);

        return response()->json([
            'success' => true,
            'data' => ['balance' => $balance],
        ]);
    }

    /**
     * Get point history
     */
    public function getHistory(Request $request)
    {
        $userId = $request->user()->id;
        $type = $request->query('type');
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 20);

        $history = PointsService::getHistory($userId, $type, $page, $perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $history->items(),
                'pagination' => [
                    'current_page' => $history->currentPage(),
                    'last_page' => $history->lastPage(),
                    'per_page' => $history->perPage(),
                    'total' => $history->total(),
                ],
            ],
        ]);
    }

    /**
     * Redeem points for an order
     */
    public function redeemPoints(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $userId = $request->user()->id;
        $orderId = $request->order_id;

        $result = PointsService::redeemPoints($userId, $orderId);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Get user's referral code
     */
    public function getReferralCode(Request $request)
    {
        $userId = $request->user()->id;
        $result = PointsService::getReferralCode($userId);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Apply referral code
     */
    public function applyReferralCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $userId = $request->user()->id;
        $code = strtoupper($request->code);

        $success = PointsService::applyReferralCode($userId, $code);

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Kode referral berhasil digunakan',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Kode referral tidak valid atau sudah digunakan',
        ], 400);
    }

    /**
     * Get point settings
     */
    public function getSettings()
    {
        $settings = PointsService::getSettings();

        return response()->json([
            'success' => true,
            'data' => ['settings' => $settings],
        ]);
    }

    // ─── Review Endpoints ───

    /**
     * Submit a review
     */
    public function submitReview(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,jpg,png|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $allowedMagicBytes = [
                'ffd8ff' => 'image/jpeg',
                '89504e' => 'image/png',
            ];
            $fileContent = file_get_contents($file->getRealPath());
            $magicBytes = bin2hex(substr($fileContent, 0, 3));
            
            if (!isset($allowedMagicBytes[$magicBytes])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Format gambar tidak valid atau berbahaya.'
                ], 422);
            }
        }

        $userId = $request->user()->id;

        $result = ReviewService::submitReview(
            $userId,
            $request->order_id,
            $request->rating,
            $request->comment,
            $request->file('image')
        );

        if ($result['success']) {
            return response()->json($result, 201);
        }

        return response()->json($result, 400);
    }

    /**
     * Get product reviews
     */
    public function getProductReviews(Request $request, $productId)
    {
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 10);

        $result = ReviewService::getProductReviews($productId, $page, $perPage);

        return response()->json($result);
    }

    /**
     * Get review for an order
     */
    public function getOrderReview(Request $request, $orderId)
    {
        $userId = $request->user()->id;
        $result = ReviewService::getOrderReview($userId, $orderId);

        if ($result) {
            return response()->json($result);
        }

        return response()->json([
            'success' => false,
            'message' => 'Review tidak ditemukan',
        ], 404);
    }
}
