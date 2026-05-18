<?php

namespace App\Services;

use App\Models\Voucher;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

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

        if (!$voucher) {
            return ['success' => false, 'message' => 'Kode voucher tidak valid.'];
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
                ->where('notes', 'like', "%Voucher: " . $voucher->code . "%")
                ->count();

            if ($userUsageCount >= $voucher->limit_per_user) {
                return ['success' => false, 'message' => 'Batas maksimal penggunaan voucher ini sudah tercapai untuk akun Anda.'];
            }
        }

        if ($subtotal < $voucher->min_purchase) {
            return [
                'success' => false, 
                'message' => 'Minimal belanja untuk voucher ini adalah ' . number_format($voucher->min_purchase, 0, ',', '.')
            ];
        }

        if ($voucher->is_online_only && !$isOnline) {
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
            'message' => 'Voucher berhasil digunakan!'
        ];
    }

    /**
     * Apply voucher to an order
     */
    public static function applyToOrder($orderId, $voucherCode)
    {
        $order = Order::findOrFail($orderId);
        $validation = self::validate($voucherCode, $order->customer_id, $order->subtotal, true);

        if (!$validation['success']) {
            return $validation;
        }

        $voucher = $validation['voucher'];
        $discount = $validation['discount'];

        DB::transaction(function () use ($order, $voucher, $discount) {
            // Update order discount
            $order->update([
                'discount' => $order->discount + $discount,
                'total' => max(0, $order->total - $discount),
                'notes' => ($order->notes ? $order->notes . "\n" : "") . "Voucher: " . $voucher->code
            ]);

            // Increment usage count
            $voucher->increment('used_count');
        });

        return ['success' => true, 'discount' => $discount];
    }
}
