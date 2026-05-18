<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{
    protected $fillable = ['customer_id', 'merchant_id', 'last_message_at'];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function merchant()
    {
        return $this->belongsTo(Merchant::class);
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class);
    }
}

// Separate file for ChatMessage or same file? I'll put it in separate for clarity later if needed, 
// but for now I'll write another file call.
