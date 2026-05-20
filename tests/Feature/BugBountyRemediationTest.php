<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Merchant;
use App\Models\Branch;
use App\Models\Product;
use App\Models\Ingredient;
use App\Models\BranchIngredient;
use App\Models\Recipe;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OtpCode;
use App\Models\Referral;
use App\Services\OtpService;
use App\Services\PointsService;
use App\Services\StockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BugBountyRemediationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_locks_otp_code_after_exactly_5_failed_attempts()
    {
        Mail::fake();

        $otpService = new OtpService();
        $identifier = 'testuser@example.com';
        
        // Send OTP
        $success = $otpService->sendOtp($identifier, 'register', 'email');
        $this->assertTrue($success);

        // Fetch the generated OTP
        $otp = OtpCode::where('identifier', $identifier)->where('is_used', false)->first();
        $this->assertNotNull($otp);
        $this->assertEquals(0, $otp->failed_attempts);

        // 1st failed attempt
        $verifyResult = $otpService->verifyOtp($identifier, '000000');
        $this->assertFalse($verifyResult);
        $otp->refresh();
        $this->assertEquals(1, $otp->failed_attempts);
        $this->assertFalse($otp->is_used);

        // 2nd, 3rd, and 4th failed attempts
        for ($i = 2; $i <= 4; $i++) {
            $verifyResult = $otpService->verifyOtp($identifier, '000000');
            $this->assertFalse($verifyResult);
            $otp->refresh();
            $this->assertEquals($i, $otp->failed_attempts);
            $this->assertFalse($otp->is_used);
        }

        // 5th failed attempt (should lock the OTP code by setting is_used = true)
        $verifyResult = $otpService->verifyOtp($identifier, '000000');
        $this->assertFalse($verifyResult);
        $otp->refresh();
        $this->assertEquals(5, $otp->failed_attempts);
        $this->assertTrue($otp->is_used);

        // Subsequent verification with the correct code should fail because OTP is marked is_used
        $verifyResultWithCorrectCode = $otpService->verifyOtp($identifier, $otp->code);
        $this->assertFalse($verifyResultWithCorrectCode);
    }

    /** @test */
    public function it_allows_multiple_referees_to_use_the_same_reusable_referral_code()
    {
        // Create default merchant so that merchant_id = 1 exists for the loyalty point ledger
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

        $referrer = User::factory()->create();
        $referee1 = User::factory()->create();
        $referee2 = User::factory()->create();

        // 1. Get referral code for referrer (should generate and store on users table)
        $result = PointsService::getReferralCode($referrer->id);
        $code = $result['code'];
        
        $this->assertNotEmpty($code);
        $referrer->refresh();
        $this->assertEquals($code, $referrer->referral_code);

        // 2. Apply referral code for Referee 1
        $applied1 = PointsService::applyReferralCode($referee1->id, $code);
        $this->assertTrue($applied1);

        $referee1->refresh();
        $this->assertEquals($referrer->id, $referee1->referred_by_id);

        // 3. Apply referral code for Referee 2 (referral code must still be valid and active!)
        $applied2 = PointsService::applyReferralCode($referee2->id, $code);
        $this->assertTrue($applied2);

        $referee2->refresh();
        $this->assertEquals($referrer->id, $referee2->referred_by_id);

        // 4. Verify referral count and points earned
        $resultUpdated = PointsService::getReferralCode($referrer->id);
        $this->assertEquals(2, $resultUpdated['total_referrals']);

        $referralRows = Referral::where('referrer_id', $referrer->id)->count();
        $this->assertEquals(2, $referralRows);

        // Referrer should have earned bonus points twice
        $balance = PointsService::getBalance($referrer->id);
        $settings = PointsService::getSettings();
        $expectedPoints = $settings['referral_reward_points'] * 2;
        $this->assertEquals($expectedPoints, $balance);
    }

    /** @test */
    public function it_rejects_payment_proof_upload_with_invalid_magic_bytes()
    {
        Storage::fake('s3');

        $user = User::factory()->create();
        $merchant = Merchant::create([
            'owner_id' => $user->id,
            'name' => 'EWWON COCO Test',
            'slug' => 'ewwon-coco-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);
        $branch = Branch::create([
            'merchant_id' => $merchant->id,
            'name' => 'Cabang Test',
            'address' => 'Test Cabang Address',
            'phone' => '0215551234',
            'lat' => -6.2088,
            'lng' => 106.8456,
            'is_active' => true,
        ]);
        $order = Order::create([
            'customer_id' => $user->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-PROOF-99',
            'total' => 60000,
            'subtotal' => 60000,
            'discount' => 0,
            'status' => 'pending',
            'payment_method' => 'qris',
        ]);

        // Create a dummy text file disguised as a png (invalid magic bytes)
        $maliciousFile = UploadedFile::fake()->create('backdoor.png', 100, 'image/png');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/orders/{$order->id}/payment-proof", [
                'payment_proof' => $maliciousFile
            ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Format file tidak valid atau berbahaya.'
        ]);
    }

    /** @test */
    public function it_accepts_payment_proof_upload_with_valid_magic_bytes_and_saves_to_private_s3()
    {
        Storage::fake('s3');

        $user = User::factory()->create();
        $merchant = Merchant::create([
            'owner_id' => $user->id,
            'name' => 'EWWON COCO Test',
            'slug' => 'ewwon-coco-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);
        $branch = Branch::create([
            'merchant_id' => $merchant->id,
            'name' => 'Cabang Test',
            'address' => 'Test Cabang Address',
            'phone' => '0215551234',
            'lat' => -6.2088,
            'lng' => 106.8456,
            'is_active' => true,
        ]);
        $order = Order::create([
            'customer_id' => $user->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-PROOF-100',
            'total' => 60000,
            'subtotal' => 60000,
            'discount' => 0,
            'status' => 'pending',
            'payment_method' => 'qris',
        ]);

        // Create a valid image file (contains real image structure/magic bytes)
        $validImageFile = UploadedFile::fake()->image('proof.png');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/orders/{$order->id}/payment-proof", [
                'payment_proof' => $validImageFile
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Bukti pembayaran berhasil diunggah.'
        ]);

        $order->refresh();
        $this->assertNotEmpty($order->getRawOriginal('payment_proof_url'));
        // Verify S3 contains the uploaded file
        $rawPath = $order->getRawOriginal('payment_proof_url');
        Storage::disk('s3')->assertExists($rawPath);
    }

    /** @test */
    public function it_throws_exception_and_rolls_back_when_deducting_from_recipe_with_insufficient_stock()
    {
        $user = User::factory()->create();
        $merchant = Merchant::create([
            'owner_id' => $user->id,
            'name' => 'EWWON COCO Test',
            'slug' => 'ewwon-coco-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);
        $branch = Branch::create([
            'merchant_id' => $merchant->id,
            'name' => 'Cabang Test',
            'address' => 'Test Cabang Address',
            'phone' => '0215551234',
            'lat' => -6.2088,
            'lng' => 106.8456,
            'is_active' => true,
        ]);
        
        $product = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Signature Coco',
            'slug' => 'signature-coco',
            'price' => 25000,
            'is_available' => true,
        ]);

        $ingredient = Ingredient::create([
            'merchant_id' => $merchant->id,
            'name' => 'Kelapa Organik',
            'unit' => 'gram',
        ]);

        $recipe = Recipe::create([
            'product_id' => $product->id,
            'ingredient_id' => $ingredient->id,
            'quantity' => 100, // Needs 100g
        ]);

        // Branch only has 50g (insufficient)
        $branchIngredient = BranchIngredient::create([
            'branch_id' => $branch->id,
            'ingredient_id' => $ingredient->id,
            'stock' => 50,
        ]);

        $order = Order::create([
            'customer_id' => $user->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-STOCK-001',
            'total' => 25000,
            'subtotal' => 25000,
            'discount' => 0,
            'status' => 'pending',
            'payment_method' => 'qris',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 25000,
            'subtotal' => 25000,
        ]);

        // Trigger stock deduction and check that exception is thrown
        $exceptionThrown = false;
        try {
            DB::transaction(function () use ($product, $branch, $order) {
                StockService::deductFromRecipe(
                    $product->id, 
                    $branch->id, 
                    1, 
                    $order->id, 
                    'OnlineOrder'
                );
            });
        } catch (\Exception $e) {
            $exceptionThrown = true;
            $this->assertStringContainsString('Stok tidak mencukupi untuk bahan: Kelapa Organik', $e->getMessage());
        }

        $this->assertTrue($exceptionThrown);

        // Verify that the stock remains untouched (rolled back)
        $branchIngredient->refresh();
        $this->assertEquals(50, $branchIngredient->stock);
    }
}
