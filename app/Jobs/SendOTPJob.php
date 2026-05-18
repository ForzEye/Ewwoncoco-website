<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendOTPJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public readonly User $user,
        public readonly string $code,
    ) {}

    public function handle(): void
    {
        // Kirim email OTP
        Mail::to($this->user->email)->send(new \App\Mail\OTPMail($this->code));

        // Tetap log untuk kemudahan di local environment
        \Illuminate\Support\Facades\Log::info("OTP for {$this->user->email}: {$this->code}");
    }
}
