<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'merchant_id', 'name', 'description', 'code', 'discount_type', 'discount_value',
        'min_purchase', 'max_discount', 'usage_limit', 'used_count', 
        'expires_at', 'is_active', 'is_online_only', 'limit_per_user',
        'points_cost', 'user_id'
    ];

    protected $casts = [
        'expires_at' => 'datetime', 
        'is_active' => 'boolean',
        'is_online_only' => 'boolean',
        'discount_value' => 'decimal:2',
        'min_purchase' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'limit_per_user' => 'integer',
        'points_cost' => 'integer',
        'user_id' => 'integer',
    ];

    public function merchant() { return $this->belongsTo(Merchant::class); }
}
