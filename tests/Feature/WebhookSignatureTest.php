<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class WebhookSignatureTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Route::post('/test-webhook/gosend', function () {
            return response()->json(['success' => true]);
        })->middleware('verify.webhook:gosend');

        Route::post('/test-webhook/grabexpress', function () {
            return response()->json(['success' => true]);
        })->middleware('verify.webhook:grabexpress');
    }

    /** @test */
    public function it_verifies_gosend_webhook_signature()
    {
        $this->withoutExceptionHandling();
        $payload = json_encode(['data' => 'test']);
        $secret = config('services.gosend.webhook_secret');
        $signature = hash_hmac('sha256', $payload, $secret);

        $response = $this->postJson('/test-webhook/gosend', ['data' => 'test'], [
            'X-Webhook-Signature' => $signature,
        ]);

        $response->assertStatus(200);
    }

    /** @test */
    public function it_rejects_invalid_gosend_webhook_signature()
    {
        $response = $this->postJson('/test-webhook/gosend', ['data' => 'test'], [
            'X-Webhook-Signature' => 'invalid_signature',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function it_verifies_grab_webhook_signature()
    {
        $payload = json_encode(['data' => 'test_grab']);
        $secret = config('services.grab.webhook_secret');
        $signature = hash_hmac('sha256', $payload, $secret);

        $response = $this->postJson('/test-webhook/grabexpress', ['data' => 'test_grab'], [
            'X-Webhook-Signature' => $signature,
        ]);

        $response->assertStatus(200);
    }
}
