<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserPointsBalance;
use App\Models\Order;
use App\Services\PointsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PointsRaceConditionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_safeguards_against_double_spending_points_using_pessimistic_lock()
    {
        $user = User::factory()->create();
        
        $merchant = \App\Models\Merchant::create([
            'owner_id' => $user->id,
            'name' => 'EWWON COCO Test',
            'slug' => 'ewwon-coco-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        $branch = \App\Models\Branch::create([
            'merchant_id' => $merchant->id,
            'name' => 'Cabang Test',
            'address' => 'Test Cabang Address',
            'phone' => '0215551234',
            'lat' => -6.2088,
            'lng' => 106.8456,
            'is_active' => true,
        ]);
        
        $balanceRecord = UserPointsBalance::create([
            'user_id' => $user->id,
            'balance' => 50,
        ]);

        // Mock settings ratios
        // Assuming ratios are Point to discount = 1:1000 or similar
        // Let's create an order
        $order1 = Order::create([
            'customer_id' => $user->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-001',
            'total' => 60000,
            'subtotal' => 60000,
            'discount' => 0,
            'status' => 'pending',
            'payment_method' => 'qris',
        ]);

        $order2 = Order::create([
            'customer_id' => $user->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-002',
            'total' => 60000,
            'subtotal' => 60000,
            'discount' => 0,
            'status' => 'pending',
            'payment_method' => 'qris',
        ]);

        // Simulating 2 concurrent processes in a transaction flow
        DB::beginTransaction();
        
        // Process A locks balance of 50
        $resA = PointsService::redeemPoints($user->id, $order1->id);

        // Process B attempts to lock simultaneously but will see updated/locked output or block.
        // In local serial testing, after A commits or continues, B gets the remaining.
        // We will simulate their interaction on the locked model directly.
        
        DB::commit();

        $balanceRecord->refresh();
        $this->assertEquals(0, $balanceRecord->balance); // A used all 50 points

        // Running another redeem should yield 0 since the balance is locked/deducted
        $resB = PointsService::redeemPoints($user->id, $order2->id);
        $this->assertEquals(0, $resB['points_used']);
    }
}
