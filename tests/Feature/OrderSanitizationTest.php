<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderSanitizationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_sanitizes_exception_responses_and_includes_trace_id()
    {
        $user = User::factory()->create();

        $merchant = Merchant::create([
            'owner_id' => $user->id,
            'name' => 'EWWON COCO Test App',
            'slug' => 'ewwon-coco-test-app',
            'category' => 'F&B',
            'address' => 'Test App Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        $branch = Branch::create([
            'merchant_id' => $merchant->id,
            'name' => 'Cabang Test App',
            'address' => 'Test Cabang App Address',
            'phone' => '0215551234',
            'lat' => -6.2088,
            'lng' => 106.8456,
            'is_active' => true,
        ]);

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Es Kelapa Test',
            'slug' => 'es-kelapa-test',
            'price' => 15000,
            'barcode' => '899123456001',
            'stock' => 100,
            'is_available' => true,
        ]);

        // Force Order::create to throw a QueryException during insertion to simulate a DB/SQL exception
        Order::creating(function ($order) {
            throw new QueryException(
                'sqlite',
                'insert into "orders" ("customer_id", "merchant_id", "branch_id", "order_number", "subtotal", "total") values (?, ?, ?, ?, ?, ?)',
                [1, 1, 1, 'ORD-X', 15000.00, 15000.00],
                new \Exception('Simulated SQLSTATE[HY000]: General error: database is locked')
            );
        });

        $payload = [
            'branch_id' => $branch->id,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'unit_price' => 15000,
                ],
            ],
            'subtotal' => 15000.00,
            'delivery_fee' => 0,
            'discount' => 0,
            'total' => 15000.00,
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
