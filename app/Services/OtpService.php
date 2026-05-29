<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\Notification\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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
            'code' => $code,
            'type' => $type,
            'channel' => $channel,
            // expires_at: force UTC so the stored value is consistent with
            // Eloquent's automatic created_at/updated_at (which are always UTC).
            'expires_at' => Carbon::now('UTC')->addMinutes(5),
            'is_used' => false,
            'status' => 'pending',
        ]);

        // 4. Send via channel
        try {
            // --- Per-channel OTP toggles ---
            // otp_enabled       = WhatsApp OTP on/off
            // otp_email_enabled = Email OTP on/off (also acts as master switch)
            $globalOtpEnabled = SystemSetting::getVal('otp_enabled', '1') === '1';
            $waOtpEnabled = $globalOtpEnabled;
            $emailOtpEnabled = $globalOtpEnabled && (SystemSetting::getVal('otp_email_enabled', '1') === '1');

            $channelBypassed = ($channel === 'whatsapp' && ! $waOtpEnabled)
                            || ($channel === 'email' && ! $emailOtpEnabled);

            if ($channelBypassed) {
                Log::info("OTP BYPASSED ({$channel} OTP disabled in settings). Code for {$identifier}: {$code}");
                $otp->update(['status' => 'sent']);

                return true;
            }

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
        // --- Per-channel OTP toggles ---
        $globalOtpEnabled = SystemSetting::getVal('otp_enabled', '1') === '1';
        $waOtpEnabled = $globalOtpEnabled;
        $emailOtpEnabled = $globalOtpEnabled && (SystemSetting::getVal('otp_email_enabled', '1') === '1');

        // If BOTH channels are disabled, auto-approve (no OTP required at all)
        if (! $waOtpEnabled && ! $emailOtpEnabled) {
            Log::info("OTP Auto-Approved for {$identifier} (all OTP channels disabled).");

            return true;
        }

        // Find the active OTP record (not yet used, not expired)
        $otp = OtpCode::where('identifier', $identifier)
            ->where('type', $type)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now('UTC'))
            ->latest()
            ->first();

        // If the OTP record's own channel is currently disabled → auto-approve.
        // This handles the case where WA is off but email is on: a WA-channel OTP
        // is auto-approved so the user isn't blocked.
        if ($otp) {
            if ($otp->channel === 'whatsapp' && ! $waOtpEnabled) {
                Log::info("OTP Auto-Approved for {$identifier} (WA OTP channel disabled).");
                $otp->update(['is_used' => true]);

                return true;
            }
            if ($otp->channel === 'email' && ! $emailOtpEnabled) {
                Log::info("OTP Auto-Approved for {$identifier} (Email OTP channel disabled).");
                $otp->update(['is_used' => true]);

                return true;
            }
        }

        if (! $otp) {
            return false;
        }

        if ($otp->code === $code) {
            $otp->update(['is_used' => true]);

            return true;
        }

        $otp->increment('failed_attempts');

        if ($otp->failed_attempts >= 5) {
            $otp->update(['is_used' => true]);
        }

        return false;
    }

    private function sendViaEmail(string $email, string $code): bool
    {
        try {
            Mail::to($email)->send(new OtpMail($code));

            return true;
        } catch (\Exception $e) {
            Log::error('OTP Email Error: '.$e->getMessage());

            return false;
        }
    }

    private function sendViaWhatsapp(string $phone, string $code): bool
    {
        $waService = app(WhatsAppService::class);

        return $waService->sendOtp($phone, $code);
    }
}
