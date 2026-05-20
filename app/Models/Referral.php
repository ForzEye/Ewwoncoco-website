<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Referral extends Model
{
    protected $fillable = ['referrer_id', 'referee_id'];

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referee_id');
    }

    /**
     * Get total referrals count for a user
     */
    public static function getTotalReferralsForUser(int $userId): int
    {
        return self::where('referrer_id', $userId)->count();
    }
}
