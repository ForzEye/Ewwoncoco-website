<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'merchant_id', 'branch_id', 'category_id', 'name', 'slug', 'description',
        'price', 'price_options', 'image_url', 'barcode', 'stock', 'min_stock', 'is_available',
    ];

    protected $casts = [
        'price' => 'decimal:2', 
        'price_options' => 'array', 
        'is_available' => 'boolean'
    ];

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

    public function customizations()
    {
        return $this->belongsToMany(Customization::class, 'product_customizations')
            ->orderBy('order', 'asc')
            ->orderBy('id', 'asc');
    }

    /**
     * Calculate dynamic stock of this product at a specific branch based on recipes and branch ingredient stocks.
     */
    public function calculateDynamicStock($branchId)
    {
        if (!$branchId) {
            return (float) $this->stock;
        }

        // If the product has no recipes (BOM), return the static stock column
        if ($this->recipes->isEmpty()) {
            return (float) $this->stock;
        }

        $maxPossible = null;

        foreach ($this->recipes as $recipe) {
            if (!$recipe->ingredient) {
                continue;
            }

            // Find the branch stock for this ingredient
            $branchStock = $recipe->ingredient->branchStocks
                ->where('branch_id', $branchId)
                ->first();

            $available = $branchStock ? (float) $branchStock->stock : 0;
            $needed = (float) $recipe->quantity;

            if ($needed <= 0) {
                continue;
            }

            $possible = floor($available / $needed);

            if ($maxPossible === null || $possible < $maxPossible) {
                $maxPossible = $possible;
            }
        }

        return $maxPossible !== null ? (int) $maxPossible : 0;
    }

    /**
     * Calculate dynamic stock of this product across all active branches of the merchant.
     */
    public function getGlobalDynamicStock()
    {
        $branches = \App\Models\Branch::where('merchant_id', $this->merchant_id)
            ->where('is_active', true)
            ->get();

        if ($branches->isEmpty()) {
            return (float) $this->stock;
        }

        $totalStock = 0;
        foreach ($branches as $branch) {
            $totalStock += $this->calculateDynamicStock($branch->id);
        }

        return $totalStock;
    }
}
