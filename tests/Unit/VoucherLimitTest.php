<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\VoucherService;
use App\Models\User;
use App\Models\Voucher;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

class VoucherLimitTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_caps_voucher_usage_per_user()
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

        $voucher = Voucher::create([
            'merchant_id' => $merchant->id,
            'name' => 'Discount Kelapa',
            'code' => 'KELAPA10',
            'discount_type' => 'fixed',
            'discount_value' => 5000,
            'min_purchase' => 10000,
            'usage_limit' => 10,
            'used_count' => 0,
            'limit_per_user' => 1,
            'is_active' => true,
        ]);

        // First check - should be valid
        $result = VoucherService::validate('KELAPA10', $user->id, 15000);
        $this->assertTrue($result['success']);

        // Mock user has already used the voucher once
        Order::create([
            'customer_id' => $user->id,
            'branch_id' => $branch->id,
            'merchant_id' => $merchant->id,
            'order_type' => 'online',
            'order_number' => 'ORD-1234',
            'subtotal' => 15000,
            'discount' => 5000,
            'delivery_fee' => 0,
            'total' => 10000,
            'payment_status' => 'confirmed',
            'status' => 'confirmed',
            'payment_method' => 'qris',
            'notes' => 'Voucher: KELAPA10',
        ]);

        // Second check - should fail due to limit_per_user = 1
        $result2 = VoucherService::validate('KELAPA10', $user->id, 15000);
        $this->assertFalse($result2['success']);
        $this->assertEquals('Batas maksimal penggunaan voucher ini sudah tercapai untuk akun Anda.', $result2['message']);
    }
}
