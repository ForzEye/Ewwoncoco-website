<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Merchant extends Model
{
    protected $fillable = [
        'owner_id', 'name', 'slug', 'category', 'address', 'phone',
        'operational_hours', 'qris_image_url', 'is_active',
        'receipt_header', 'receipt_footer', 'instagram_handle', 
        'whatsapp_number', 'tiktok_handle'
    ];
    protected $casts = ['operational_hours' => 'array', 'is_active' => 'boolean'];
    public function owner(): BelongsTo  { return $this->belongsTo(User::class, 'owner_id'); }
    public function branches(): HasMany { return $this->hasMany(Branch::class); }
    public function products(): HasMany { return $this->hasMany(Product::class); }
}
