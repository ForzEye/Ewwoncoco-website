<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomizationOption extends Model
{
    protected $table = 'customization_options';

    protected $fillable = ['customization_id', 'name', 'price', 'is_active'];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function customization()
    {
        return $this->belongsTo(Customization::class);
    }
}
