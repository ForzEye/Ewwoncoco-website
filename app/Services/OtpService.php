<?php

namespace App\Services;

use App\Models\OtpCode;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Log;

class OtpService
{
    /**
     * Generate and send OTP code.
     */
    public function sendOtp(string $identifier, string $type = 'register', string $channel = 'email'): bool
    {
        // 1. Generate 6 digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // 2. Deactivate previous codes for this identifier/type
        OtpCode::where('identifier', $identifier)
            ->where('type', $type)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        // 3. Save new code
        $otp = OtpCode::create([
            'identifier' => $identifier,
            'code'       => $code,
            'type'       => $type,
            'channel'    => $channel,
            'expires_at' => Carbon::now()->addMinutes(5),
            'is_used'    => false,
            'status'     => 'pending',
        ]);

        // 4. Send via channel
        try {
            $success = false;
            if ($channel === 'email') {
                $success = $this->sendViaEmail($identifier, $code);
            } elseif ($channel === 'whatsapp') {
                $success = $this->sendViaWhatsapp($identifier, $code);
            }

            if ($success) {
                $otp->update(['status' => 'sent']);
                return true;
            } else {
                $otp->update(['status' => 'failed', 'error_message' => 'Provider rejection or unknown error.']);
                return false;
            }
        } catch (\Exception $e) {
            $otp->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Verify OTP code.
     */
    public function verifyOtp(string $identifier, string $code, string $type = 'register'): bool
    {
        $otp = OtpCode::where('identifier', $identifier)
            ->where('code', $code)
            ->where('type', $type)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if ($otp) {
            $otp->update(['is_used' => true]);
            return true;
        }

        return false;
    }

    private function sendViaEmail(string $email, string $code): bool
    {
        try {
            Mail::to($email)->send(new OtpMail($code));
            return true;
        } catch (\Exception $e) {
            Log::error('OTP Email Error: ' . $e->getMessage());
            return false;
        }
    }

    private function sendViaWhatsapp(string $phone, string $code): bool
    {
        // Placeholder for Fonnte integration
        Log::info("WA OTP Sent to $phone: $code (Fonnte Integration Pending)");
        
        // Example structure for later:
        /*
        $token = config('services.fonnte.token');
        $response = Http::withHeaders(['Authorization' => $token])->post('https://api.fonnte.com/send', [
            'target' => $phone,
            'message' => "Kode OTP Ewwon Coco Anda adalah: $code. Rahasiakan kode ini dari siapapun.",
        ]);
        return $response->successful();
        */
        
        return true; 
    }
}
