<?php

namespace App\Services;

use App\Models\LoyaltyPoint;
use App\Models\Order;
use App\Models\UserPointsBalance;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VoucherService
{
    /**
     * Validate a voucher code for a user
     */
    public static function validate($code, $userId, $subtotal, $isOnline = true)
    {
        $voucher = Voucher::where('code', strtoupper($code))
            ->where('is_active', true)
            ->first();

        if (! $voucher) {
            return ['success' => false, 'message' => 'Kode voucher tidak valid.'];
        }

        if ($voucher->user_id && (int) $voucher->user_id !== (int) $userId) {
            return ['success' => false, 'message' => 'Voucher ini bukan milik Anda.'];
        }

        if ($voucher->expires_at && $voucher->expires_at->isPast()) {
            return ['success' => false, 'message' => 'Voucher sudah kadaluwarsa.'];
        }

        if ($voucher->usage_limit && $voucher->used_count >= $voucher->usage_limit) {
            return ['success' => false, 'message' => 'Kuota voucher sudah habis.'];
        }

        // Batas penggunaan voucher per-user
        if ($userId && $voucher->limit_per_user) {
            $userUsageCount = Order::where('customer_id', $userId)
                ->where('notes', 'like', '%Voucher: '.$voucher->code.'%')
                ->count();

            if ($userUsageCount >= $voucher->limit_per_user) {
                return ['success' => false, 'message' => 'Batas maksimal penggunaan voucher ini sudah tercapai untuk akun Anda.'];
            }
        }

        if ($subtotal < $voucher->min_purchase) {
            return [
                'success' => false,
                'message' => 'Minimal belanja untuk voucher ini adalah '.number_format($voucher->min_purchase, 0, ',', '.'),
            ];
        }

        if ($voucher->is_online_only && ! $isOnline) {
            return ['success' => false, 'message' => 'Voucher ini hanya berlaku untuk pemesanan online.'];
        }

        // Calculate discount
        $discount = 0;
        if ($voucher->discount_type === 'percent') {
            $discount = ($subtotal * $voucher->discount_value) / 100;
            if ($voucher->max_discount && $discount > $voucher->max_discount) {
                $discount = $voucher->max_discount;
            }
        } else {
            $discount = $voucher->discount_value;
        }

        return [
            'success' => true,
            'voucher' => $voucher,
            'discount' => $discount,
            'message' => 'Voucher berhasil digunakan!',
        ];
    }

    /**
     * Apply voucher to an order
     */
    public static function applyToOrder($orderId, $voucherCode)
    {
        $order = Order::findOrFail($orderId);
        $validation = self::validate($voucherCode, $order->customer_id, $order->subtotal, true);

        if (! $validation['success']) {
            return $validation;
        }

        $voucher = $validation['voucher'];
        $discount = $validation['discount'];

        DB::transaction(function () use ($order, $voucher, $discount) {
            // Update order discount
            $order->update([
                'discount' => $order->discount + $discount,
                'total' => max(0, $order->total - $discount),
                'notes' => ($order->notes ? $order->notes."\n" : '').'Voucher: '.$voucher->code,
            ]);

            // Increment usage count
            $voucher->increment('used_count');
        });

        return ['success' => true, 'discount' => $discount];
    }

    /**
     * Redeem a points voucher template for a specific user
     */
    public static function redeemVoucher($templateId, $userId)
    {
        $template = Voucher::where('id', $templateId)
            ->where('is_active', true)
            ->whereNotNull('points_cost')
            ->whereNull('user_id')
            ->first();

        if (! $template) {
            return ['success' => false, 'message' => 'Voucher template tidak valid atau tidak aktif.'];
        }

        if ($template->expires_at && $template->expires_at->isPast()) {
            return ['success' => false, 'message' => 'Voucher ini sudah kadaluwarsa.'];
        }

        if ($template->usage_limit && $template->used_count >= $template->usage_limit) {
            return ['success' => false, 'message' => 'Kuota voucher ini sudah habis.'];
        }

        $pointsCost = $template->points_cost;
        $userBalance = PointsService::getBalance($userId);

        if ($userBalance < $pointsCost) {
            return [
                'success' => false,
                'message' => "Poin Anda tidak cukup. Dibutuhkan {$pointsCost} poin (Saldo Anda: {$userBalance} poin).",
            ];
        }

        return DB::transaction(function () use ($template, $userId, $pointsCost) {
            // Deduct user's points
            LoyaltyPoint::create([
                'customer_id' => $userId,
                'merchant_id' => $template->merchant_id,
                'points' => -$pointsCost,
                'transaction_type' => 'redeem',
                'reference_type' => 'voucher_redemption',
                'reference_id' => $template->id,
                'description' => "Menukarkan {$pointsCost} poin untuk voucher: {$template->name}",
                'created_at' => now(),
            ]);

            $balanceRecord = UserPointsBalance::getOrCreateForUser($userId);
            $balanceRecord->deductPoints($pointsCost);

            // Increment used_count on the template
            $template->increment('used_count');

            // Generate unique user voucher code
            do {
                $uniqueCode = 'RDM-'.strtoupper(substr(str_replace(' ', '', $template->code), 0, 8)).'-'.strtoupper(Str::random(5));
            } while (Voucher::where('code', $uniqueCode)->exists());

            // Clone voucher
            $userVoucher = Voucher::create([
                'merchant_id' => $template->merchant_id,
                'name' => $template->name,
                'code' => $uniqueCode,
                'discount_type' => $template->discount_type,
                'discount_value' => $template->discount_value,
                'min_purchase' => $template->min_purchase,
                'max_discount' => $template->max_discount,
                'usage_limit' => 1,
                'used_count' => 0,
                'expires_at' => $template->expires_at ?? now()->addDays(30),
                'is_active' => true,
                'is_online_only' => $template->is_online_only,
                'limit_per_user' => 1,
                'points_cost' => null,
                'user_id' => $userId,
            ]);

            return [
                'success' => true,
                'message' => 'Voucher berhasil ditukarkan!',
                'data' => $userVoucher,
            ];
        });
    }
}
