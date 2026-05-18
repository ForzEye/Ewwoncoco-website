<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $table = 'user_addresses';
    protected $fillable = [
        'user_id', 'label', 'address', 'receiver_name', 
        'receiver_phone', 'latitude', 'longitude', 'is_default'
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'latitude' => 'double',
        'longitude' => 'double',
    ];
}
