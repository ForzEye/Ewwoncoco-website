<?php

namespace App\Services\Notification;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $token;

    public function __construct()
    {
        $this->token = config('services.fonnte.token') ?? env('FONNTE_TOKEN');
    }

    /**
     * Send message using Fonnte API.
     */
    public function sendMessage(string $phone, string $message): bool
    {
        // Bypass sending in testing environment to prevent real external API calls
        if (app()->environment('testing')) {
            Log::info("WhatsApp message send simulated for testing: Target: {$phone}");
            return true;
        }

        if (empty($this->token)) {
            Log::warning("WhatsApp message not sent: Fonnte token is empty.");
            return false;
        }

        $target = $this->formatPhoneNumber($phone);

        // 1. Simulasikan jeda alami manusia (Random Human Delay) antara 1.5 s/d 3 detik
        // Agar pengiriman tidak seketika/instan seperti bot mesin otomatis yang kaku.
        usleep(random_int(1500000, 3000000));

        try {
            // 2. Kirim API ke Fonnte dengan parameter simulasi "Sedang Mengetik" (typing indicator)
            $response = Http::withHeaders([
                'Authorization' => $this->token
            ])->post('https://api.fonnte.com/send', [
                'target' => $target,
                'message' => $message,
                'typing' => true,      // Mengaktifkan status "Sedang mengetik..." di WhatsApp penerima
                'delay'  => '2',       // Menambahkan jeda pengiriman dari server Fonnte
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp message successfully sent to $target.");
                return true;
            } else {
                Log::error("Fonnte API Error: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Failed to send WhatsApp message to $target: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Format WhatsApp OTP message with randomized humanized variations
     * to prevent carrier/WhatsApp spam detection filters.
     */
    public function sendOtp(string $phone, string $code): bool
    {
        // 1. Time-aware Greeting
        $hour = (int) date('G');
        if ($hour >= 4 && $hour < 11) {
            $timeGreeting = "Selamat pagi";
        } elseif ($hour >= 11 && $hour < 15) {
            $timeGreeting = "Selamat siang";
        } elseif ($hour >= 15 && $hour < 18) {
            $timeGreeting = "Selamat sore";
        } else {
            $timeGreeting = "Selamat malam";
        }

        $greetings = [
            "Halo Kak, {$timeGreeting}! 😊",
            "Hai Kak, {$timeGreeting}! 👋",
            "{$timeGreeting} Kak! Semoga sehat selalu ya. 🥥",
            "Halo Pelanggan Setia Ewwon Coco, {$timeGreeting}! 🌴",
        ];
        $greeting = $greetings[array_rand($greetings)];

        // 2. Humanized Intros
        $intros = [
            "Untuk melanjutkan verifikasi di aplikasi Ewwon Coco, berikut adalah kode OTP keamanan Kakak:",
            "Ini adalah kode OTP verifikasi keamanan untuk masuk ke akun Ewwon Coco Anda:",
            "Gunakan kode verifikasi berikut untuk mengakses akun Ewwon Coco Kakak ya:",
            "Berikut adalah kode keamanan OTP Anda untuk aplikasi Ewwon Coco:",
        ];
        $intro = $intros[array_rand($intros)];

        // 3. Security Warning
        $warnings = [
            "Demi keamanan, mohon jangan berikan kode ini kepada siapapun (termasuk staf EWWON COCO). Kode ini hanya aktif selama 5 menit.",
            "Harap jaga kerahasiaan kode ini ya Kak. Pihak Ewwon Coco tidak pernah meminta kode OTP Anda. Kode akan kedaluwarsa dalam 5 menit.",
            "Jangan bagikan kode verifikasi ini demi keamanan akun Kakak. Kode ini bersifat rahasia dan hanya berlaku selama 5 menit saja.",
        ];
        $warning = $warnings[array_rand($warnings)];

        // 4. Randomized Closings
        $closings = [
            "Terima kasih banyak dan semoga hari Kakak menyenangkan! ✨🙏",
            "Salam hangat dan sehat selalu dari seluruh tim Ewwon Coco! 🌴🥥",
            "Terima kasih ya Kak, selamat menikmati kesegaran kelapa asli kami! 🥥💚",
            "Terima kasih atas kepercayaannya bersama Ewwon Coco! 😊",
        ];
        $closing = $closings[array_rand($closings)];

        // 5. Unique Cryptographic Reference/Fingerprint
        // This ensures NO two messages sent are ever byte-identical, preventing structural spam detection!
        $uniqueId = strtoupper(bin2hex(random_bytes(3)));

        // Construct message
        $message = "🥥 *EWWON COCO* 🥥\n\n" .
                   "{$greeting}\n\n" .
                   "{$intro}\n\n" .
                   "👉 *{$code}* 👈\n\n" .
                   "{$warning}\n\n" .
                   "{$closing}\n\n" .
                   "_Ref ID: EW-{$uniqueId}_";

        return $this->sendMessage($phone, $message);
    }

    /**
     * Send purchase receipt for Online Order.
     */
    public function sendOnlineReceipt($order): bool
    {
        if (!$order) return false;

        $phone = $order->customer?->phone;
        if (empty($phone)) {
            Log::info("Online receipt WA not sent: customer has no phone number.");
            return false;
        }

        // Global WA Notification Toggle Check (Specific for Receipts)
        $waEnabled = \App\Models\SystemSetting::getVal('wa_notifications_enabled', '1') === '1';
        if (!$waEnabled) {
            Log::info("WhatsApp Receipt Bypassed (WhatsApp Notifications are globally disabled in settings). Target: {$phone}");
            return true;
        }

        $itemsText = "";
        $order->loadMissing('items.product', 'branch');
        
        foreach ($order->items as $item) {
            $itemsText .= "• {$item->product->name} (x{$item->quantity}) - Rp " . number_format($item->subtotal, 0, ',', '.') . "\n";
        }

        $paymentMethod = $order->payment_method === 'qris' ? 'QRIS' : 'Transfer Manual';
        $deliveryType = $order->delivery_type === 'pickup' ? 'Ambil di Toko' : 'Kirim / Delivery';
        
        $message = "🥥 *EWWON COCO - STRUK ONLINE* 🥥\n\n" .
                   "Terima kasih atas pesanan Anda! Berikut ringkasan transaksi belanja online Anda:\n\n" .
                   "*No. Pesanan:* {$order->order_number}\n" .
                   "*Tanggal:* " . $order->created_at->format('d-m-Y H:i') . " WIB\n" .
                   "*Cabang:* " . ($order->branch->name ?? 'Pusat') . "\n" .
                   "*Tipe:* {$deliveryType}\n" .
                   "*Pembayaran:* {$paymentMethod}\n" .
                   "*Status:* " . strtoupper($order->status) . "\n\n" .
                   "*Daftar Belanja:*\n" . trim($itemsText) . "\n\n" .
                   "*Subtotal:* Rp " . number_format($order->subtotal, 0, ',', '.') . "\n" .
                   "*Ongkos Kirim:* Rp " . number_format($order->delivery_fee, 0, ',', '.') . "\n" .
                   "*Total Pembayaran:* *Rp " . number_format($order->total, 0, ',', '.') . "*\n\n" .
                   "Pesanan Anda sedang kami proses. Nikmati kesegaran kelapa asli dari Ewwon Coco! 🌴✨";

        return $this->sendMessage($phone, $message);
    }

    /**
     * Send purchase receipt for POS Transaction (Offline).
     */
    public function sendOfflineReceipt($transaction): bool
    {
        if (!$transaction) return false;

        // Find customer phone number
        $phone = $transaction->customer?->phone;
        if (empty($phone)) {
            Log::info("POS receipt WA not sent: transaction has no customer tied or customer has no phone number.");
            return false;
        }

        // Global WA Notification Toggle Check (Specific for Receipts)
        $waEnabled = \App\Models\SystemSetting::getVal('wa_notifications_enabled', '1') === '1';
        if (!$waEnabled) {
            Log::info("WhatsApp Receipt Bypassed (WhatsApp Notifications are globally disabled in settings). Target: {$phone}");
            return true;
        }

        $itemsText = "";
        $transaction->loadMissing(['items.product', 'branch', 'cashier']);

        foreach ($transaction->items as $item) {
            $itemsText .= "• {$item->product->name} (x{$item->quantity}) - Rp " . number_format($item->subtotal, 0, ',', '.') . "\n";
        }

        $paymentMethod = $transaction->payment_method === 'qris' ? 'QRIS' : 'Tunai / Cash';

        $message = "🥥 *EWWON COCO - STRUK OUTLET* 🥥\n\n" .
                   "Terima kasih telah berkunjung dan berbelanja di outlet kami! Berikut ringkasan transaksi Anda:\n\n" .
                   "*No. Transaksi:* {$transaction->transaction_number}\n" .
                   "*Tanggal:* " . $transaction->transaction_at->format('d-m-Y H:i') . " WIB\n" .
                   "*Cabang:* " . ($transaction->branch->name ?? 'Outlet') . "\n" .
                   "*Kasir:* " . ($transaction->cashier->name ?? '-') . "\n" .
                   "*Pembayaran:* {$paymentMethod}\n\n" .
                   "*Daftar Belanja:*\n" . trim($itemsText) . "\n\n" .
                   "*Total:* *Rp " . number_format($transaction->total, 0, ',', '.') . "*\n" .
                   "*Tunai/Bayar:* Rp " . number_format($transaction->cash_received, 0, ',', '.') . "\n" .
                   "*Kembali:* Rp " . number_format($transaction->change_amount, 0, ',', '.') . "\n\n" .
                   "Terima kasih atas kunjungan Anda, kami tunggu kedatangan Anda kembali! 🌴🙏";

        return $this->sendMessage($phone, $message);
    }

    /**
     * Format to international standard (628...) without leading '+' or '0'.
     */
    private function formatPhoneNumber(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone);
        
        if (str_starts_with($cleaned, '0')) {
            $cleaned = '62' . substr($cleaned, 1);
        }
        
        return $cleaned;
    }
}
