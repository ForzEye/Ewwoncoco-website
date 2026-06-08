<?php

namespace Tests\Feature;

use App\Models\Customization;
use App\Models\Merchant;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomizationOrderTest extends TestCase
{
    use RefreshDatabase;

    private $merchant;
    private $admin;
    private $product;

    protected function setUp(): void
    {
        parent::setUp();

        // Create an admin user
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Create a merchant and associate it with the admin
        $this->merchant = Merchant::create([
            'owner_id' => $this->admin->id,
            'name' => 'EWWON COCO Customizations Test',
            'slug' => 'ewwon-coco-customizations-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        $this->admin->update(['merchant_id' => $this->merchant->id]);

        // Create a product
        $this->product = Product::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Signature Coco',
            'slug' => 'signature-coco',
            'price' => 20000,
            'is_available' => true,
        ]);
    }

    /** @test */
    public function it_returns_customizations_sorted_by_order_and_id_on_index()
    {
        // Create customizations with different order values
        $customizationA = Customization::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Ice Level',
            'type' => 'single',
            'is_required' => true,
            'is_active' => true,
            'order' => 2,
        ]);

        $customizationB = Customization::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Sugar Level',
            'type' => 'single',
            'is_required' => true,
            'is_active' => true,
            'order' => 1,
        ]);

        $customizationC = Customization::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Toppings',
            'type' => 'multiple',
            'is_required' => false,
            'is_active' => true,
            'order' => 3,
        ]);

        $response = $this->actingAs($this->admin)
            ->get('/admin/customizations');

        $response->assertStatus(200);

        // Retrieve customizations from Inertia response to verify order
        $customizations = $response->original->getData()['page']['props']['customizations'];

        $this->assertCount(3, $customizations);
        // B should be first (order 1)
        $this->assertEquals($customizationB->id, $customizations[0]['id']);
        // A should be second (order 2)
        $this->assertEquals($customizationA->id, $customizations[1]['id']);
        // C should be third (order 3)
        $this->assertEquals($customizationC->id, $customizations[2]['id']);
    }

    /** @test */
    public function it_updates_customization_order_successfully()
    {
        $customizationA = Customization::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Ice Level',
            'type' => 'single',
            'is_required' => true,
            'is_active' => true,
            'order' => 1,
        ]);

        $customizationB = Customization::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Sugar Level',
            'type' => 'single',
            'is_required' => true,
            'is_active' => true,
            'order' => 2,
        ]);

        $response = $this->actingAs($this->admin)
            ->post('/admin/customizations/reorder', [
                'orders' => [
                    ['id' => $customizationA->id, 'order' => 5],
                    ['id' => $customizationB->id, 'order' => 1],
                ]
            ]);

        $response->assertRedirect('/admin/customizations');
        $response->assertSessionHas('success');

        $this->assertEquals(5, $customizationA->fresh()->order);
        $this->assertEquals(1, $customizationB->fresh()->order);
    }

    /** @test */
    public function it_respects_customization_order_in_product_customizations_relationship()
    {
        $customizationA = Customization::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Ice Level',
            'type' => 'single',
            'is_required' => true,
            'is_active' => true,
            'order' => 3,
        ]);

        $customizationB = Customization::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Sugar Level',
            'type' => 'single',
            'is_required' => true,
            'is_active' => true,
            'order' => 1,
        ]);

        $customizationC = Customization::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Toppings',
            'type' => 'multiple',
            'is_required' => false,
            'is_active' => true,
            'order' => 2,
        ]);

        // Attach them to the product
        $this->product->customizations()->sync([
            $customizationA->id,
            $customizationB->id,
            $customizationC->id,
        ]);

        $customizations = $this->product->fresh()->customizations;

        $this->assertCount(3, $customizations);
        // B (order 1)
        $this->assertEquals($customizationB->id, $customizations[0]->id);
        // C (order 2)
        $this->assertEquals($customizationC->id, $customizations[1]->id);
        // A (order 3)
        $this->assertEquals($customizationA->id, $customizations[2]->id);
    }
}
