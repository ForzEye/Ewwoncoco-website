<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Branch extends Model
{
    protected $fillable = ['merchant_id', 'name', 'address', 'phone', 'lat', 'lng', 'is_active'];
    protected $casts = ['is_active' => 'boolean', 'lat' => 'decimal:8', 'lng' => 'decimal:8'];
    public function merchant(): BelongsTo { return $this->belongsTo(Merchant::class); }
}
