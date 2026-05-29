<?php

namespace Tests\Feature;

use App\Models\Merchant;
use App\Models\User;
use App\Models\UserPointsBalance;
use App\Models\Voucher;
use App\Services\VoucherService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VoucherLoyaltyTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    private $merchant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->merchant = Merchant::create([
            'owner_id' => $this->user->id,
            'name' => 'EWWON COCO Test',
            'slug' => 'ewwon-coco-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);
    }

    /** @test */
    public function it_can_redeem_voucher_successfully_with_points()
    {
        // 1. Setup User Points Balance
        $balanceRecord = UserPointsBalance::create([
            'user_id' => $this->user->id,
            'balance' => 100, // Has 100 points
        ]);

        // 2. Setup Voucher Template requiring points
        $template = Voucher::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Diskon 10 Ribu Eksklusif',
            'code' => 'COCO10K',
            'discount_type' => 'fixed',
            'discount_value' => 10000,
            'min_purchase' => 20000,
            'max_discount' => 10000,
            'usage_limit' => 10,
            'used_count' => 0,
            'is_active' => true,
            'points_cost' => 50, // Costs 50 points
            'user_id' => null, // Template is null user_id
        ]);

        // 3. Redeem Voucher
        $response = VoucherService::redeemVoucher($template->id, $this->user->id);

        $this->assertTrue($response['success']);

        // Assert points deducted
        $balanceRecord->refresh();
        $this->assertEquals(50, $balanceRecord->balance);

        // Assert unique user voucher clone was created
        $userVouchers = Voucher::where('user_id', $this->user->id)->get();
        $this->assertCount(1, $userVouchers);

        $clonedVoucher = $userVouchers->first();
        $this->assertEquals('Diskon 10 Ribu Eksklusif', $clonedVoucher->name);
        $this->assertStringStartsWith('RDM-COCO10K-', $clonedVoucher->code);
        $this->assertNull($clonedVoucher->points_cost);
        $this->assertEquals(1, $clonedVoucher->usage_limit);

        // Assert template used_count incremented
        $template->refresh();
        $this->assertEquals(1, $template->used_count);
    }

    /** @test */
    public function it_fails_to_redeem_voucher_when_points_are_insufficient()
    {
        // 1. Setup User Points Balance (only has 20 points)
        UserPointsBalance::create([
            'user_id' => $this->user->id,
            'balance' => 20,
        ]);

        // 2. Setup Voucher Template requiring 50 points
        $template = Voucher::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Diskon 10 Ribu Eksklusif',
            'code' => 'COCO10K',
            'discount_type' => 'fixed',
            'discount_value' => 10000,
            'min_purchase' => 20000,
            'max_discount' => 10000,
            'usage_limit' => 10,
            'used_count' => 0,
            'is_active' => true,
            'points_cost' => 50,
            'user_id' => null,
        ]);

        // 3. Redeem Voucher
        $response = VoucherService::redeemVoucher($template->id, $this->user->id);

        $this->assertFalse($response['success']);
        $this->assertStringContainsString('Poin Anda tidak cukup', $response['message']);

        // Assert no cloned voucher created
        $userVouchers = Voucher::where('user_id', $this->user->id)->get();
        $this->assertCount(0, $userVouchers);
    }

    /** @test */
    public function it_validates_voucher_ownership_securely()
    {
        $otherUser = User::factory()->create();

        // Voucher belonging only to $this->user
        $myVoucher = Voucher::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'Kupon Rahasia Saya',
            'code' => 'RDM-MYCOUPON',
            'discount_type' => 'fixed',
            'discount_value' => 10000,
            'min_purchase' => 20000,
            'is_active' => true,
            'user_id' => $this->user->id, // Owned by $this->user
        ]);

        // 1. Validating for owner should succeed
        $resSelf = VoucherService::validate('RDM-MYCOUPON', $this->user->id, 30000);
        $this->assertTrue($resSelf['success']);

        // 2. Validating for another user should fail
        $resOther = VoucherService::validate('RDM-MYCOUPON', $otherUser->id, 30000);
        $this->assertFalse($resOther['success']);
        $this->assertEquals('Voucher ini bukan milik Anda.', $resOther['message']);
    }
}
