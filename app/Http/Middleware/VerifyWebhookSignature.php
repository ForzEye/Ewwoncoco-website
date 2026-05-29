<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $provider): Response
    {
        $signature = $request->header('X-Webhook-Signature');
        $payload = $request->getContent();

        $secret = match ($provider) {
            'gosend' => config('services.gosend.webhook_secret'),
            'grab', 'grabexpress' => config('services.grab.webhook_secret'),
            'midtrans' => config('services.midtrans.server_key'),
            default => null
        };

        if (! $secret && ! app()->environment('local')) {
            return response()->json(['message' => 'Webhook secret not configured'], 500);
        }

        // For local development, we might skip signature check if no secret is set
        if (app()->environment('local') && ! $secret) {
            return $next($request);
        }

        // Midtrans verification signature key using SHA-512
        if ($provider === 'midtrans') {
            $orderId = $request->input('order_id');
            $statusCode = $request->input('status_code');
            $grossAmount = $request->input('gross_amount');
            $midtransSignature = $request->input('signature_key');

            if (! $midtransSignature || ! $orderId || ! $statusCode || ! $grossAmount) {
                return response()->json(['message' => 'Missing Midtrans details'], 400);
            }

            // midtrans signature key = SHA512(order_id + status_code + gross_amount + server_key)
            $inputStr = $orderId.$statusCode.$grossAmount.$secret;
            $expectedSignature = hash('sha512', $inputStr);

            if (! hash_equals($expectedSignature, $midtransSignature)) {
                return response()->json(['message' => 'Invalid Midtrans signature'], 403);
            }
        } else {
            // Generic HMAC-SHA256 for other providers
            $expectedSignature = hash_hmac('sha256', $payload, $secret);

            if (! hash_equals($expectedSignature, $signature ?? '')) {
                return response()->json(['message' => 'Invalid webhook signature'], 403);
            }
        }

        return $next($request);
    }
}
