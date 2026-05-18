<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosTransaction extends Model
{
    protected $fillable = [
        'merchant_id', 'branch_id', 'cashier_id', 'customer_id', 'shift_id',
        'transaction_number', 'payment_method', 'total', 'discount',
        'cash_received', 'change_amount', 'transaction_at',
    ];
    protected $casts = ['transaction_at' => 'datetime'];
    public function cashier() { return $this->belongsTo(User::class, 'cashier_id'); }
    public function items()   { return $this->hasMany(PosTransactionItem::class, 'transaction_id'); }
    public function shift()   { return $this->belongsTo(PosShift::class); }
    public function merchant(){ return $this->belongsTo(Merchant::class); }
    public function branch()  { return $this->belongsTo(Branch::class); }
}
