<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = [
        'merchant_id', 'name', 'description', 'type', 'value',
        'min_purchase', 'max_reward', 'start_date', 'end_date', 'is_active',
        'buy_product_id', 'get_product_id', 'buy_quantity', 'get_quantity', 'applicable_on',
        'is_new_member_only', 'max_free_qty', 'upgrade_from_option_id', 'upgrade_to_option_id',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'value' => 'decimal:2',
        'min_purchase' => 'decimal:2',
        'max_reward' => 'decimal:2',
        'buy_quantity' => 'integer',
        'get_quantity' => 'integer',
        'is_new_member_only' => 'boolean',
        'max_free_qty' => 'integer',
    ];

    public function merchant()
    {
        return $this->belongsTo(Merchant::class);
    }

    public function buyProduct()
    {
        return $this->belongsTo(Product::class, 'buy_product_id')->withTrashed();
    }

    public function getProduct()
    {
        return $this->belongsTo(Product::class, 'get_product_id')->withTrashed();
    }

    public function upgradeFromOption()
    {
        return $this->belongsTo(CustomizationOption::class, 'upgrade_from_option_id');
    }

    public function upgradeToOption()
    {
        return $this->belongsTo(CustomizationOption::class, 'upgrade_to_option_id');
    }

    /**
     * Scope active promotions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now());
    }
}
