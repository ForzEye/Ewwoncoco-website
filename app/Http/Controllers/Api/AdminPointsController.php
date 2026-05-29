<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PointsService;
use Illuminate\Http\Request;

class AdminPointsController extends Controller
{
    /**
     * Get customer point balance (POS/Merchant use)
     */
    public function getBalance($userId)
    {
        $user = User::findOrFail($userId);
        $balance = PointsService::getBalance($userId);

        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $userId,
                'user_name' => $user->name,
                'user_phone' => $user->phone,
                'balance' => $balance,
            ],
        ]);
    }

    /**
     * Redeem points for POS transaction
     */
    public function redeemPoints(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        $userId = $request->user_id;
        $orderId = $request->order_id ?? null;

        // If no order_id, calculate based on provided total
        if (! $orderId) {
            return response()->json([
                'success' => false,
                'message' => 'order_id diperlukan untuk redeem point',
            ], 400);
        }

        $result = PointsService::redeemPoints($userId, $orderId);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Manual adjust points (SuperAdmin only)
     */
    public function manualAdjust(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'points' => 'required|integer',
            'reason' => 'required|string|max:255',
        ]);

        // Check if user is super_admin
        $admin = $request->user();
        if (! $admin->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $newBalance = PointsService::manualAdjust(
            $request->user_id,
            $request->points,
            $request->reason
        );

        return response()->json([
            'success' => true,
            'data' => ['new_balance' => $newBalance],
        ]);
    }

    public function findCustomer(Request $request)
    {
        $request->validate([
            'query' => 'required|string',
        ]);

        $query = $request->input('query');

        $user = User::where(function ($q) use ($query) {
            $q->where('phone', 'like', '%'.$query.'%')
                ->orWhere('email', 'like', '%'.$query.'%');
        })
            ->where('role', 'customer')
            ->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Customer tidak ditemukan',
            ], 404);
        }

        $balance = PointsService::getBalance($user->id);

        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_phone' => $user->phone,
                'balance' => $balance,
            ],
        ]);
    }
}
