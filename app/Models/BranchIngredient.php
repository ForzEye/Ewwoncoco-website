<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchIngredient extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'ingredient_id',
        'stock',
        'min_stock',
        'average_cost',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
}
