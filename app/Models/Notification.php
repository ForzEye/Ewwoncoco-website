<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['user_id', 'title', 'body', 'type', 'data', 'read_at'];
    protected $casts = ['data' => 'array', 'read_at' => 'datetime'];
    
    public function user() { return $this->belongsTo(User::class); }

    protected static function booted()
    {
        static::created(function ($notification) {
            try {
                $user = $notification->user;
                if ($user && $user->fcm_token) {
                    $fcmData = [
                        'type' => $notification->type ?? 'info',
                    ];
                    
                    if (is_array($notification->data)) {
                        foreach ($notification->data as $key => $val) {
                            $fcmData[$key] = (string)$val;
                        }
                    }

                    // Dispatch job secara sinkronus agar langsung terkirim tanpa tergantung queue worker
                    \App\Jobs\SendFcmNotificationJob::dispatchSync(
                        $user->fcm_token,
                        $notification->title,
                        $notification->body,
                        $fcmData
                    );
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('FCM trigger on notification created failed: ' . $e->getMessage());
            }
        });
    }
}
