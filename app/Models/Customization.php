<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customization extends Model
{
    protected $fillable = ['merchant_id', 'name', 'type', 'is_required', 'is_active', 'order'];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function options()
    {
        return $this->hasMany(CustomizationOption::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_customizations');
    }
}
