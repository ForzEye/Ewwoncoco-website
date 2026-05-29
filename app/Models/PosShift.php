<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosShift extends Model
{
    protected $fillable = ['cashier_id', 'branch_id', 'opened_at', 'closed_at', 'opening_cash', 'closing_cash', 'notes'];

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
