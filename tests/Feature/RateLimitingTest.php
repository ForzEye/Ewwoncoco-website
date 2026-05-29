<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_throttles_sensitive_endpoints()
    {
        $user = User::factory()->create();

        // 1. Test Order Throttler (limit = 5 orders in 10 minutes)
        // We will mock request sending 6 times to check throttle response
        for ($i = 0; $i < 6; $i++) {
            $response = $this->actingAs($user, 'sanctum')
                ->postJson('/api/v1/orders', [
                    'branch_id' => 9991, // Invalid, triggers early parsing or throttling
                ]);

            if ($i >= 5) {
                // Must get 429 Too Many Requests
                $response->assertStatus(429);
            }
        }
    }

    /** @test */
    public function it_throttles_voucher_validation_endpoint()
    {
        $user = User::factory()->create();

        // 2. Test Voucher Throttler (limit = 10 vouchers in 1 minute)
        for ($i = 0; $i < 11; $i++) {
            $response = $this->actingAs($user, 'sanctum')
                ->postJson('/api/v1/vouchers/validate', [
                    'voucher_code' => 'DISCOUNT'.$i,
                ]);

            if ($i >= 10) {
                $response->assertStatus(429);
            }
        }
    }
}
