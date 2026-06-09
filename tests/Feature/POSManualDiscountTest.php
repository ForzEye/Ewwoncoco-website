<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Merchant;
use App\Models\PosShift;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class POSManualDiscountTest extends TestCase
{
    use RefreshDatabase;

    private $merchant;
    private $branch;
    private $product;
    private $cashier;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cashier = User::factory()->create(['role' => 'kasir', 'is_active' => true]);

        $this->merchant = Merchant::create([
            'owner_id' => $this->cashier->id,
            'name' => 'EWWON COCO Test Discount',
            'slug' => 'ewwon-coco-test-discount',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        $this->cashier->update(['merchant_id' => $this->merchant->id]);

        $this->branch = Branch::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Cabang Test Discount',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Signature Coco',
            'slug' => 'signature-coco',
            'price' => 20000,
            'is_available' => true,
        ]);

        // Active Shift
        PosShift::create([
            'cashier_id' => $this->cashier->id,
            'branch_id' => $this->branch->id,
            'opened_at' => now(),
            'opening_cash' => 100000,
        ]);
    }

    /** @test */
    public function it_applies_manual_fixed_discount_correctly()
    {
        $response = $this->actingAs($this->cashier)
            ->postJson('/pos/store', [
                'customer_name' => 'POS Customer',
                'payment_method' => 'cash',
                'items' => [
                    [
                        'product' => $this->product->toArray(),
                        'quantity' => 1,
                    ]
                ],
                'manual_discount_type' => 'fixed',
                'manual_discount_value' => 5000,
                'discount_reason' => 'Rekan Owner'
            ]);

        $response->assertStatus(200);
        $this->assertEquals(15000, $response->json('transaction.total'));
        $this->assertEquals(5000, $response->json('transaction.discount'));
        $this->assertEquals('Rekan Owner', $response->json('transaction.discount_reason'));
        $this->assertEquals('fixed', $response->json('transaction.manual_discount_type'));
    }

    /** @test */
    public function it_applies_manual_percent_discount_correctly()
    {
        $response = $this->actingAs($this->cashier)
            ->postJson('/pos/store', [
                'customer_name' => 'POS Customer',
                'payment_method' => 'cash',
                'items' => [
                    [
                        'product' => $this->product->toArray(),
                        'quantity' => 1,
                    ]
                ],
                'manual_discount_type' => 'percent',
                'manual_discount_value' => 10,
                'discount_reason' => 'Diskon Pembukaan'
            ]);

        $response->assertStatus(200);
        $this->assertEquals(18000, $response->json('transaction.total'));
        $this->assertEquals(2000, $response->json('transaction.discount'));
        $this->assertEquals('Diskon Pembukaan', $response->json('transaction.discount_reason'));
        $this->assertEquals('percent', $response->json('transaction.manual_discount_type'));
    }

    /** @test */
    public function it_does_not_require_discount_reason_when_value_is_provided()
    {
        $response = $this->actingAs($this->cashier)
            ->postJson('/pos/store', [
                'customer_name' => 'POS Customer',
                'payment_method' => 'cash',
                'items' => [
                    [
                        'product' => $this->product->toArray(),
                        'quantity' => 1,
                    ]
                ],
                'manual_discount_type' => 'fixed',
                'manual_discount_value' => 5000,
                'discount_reason' => '' // Empty reason
            ]);

        $response->assertStatus(200);
        $this->assertEquals(15000, $response->json('transaction.total'));
    }
}
