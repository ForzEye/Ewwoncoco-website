<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = [
        'merchant_id',
        'name',
        'unit',
    ];

    public function merchant()
    {
        return $this->belongsTo(Merchant::class);
    }

    public function branchStocks()
    {
        return $this->hasMany(BranchIngredient::class);
    }

    public function recipes()
    {
        return $this->hasMany(Recipe::class);
    }
}
