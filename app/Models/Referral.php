<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Referral extends Model
{
    protected $fillable = ['referrer_id', 'referee_id', 'referral_code', 'is_used'];

    protected static function booted()
    {
        static::creating(function (Referral $referral) {
            if (empty($referral->referral_code)) {
                $referral->referral_code = self::generateUniqueCode();
            }
        });
    }

    /**
     * Generate a unique 6-character referral code
     */
    public static function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (self::where('referral_code', $code)->exists());

        return $code;
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referee_id');
    }

    /**
     * Mark referral as used with referee
     */
    public function markAsUsed(int $refereeId): self
    {
        $this->referee_id = $refereeId;
        $this->is_used = true;
        $this->save();
        return $this;
    }

    /**
     * Get total referrals count for a user
     */
    public static function getTotalReferralsForUser(int $userId): int
    {
        return self::where('referrer_id', $userId)->where('is_used', true)->count();
    }
}
