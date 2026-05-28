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
        'whatsapp_number', 'tiktok_handle',
        'bank_name', 'bank_account_number', 'bank_account_name',
        'receipt_font_size', 'receipt_paper_width', 'receipt_extra_bold', 'receipt_left_margin', 'receipt_font_weight',
    ];
    protected $casts = [
        'operational_hours' => 'array',
        'is_active' => 'boolean',
        'receipt_extra_bold' => 'boolean',
        'receipt_font_size' => 'integer',
        'receipt_left_margin' => 'integer',
        'receipt_font_weight' => 'integer'
    ];
    public function owner(): BelongsTo  { return $this->belongsTo(User::class, 'owner_id'); }
    public function branches(): HasMany { return $this->hasMany(Branch::class); }
    public function products(): HasMany { return $this->hasMany(Product::class); }
}
