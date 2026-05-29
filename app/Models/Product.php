<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    protected $fillable = [
        'merchant_id', 'branch_id', 'category_id', 'name', 'slug', 'description',
        'price', 'image_url', 'barcode', 'stock', 'min_stock', 'is_available',
    ];

    protected $casts = ['price' => 'decimal:2', 'is_available' => 'boolean'];

    protected $appends = [];

    public function getImageUrlAttribute($value)
    {
        if (! $value) {
            return null;
        }
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        if (config('filesystems.default') === 's3') {
            return Storage::disk('s3')->url($value);
        }

        return asset('storage/'.$value);
    }

    public function merchant()
    {
        return $this->belongsTo(Merchant::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function recipes()
    {
        return $this->hasMany(Recipe::class);
    }
}
