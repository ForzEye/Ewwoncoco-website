<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPointsBalance extends Model
{
    protected $fillable = ['user_id', 'balance'];

    protected $table = 'user_points_balance';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create balance record for a user
     */
    public static function getOrCreateForUser(int $userId): self
    {
        return self::firstOrCreate(
            ['user_id' => $userId],
            ['balance' => 0]
        );
    }

    /**
     * Add points to balance
     */
    public function addPoints(int $amount): int
    {
        return \DB::transaction(function () use ($amount) {
            $record = self::where('id', $this->id)->lockForUpdate()->first();
            if ($record) {
                $record->balance += $amount;
                $record->save();
                $this->balance = $record->balance;
            }
            return $this->balance;
        });
    }

    /**
     * Deduct points from balance
     */
    public function deductPoints(int $amount): int
    {
        return \DB::transaction(function () use ($amount) {
            $record = self::where('id', $this->id)->lockForUpdate()->first();
            if ($record) {
                $record->balance = max(0, $record->balance - $amount);
                $record->save();
                $this->balance = $record->balance;
            }
            return $this->balance;
        });
    }
}
