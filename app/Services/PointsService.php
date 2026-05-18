<?php

namespace App\Services;

use App\Models\AppSetting;
use App\Models\LoyaltyPoint;
use App\Models\Order;
use App\Models\Referral;
use App\Models\User;
use App\Models\UserPointsBalance;
use Illuminate\Support\Facades\DB;

class PointsService
{
    /**
     * Get point settings
     */
    public static function getSettings(): array
    {
        return [
            'point_per_rupiah' => (int) AppSetting::getVal('point_per_rupiah', 25000),
            'referral_reward_points' => (int) AppSetting::getVal('referral_reward_points', 20),
            'minimum_redeem_points' => (int) AppSetting::getVal('minimum_redeem_points', 10),
            'point_to_discount_ratio' => (int) AppSetting::getVal('point_to_discount_ratio', 1),
        ];
    }

    /**
     * Get user point balance
     */
    public static function getBalance(int $userId): int
    {
        $balance = UserPointsBalance::where('user_id', $userId)->first();
        return $balance ? $balance->balance : 0;
    }

    /**
     * Get point history for a user
     */
    public static function getHistory(int $userId, ?string $type = null, int $page = 1, int $perPage = 20)
    {
        $query = LoyaltyPoint::where('customer_id', $userId)
            ->orderBy('created_at', 'desc');

        if ($type) {
            $query->where('transaction_type', $type);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Earn points from an order or POS transaction
     */
    public static function earnPoints(int $userId, int $referenceId, string $type = 'order'): int
    {
        $reference = $type === 'order' 
            ? Order::findOrFail($referenceId) 
            : \App\Models\PosTransaction::findOrFail($referenceId);
            
        $settings = self::getSettings();

        // Calculate points: floor(total / point_per_rupiah)
        $points = (int) floor($reference->total / $settings['point_per_rupiah']);

        if ($points <= 0) {
            return 0;
        }

        DB::transaction(function () use ($userId, $referenceId, $reference, $points, $settings, $type) {
            // Create ledger entry
            LoyaltyPoint::create([
                'customer_id' => $userId,
                'merchant_id' => $reference->merchant_id,
                'points' => $points,
                'transaction_type' => 'earn',
                'reference_type' => $type === 'order' ? 'order' : 'pos_transaction',
                'reference_id' => $referenceId,
                'description' => "Earned {$points} points from " . ($type === 'order' ? "order #{$reference->order_number}" : "POS #{$reference->transaction_number}"),
                'created_at' => now(),
            ]);

            // Update balance
            $balance = UserPointsBalance::getOrCreateForUser($userId);
            $balance->addPoints($points);
        });

        return $points;
    }

    /**
     * Redeem points for an order or POS transaction (auto-calculate max redeem)
     */
    public static function redeemPoints(int $userId, int $referenceId, string $type = 'order'): array
    {
        return DB::transaction(function () use ($userId, $referenceId, $type) {
            $reference = $type === 'order' 
                ? Order::findOrFail($referenceId) 
                : \App\Models\PosTransaction::findOrFail($referenceId);
                
            $settings = self::getSettings();
            
            // 🔒 PESSIMISTIC LOCK: Mengunci baris saldo poin user agar tidak dibaca/ditulis request lain
            $balanceRecord = UserPointsBalance::where('user_id', $userId)
                ->lockForUpdate()
                ->first();
                
            $balance = $balanceRecord ? $balanceRecord->balance : 0;

            // Check minimum threshold
            if ($balance < $settings['minimum_redeem_points']) {
                return ['points_used' => 0, 'discount_amount' => 0];
            }

            // Calculate max redeem
            $maxRedeem = min($balance, floor($reference->total / $settings['point_to_discount_ratio']));
            $discountAmount = $maxRedeem * $settings['point_to_discount_ratio'];

            // Cap discount to total
            if ($discountAmount > $reference->total) {
                $maxRedeem = (int) ceil($reference->total / $settings['point_to_discount_ratio']);
                $discountAmount = $maxRedeem * $settings['point_to_discount_ratio'];
            }

            if ($maxRedeem <= 0) {
                return ['points_used' => 0, 'discount_amount' => 0];
            }

            // Update reference record
            $reference->discount = ($reference->discount ?? 0) + $discountAmount;
            $reference->total = max(0, $reference->total - $discountAmount);
            $reference->save();

            // Create ledger entry
            LoyaltyPoint::create([
                'customer_id' => $userId,
                'merchant_id' => $reference->merchant_id,
                'points' => -$maxRedeem, // Negative for redemption
                'transaction_type' => 'redeem',
                'reference_type' => $type === 'order' ? 'order' : 'pos_transaction',
                'reference_id' => $referenceId,
                'description' => "Redeemed {$maxRedeem} points for Rp" . number_format($discountAmount, 0, ',', '.') . " discount",
                'created_at' => now(),
            ]);

            // Update balance
            if ($balanceRecord) {
                $balanceRecord->deductPoints($maxRedeem);
            }

            return [
                'points_used' => $maxRedeem,
                'discount_amount' => $discountAmount,
            ];
        });
    }

    /**
     * Give referral bonus to referrer
     */
    public static function giveReferralBonus(int $referrerId, int $referralId): int
    {
        $settings = self::getSettings();
        $points = $settings['referral_reward_points'];

        $referral = Referral::findOrFail($referralId);
        $referrer = User::findOrFail($referrerId);

        DB::transaction(function () use ($referrerId, $referralId, $points, $referral) {
            // Create ledger entry
            LoyaltyPoint::create([
                'customer_id' => $referrerId,
                'merchant_id' => 1, // Default merchant
                'points' => $points,
                'transaction_type' => 'earn',
                'reference_type' => 'referral',
                'reference_id' => $referralId,
                'description' => "Referral bonus: {$points} points",
                'created_at' => now(),
            ]);

            // Update balance
            $balance = UserPointsBalance::getOrCreateForUser($referrerId);
            $balance->addPoints($points);
        });

        return $points;
    }

    /**
     * Manual adjust points (admin)
     */
    public static function manualAdjust(int $userId, int $points, string $reason): int
    {
        $user = User::findOrFail($userId);

        DB::transaction(function () use ($userId, $points, $reason) {
            // Create ledger entry
            LoyaltyPoint::create([
                'customer_id' => $userId,
                'merchant_id' => 1, // Default merchant
                'points' => $points,
                'transaction_type' => 'earn',
                'reference_type' => 'manual_adjustment',
                'reference_id' => null,
                'description' => "Manual adjustment: {$reason}",
                'created_at' => now(),
            ]);

            // Update balance
            $balance = UserPointsBalance::getOrCreateForUser($userId);
            if ($points >= 0) {
                $balance->addPoints($points);
            } else {
                $balance->deductPoints(abs($points));
            }
        });

        return self::getBalance($userId);
    }

    /**
     * Get user's referral code
     */
    public static function getReferralCode(int $userId): array
    {
        $user = User::findOrFail($userId);

        // Get or create referral code
        $referral = Referral::firstOrCreate(
            ['referrer_id' => $userId],
            ['referral_code' => Referral::generateUniqueCode()]
        );

        $totalReferrals = Referral::getTotalReferralsForUser($userId);

        return [
            'code' => $referral->referral_code,
            'total_referrals' => $totalReferrals,
        ];
    }

    /**
     * Apply referral code (during registration)
     */
    public static function applyReferralCode(int $userId, string $code): bool
    {
        // Find referral by code
        $referral = Referral::where('referral_code', $code)
            ->where('is_used', false)
            ->first();

        if (!$referral || $referral->referrer_id === $userId) {
            return false; // Invalid or self-referral
        }

        DB::transaction(function () use ($userId, $referral) {
            // Mark referral as used
            $referral->markAsUsed($userId);

            // Give bonus to referrer
            self::giveReferralBonus($referral->referrer_id, $referral->id);
        });

        return true;
    }
}
