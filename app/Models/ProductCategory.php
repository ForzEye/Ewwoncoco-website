<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductCategory extends Model
{
    protected $fillable = ['merchant_id', 'name', 'icon', 'order'];
    public function merchant() { return $this->belongsTo(Merchant::class); }
    public function products() { return $this->hasMany(Product::class, 'category_id'); }
}
