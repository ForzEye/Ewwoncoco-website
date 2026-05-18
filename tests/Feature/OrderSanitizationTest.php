<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderSanitizationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_sanitizes_exception_responses_and_includes_trace_id()
    {
        $user = User::factory()->create();

        $merchant = \App\Models\Merchant::create([
            'owner_id' => $user->id,
            'name' => 'EWWON COCO Test App',
            'slug' => 'ewwon-coco-test-app',
            'category' => 'F&B',
            'address' => 'Test App Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        $branch = \App\Models\Branch::create([
            'merchant_id' => $merchant->id,
            'name' => 'Cabang Test App',
            'address' => 'Test Cabang App Address',
            'phone' => '0215551234',
            'lat' => -6.2088,
            'lng' => 106.8456,
            'is_active' => true,
        ]);

        $product = \App\Models\Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Es Kelapa Test',
            'slug' => 'es-kelapa-test',
            'price' => 15000,
            'barcode' => '899123456001',
            'stock' => 100,
            'is_available' => true,
        ]);

        // Force DB::beginTransaction to throw error or make Order::create crash by passing invalid values that pass request validation
        // Subtotal is numeric, we pass large or formatted string that triggers DB query error during insertion but passes request validate.
        // E.g. set subtotal to 10000000000000000000000000000.00 (triggers Decimal/Float range overflow on DB insertion)
        $payload = [
            'branch_id' => $branch->id,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'unit_price' => 15000,
                ]
            ],
            'subtotal' => 100000000000000000000.00, // DB schema subtotal overflow
            'delivery_fee' => 0,
            'discount' => 0,
            'total' => 100000000000000000000.00,
            'payment_method' => 'qris',
            'delivery_type' => 'pickup',
        ];

        // Using sanctum guard because Mobile App Protected Api uses 'auth:sanctum'
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/orders', $payload);

        $response->assertStatus(500);
        $response->assertJsonStructure(['success', 'message', 'trace_id']);
        $this->assertFalse($response->json('success'));
        $this->assertStringNotContainsString('SQLState', $response->json('message'));
        $this->assertStringNotContainsString('Exception', $response->json('message'));
    }
}
