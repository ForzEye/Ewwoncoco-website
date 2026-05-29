<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $fillable = ['merchant_id', 'name', 'address', 'phone', 'lat', 'lng', 'is_active'];

    protected $casts = ['is_active' => 'boolean', 'lat' => 'decimal:8', 'lng' => 'decimal:8'];

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function posTransactions(): HasMany
    {
        return $this->hasMany(PosTransaction::class);
    }

    public function posShifts(): HasMany
    {
        return $this->hasMany(PosShift::class);
    }
}
