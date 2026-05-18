<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyPoint extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'customer_id', 'merchant_id', 'points', 'transaction_type',
        'reference_type', 'reference_id', 'description', 'created_at',
    ];
    public function customer() { return $this->belongsTo(User::class, 'customer_id'); }
    public function merchant() { return $this->belongsTo(Merchant::class); }
}
