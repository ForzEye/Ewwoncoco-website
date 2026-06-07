<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\PosTransaction;
use App\Models\User;
use App\Services\InsightService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InsightServiceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_identifies_busy_hours_correctly_from_database()
    {
        $owner = User::factory()->create();
        $merchant = Merchant::create([
            'id' => 1,
            'owner_id' => $owner->id,
            'name' => 'EWWON COCO Test',
            'slug' => 'ewwon-coco-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        $branch = Branch::create([
            'id' => 1,
            'merchant_id' => $merchant->id,
            'name' => 'Cabang Test',
            'address' => 'Test Cabang Address',
            'phone' => '0215551234',
            'is_active' => true,
        ]);

        // Create some orders at specific hours: 10:00, 11:00, 15:00 using save() to bypass fillable or force set created_at
        $order1 = new Order([
            'customer_id' => $owner->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-1',
            'total' => 20000,
            'subtotal' => 20000,
            'discount' => 0,
            'status' => 'delivered',
            'payment_method' => 'cash',
        ]);
        $order1->created_at = now()->startOfDay()->addHours(10)->toDateTimeString();
        $order1->save();

        $order2 = new Order([
            'customer_id' => $owner->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-2',
            'total' => 20000,
            'subtotal' => 20000,
            'discount' => 0,
            'status' => 'delivered',
            'payment_method' => 'cash',
        ]);
        $order2->created_at = now()->startOfDay()->addHours(11)->toDateTimeString();
        $order2->save();

        // Create a POS transaction at 15:00
        $pos = new PosTransaction([
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'cashier_id' => $owner->id,
            'customer_name' => 'Test Customer',
            'transaction_number' => 'POS-1',
            'payment_method' => 'cash',
            'total' => 10000,
            'discount' => 0,
            'cash_received' => 10000,
            'change_amount' => 0,
            'transaction_at' => now()->startOfDay()->addHours(15)->toDateTimeString(),
        ]);
        $pos->created_at = now()->startOfDay()->addHours(15)->toDateTimeString();
        $pos->save();

        // Calculate insights
        $stats = ['total_orders' => 3];
        $todayStats = ['revenue' => 50000, 'voids' => 0];
        $chartData = [];

        dump(\DB::table('orders')->select(\DB::raw("created_at, strftime('%H', created_at) as hr"))->get()->toArray());
        dump(\DB::table('pos_transactions')->select(\DB::raw("created_at, transaction_at, strftime('%H', transaction_at) as hr"))->get()->toArray());

        $insights = InsightService::generateAdminInsights($stats, $todayStats, $chartData, $merchant->id);

        // Find the prediction/recommendation insight
        $aiInsight = null;
        foreach ($insights as $insight) {
            if ($insight['type'] === 'magic') {
                $aiInsight = $insight;
                break;
            }
        }

        $this->assertNotNull($aiInsight);
        // It should contain the detected busy hours (10:00 - 12:00, 15:00 - 16:00 because they have greater than average transactions which is 1)
        $this->assertStringContainsString('10:00 - 12:00', $aiInsight['text']);
        $this->assertStringContainsString('15:00 - 16:00', $aiInsight['text']);
    }
}

