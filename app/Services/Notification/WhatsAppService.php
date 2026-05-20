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
        // Global WA Notification Toggle Check
        $waEnabled = \App\Models\SystemSetting::getVal('wa_notifications_enabled', '1') === '1';
        if (!$waEnabled) {
            Log::info("WhatsApp Send Bypassed (WhatsApp Notifications are globally disabled in settings). Target: {$phone}");
            return true;
        }

        if (empty($this->token)) {
            Log::warning("WhatsApp message not sent: Fonnte token is empty.");
            return false;
        }

        $target = $this->formatPhoneNumber($phone);

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token
            ])->post('https://api.fonnte.com/send', [
                'target' => $target,
                'message' => $message,
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
     * Format WhatsApp OTP message.
     */
    public function sendOtp(string $phone, string $code): bool
    {
        $message = "🥥 *EWWON COCO* 🥥\n\n" .
                   "Halo! Kode OTP keamanan Anda adalah:\n\n" .
                   "👉 *{$code}* 👈\n\n" .
                   "Kode ini berlaku selama 5 menit. Harap rahasiakan kode ini dan jangan berikan kepada siapapun, termasuk pihak EWWON COCO.\n\n" .
                   "Terima kasih! 🙏";

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
