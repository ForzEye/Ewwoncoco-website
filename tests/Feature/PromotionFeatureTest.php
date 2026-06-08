<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Customization;
use App\Models\CustomizationOption;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\PosShift;
use App\Models\PosTransaction;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromotionFeatureTest extends TestCase
{
    use RefreshDatabase;

    private $merchant;
    private $branch;
    private $product;
    private $custOptionFrom;
    private $custOptionTo;
    private $cashier;
    private $customerNew;
    private $customerOld;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cashier = User::factory()->create(['role' => 'kasir', 'is_active' => true]);

        $this->merchant = Merchant::create([
            'owner_id' => $this->cashier->id,
            'name' => 'EWWON COCO Test Promo',
            'slug' => 'ewwon-coco-test-promo',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        $this->cashier->update(['merchant_id' => $this->merchant->id]);

        $this->branch = Branch::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Cabang Test Promo',
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

        // Setup Customizations
        $customization = Customization::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Kelapa',
            'type' => 'single',
        ]);

        $this->custOptionFrom = CustomizationOption::create([
            'customization_id' => $customization->id,
            'name' => 'Kelapa Keras',
            'price' => 2000,
        ]);

        $this->custOptionTo = CustomizationOption::create([
            'customization_id' => $customization->id,
            'name' => 'Soft Coco',
            'price' => 5000,
        ]);

        // Active Shift
        PosShift::create([
            'cashier_id' => $this->cashier->id,
            'branch_id' => $this->branch->id,
            'opened_at' => now(),
            'opening_cash' => 100000,
        ]);

        // Customers
        $this->customerNew = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $this->customerOld = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        // Create transaction history for old customer
        PosTransaction::create([
            'merchant_id' => $this->merchant->id,
            'branch_id' => $this->branch->id,
            'cashier_id' => $this->cashier->id,
            'customer_id' => $this->customerOld->id,
            'customer_name' => $this->customerOld->name,
            'transaction_number' => 'POS-OLD-CUST',
            'payment_method' => 'cash',
            'total' => 20000,
            'cash_received' => 20000,
            'change_amount' => 0,
            'transaction_at' => now(),
        ]);
    }

    /** @test */
    public function it_applies_new_member_bogo_caps_correctly_on_pos_checkout()
    {
        // Setup a BOGO promo for new members with max_free_qty = 1
        $promo = Promotion::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'New Member Bogo Limit 1',
            'type' => 'bogo',
            'applicable_on' => 'all',
            'buy_product_id' => $this->product->id,
            'buy_quantity' => 1,
            'get_product_id' => $this->product->id,
            'get_quantity' => 1,
            'is_new_member_only' => true,
            'max_free_qty' => 1,
            'is_active' => true,
            'value' => 0,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
        ]);

        // 1. Checkout with new customer (0 historical transactions) -> Should get BOGO, capped at 1 free item
        $response = $this->actingAs($this->cashier)
            ->postJson('/pos/store', [
                'customer_id' => $this->customerNew->id,
                'customer_name' => $this->customerNew->name,
                'payment_method' => 'cash',
                'items' => [
                    [
                        'product' => $this->product->toArray(),
                        'quantity' => 3, // buys 3, BOGO normally gives 3 free, but capped at max_free_qty = 1
                    ]
                ]
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('pos_transaction_items', [
            'unit_price' => 0,
            'quantity' => 1, // capped at 1
            'notes' => 'PROMO BOGO: ' . $promo->name,
        ]);

        // 2. Checkout with old customer (1 historical transaction) -> Should NOT get BOGO
        $response = $this->actingAs($this->cashier)
            ->postJson('/pos/store', [
                'customer_id' => $this->customerOld->id,
                'customer_name' => $this->customerOld->name,
                'payment_method' => 'cash',
                'items' => [
                    [
                        'product' => $this->product->toArray(),
                        'quantity' => 1,
                    ]
                ]
            ]);

        $response->assertStatus(200);
        $transactionId = $response->json('transaction.id');
        $this->assertDatabaseMissing('pos_transaction_items', [
            'transaction_id' => $transactionId,
            'unit_price' => 0,
            'notes' => 'PROMO BOGO: ' . $promo->name,
        ]);
    }

    /** @test */
    public function it_applies_customization_upgrade_discount_to_rp_0_on_pos_and_online_checkout()
    {
        // Setup upgrade promo: Kelapa Keras -> Soft Coco (upgrade cost is discounted)
        $promo = Promotion::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Upgrade Soft Coco Free',
            'type' => 'upgrade',
            'applicable_on' => 'all',
            'upgrade_from_option_id' => $this->custOptionFrom->id,
            'upgrade_to_option_id' => $this->custOptionTo->id,
            'is_active' => true,
            'value' => 0,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
        ]);

        // 1a. POS Checkout with upgraded option BUT without claim_upgrade -> Option price should NOT be zeroed (item total = product price 20k + 5k = 25k)
        $response = $this->actingAs($this->cashier)
            ->postJson('/pos/store', [
                'customer_name' => 'POS Upgrade Customer Paid',
                'payment_method' => 'cash',
                'items' => [
                    [
                        'product' => $this->product->toArray(),
                        'quantity' => 1,
                        'customizations' => [
                            array_merge($this->custOptionTo->toArray(), ['claim_upgrade' => false]),
                        ]
                    ]
                ]
            ]);

        $response->assertStatus(200);
        $this->assertEquals(25000, $response->json('transaction.total'));

        // 1b. POS Checkout with upgraded option AND with claim_upgrade = true -> Option price should be zeroed (item total = product price 20k + 0 = 20k)
        $response = $this->actingAs($this->cashier)
            ->postJson('/pos/store', [
                'customer_name' => 'POS Upgrade Customer Free',
                'payment_method' => 'cash',
                'items' => [
                    [
                        'product' => $this->product->toArray(),
                        'quantity' => 1,
                        'customizations' => [
                            array_merge($this->custOptionTo->toArray(), ['claim_upgrade' => true]),
                        ]
                    ]
                ]
            ]);

        $response->assertStatus(200);
        $this->assertEquals(20000, $response->json('transaction.total'));

        // 2a. Online checkout with upgraded option BUT without claim_upgrade -> Option price should NOT be zeroed
        $response = $this->actingAs($this->customerNew)
            ->postJson('/checkout', [
                'delivery_type' => 'pickup',
                'payment_method' => 'qris',
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 1,
                        'customizations' => [
                            array_merge($this->custOptionTo->toArray(), ['claim_upgrade' => false]),
                        ]
                    ]
                ]
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'customer_id' => $this->customerNew->id,
            'subtotal' => 25000,
            'total' => 25000,
        ]);

        // 2b. Online checkout with upgraded option AND with claim_upgrade = true -> Option price should be zeroed
        $response = $this->actingAs($this->customerNew)
            ->postJson('/checkout', [
                'delivery_type' => 'pickup',
                'payment_method' => 'qris',
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 1,
                        'customizations' => [
                            array_merge($this->custOptionTo->toArray(), ['claim_upgrade' => true]),
                        ]
                    ]
                ]
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'customer_id' => $this->customerNew->id,
            'subtotal' => 20000,
            'total' => 20000,
        ]);
    }
}
