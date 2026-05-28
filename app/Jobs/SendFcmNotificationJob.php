<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\Notification\FCMService;

class SendFcmNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Batasi pengulangan jika gagal (maksimal 3 kali percobaan)
    public int $tries = 3;
    
    // Waktu tunggu maksimum eksekusi job ini adalah 30 detik
    public int $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly string $token,
        public readonly string $title,
        public readonly string $body,
        public readonly array $data = []
    ) {}

    /**
     * Execute the job.
     */
    public function handle(FCMService $fcmService): void
    {
        $fcmService->sendToToken(
            $this->token,
            $this->title,
            $this->body,
            $this->data
        );
    }
}
