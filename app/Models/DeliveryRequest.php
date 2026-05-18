<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryRequest extends Model
{
    protected $fillable = [
        'order_id', 'provider', 'provider_order_id', 'status', 'delivery_fee',
        'driver_name', 'driver_phone', 'driver_photo',
        'driver_lat', 'driver_lng', 'estimated_arrival', 'requested_at', 'delivered_at',
    ];
    protected $casts = [
        'estimated_arrival' => 'datetime',
        'requested_at'      => 'datetime',
        'delivered_at'      => 'datetime',
    ];
    public function order() { return $this->belongsTo(Order::class); }
}
