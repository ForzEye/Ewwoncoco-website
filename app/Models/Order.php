<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'customer_id', 'merchant_id', 'branch_id', 'order_number', 'delivery_type',
        'status', 'payment_method', 'payment_status',
        'subtotal', 'delivery_fee', 'discount', 'total',
        'delivery_address', 'delivery_lat', 'delivery_lng', 'notes',
        'payment_proof_url', 'rejection_reason',
        'cashier_id', 'shift_id',
    ];

    public function customer(): BelongsTo { return $this->belongsTo(User::class, 'customer_id'); }
    public function merchant(): BelongsTo { return $this->belongsTo(Merchant::class); }
    public function branch(): BelongsTo   { return $this->belongsTo(Branch::class); }
    public function cashier(): BelongsTo  { return $this->belongsTo(User::class, 'cashier_id'); }
    public function shift(): BelongsTo    { return $this->belongsTo(PosShift::class); }
    public function items(): HasMany      { return $this->hasMany(OrderItem::class); }
    public function deliveryRequest()     { return $this->hasOne(DeliveryRequest::class); }
    public function review()              { return $this->hasOne(Review::class); }
}
