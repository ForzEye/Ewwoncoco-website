<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosTransactionItem extends Model
{
    protected $fillable = ['transaction_id', 'product_id', 'quantity', 'unit_price', 'subtotal', 'customizations'];

    protected $casts = [
        'customizations' => 'array',
    ];

    public function transaction()
    {
        return $this->belongsTo(PosTransaction::class, 'transaction_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
