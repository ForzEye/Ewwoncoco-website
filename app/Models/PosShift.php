<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosShift extends Model
{
    protected $fillable = [
        'cashier_id', 'branch_id', 'opened_at', 'closed_at', 
        'opening_cash', 'closing_cash', 'closing_qris', 'closing_online', 
        'closing_grab', 'closing_gojek', 'closing_shopeefood',
        'is_locked', 'void_count', 'notes'
    ];

    protected $casts = ['opened_at' => 'datetime', 'closed_at' => 'datetime'];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
