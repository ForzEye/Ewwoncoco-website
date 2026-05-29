<?php

namespace Tests\Feature;

use App\Mail\OtpMail;
use App\Models\Branch;
use App\Models\BranchIngredient;
use App\Models\Ingredient;
use App\Models\Merchant;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OtpCode;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Referral;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\UserDevice;
use App\Services\Notification\FCMService;
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

        $otpService = new OtpService;
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
                'payment_proof' => $maliciousFile,
            ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Format file tidak valid atau berbahaya.',
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
                'payment_proof' => $validImageFile,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Bukti pembayaran berhasil diunggah.',
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

    /** @test */
    public function it_sends_otp_when_globally_enabled()
    {
        Mail::fake();
        SystemSetting::setVal('otp_enabled', '1');

        $otpService = new OtpService;
        $identifier = 'enabled_test@example.com';

        $success = $otpService->sendOtp($identifier, 'register', 'email');
        $this->assertTrue($success);

        // Fetch the generated OTP
        $otp = OtpCode::where('identifier', $identifier)->where('is_used', false)->first();
        $this->assertNotNull($otp);
        $this->assertEquals('sent', $otp->status);

        // Mail should have been sent
        Mail::assertSent(OtpMail::class);
    }

    /** @test */
    public function it_bypasses_otp_sending_when_globally_disabled_but_saves_code_in_db_and_allows_verification()
    {
        Mail::fake();
        SystemSetting::setVal('otp_enabled', '0');

        $otpService = new OtpService;
        $identifier = 'disabled_test@example.com';

        $success = $otpService->sendOtp($identifier, 'register', 'email');
        $this->assertTrue($success);

        // Fetch the generated OTP
        $otp = OtpCode::where('identifier', $identifier)->where('is_used', false)->first();
        $this->assertNotNull($otp);
        $this->assertEquals('sent', $otp->status);

        // Mail should NOT have been sent
        Mail::assertNotSent(OtpMail::class);

        // Standard verification with the stored code should still succeed!
        $verifyResult = $otpService->verifyOtp($identifier, $otp->code);
        $this->assertTrue($verifyResult);
    }

    /** @test */
    public function it_bypasses_adaptive_security_check_during_login_when_globally_disabled()
    {
        Mail::fake();
        SystemSetting::setVal('otp_enabled', '0');

        $user = User::factory()->create([
            'email' => 'customer_otp_bypass@example.com',
            'password' => bcrypt('Customer@123'),
            'phone' => '081234567890',
        ]);

        // Send login request with device_id (representing a new device)
        $response = $this->postJson('/api/v1/login', [
            'email' => 'customer_otp_bypass@example.com',
            'password' => 'Customer@123',
            'device_id' => 'device_999',
            'device_name' => 'Redmi Note 10',
        ]);

        // Should return HTTP 200 instead of HTTP 202 (otp_required)
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'token',
            'user' => [
                'id',
                'name',
                'email',
                'phone',
            ],
        ]);

        $this->assertTrue($response['success']);

        // Assert device record exists and is marked is_trusted = true
        $device = UserDevice::where('user_id', $user->id)
            ->where('device_id', 'device_999')
            ->first();

        $this->assertNotNull($device);
        $this->assertTrue((bool) $device->is_trusted);
    }

    /** @test */
    public function it_requires_otp_during_login_on_new_device_when_globally_enabled()
    {
        Mail::fake();
        SystemSetting::setVal('otp_enabled', '1');

        $user = User::factory()->create([
            'email' => 'customer_otp_required@example.com',
            'password' => bcrypt('Customer@123'),
            'phone' => '081234567890',
        ]);

        // Send login request with device_id (representing a new device)
        $response = $this->postJson('/api/v1/login', [
            'email' => 'customer_otp_required@example.com',
            'password' => 'Customer@123',
            'device_id' => 'device_888',
            'device_name' => 'Redmi Note 10',
        ]);

        // Should return HTTP 202 (otp_required)
        $response->assertStatus(202);
        $response->assertJson([
            'success' => false,
            'otp_required' => true,
            'identifier' => '081234567890',
            'channel' => 'whatsapp',
        ]);
    }

    /** @test */
    public function it_accepts_online_order_successfully_and_records_notification()
    {
        $cashier = User::factory()->create(['role' => 'kasir', 'is_active' => true, 'merchant_id' => null]);
        $customer = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $merchant = Merchant::create([
            'id' => 1,
            'owner_id' => $cashier->id,
            'name' => 'EWWON COCO Test',
            'slug' => 'ewwon-coco-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        $cashier->update(['merchant_id' => $merchant->id]);

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

        Recipe::create([
            'product_id' => $product->id,
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
        ]);

        BranchIngredient::create([
            'branch_id' => $branch->id,
            'ingredient_id' => $ingredient->id,
            'stock' => 100,
        ]);

        $order = Order::create([
            'customer_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-ACCEPT-TEST',
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

        $response = $this->actingAs($cashier)
            ->postJson("/pos/online-orders/{$order->id}/accept");

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $order->refresh();
        $this->assertEquals('confirmed', $order->status);
        $this->assertEquals($cashier->id, $order->cashier_id);

        // Assert notification record was created in the database
        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'title' => 'Pesanan Diterima',
            'type' => 'order_update',
        ]);
    }

    /** @test */
    public function it_rejects_online_order_successfully_and_records_notification()
    {
        $cashier = User::factory()->create(['role' => 'kasir', 'is_active' => true, 'merchant_id' => null]);
        $customer = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $merchant = Merchant::create([
            'id' => 1,
            'owner_id' => $cashier->id,
            'name' => 'EWWON COCO Test',
            'slug' => 'ewwon-coco-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        $cashier->update(['merchant_id' => $merchant->id]);

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
            'customer_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-REJECT-TEST',
            'total' => 25000,
            'subtotal' => 25000,
            'discount' => 0,
            'status' => 'pending',
            'payment_method' => 'qris',
        ]);

        $response = $this->actingAs($cashier)
            ->postJson("/pos/online-orders/{$order->id}/reject", [
                'reason' => 'Bukti pembayaran tidak valid.',
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $order->refresh();
        $this->assertEquals('cancelled', $order->status);
        $this->assertEquals('Bukti pembayaran tidak valid.', $order->rejection_reason);

        // Assert notification record was created in the database
        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'title' => 'Pesanan Dibatalkan',
            'type' => 'order_update',
        ]);
    }

    /** @test */
    public function it_triggers_fcm_notification_on_notification_model_created()
    {
        $user = User::factory()->create([
            'fcm_token' => 'mocked-fcm-token',
        ]);

        $mockFCM = $this->mock(FCMService::class);
        $mockFCM->shouldReceive('sendToToken')
            ->once()
            ->with(
                'mocked-fcm-token',
                'Test Notification Title',
                'Test Notification Body',
                [
                    'type' => 'test_type',
                    'key1' => 'val1',
                    'key2' => 'val2',
                ]
            )
            ->andReturn(true);

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Test Notification Title',
            'body' => 'Test Notification Body',
            'type' => 'test_type',
            'data' => [
                'key1' => 'val1',
                'key2' => 'val2',
            ],
        ]);
    }

    /** @test */
    public function it_updates_fcm_token_for_authenticated_mobile_user()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/notifications/token', [
                'fcm_token' => 'new-device-token',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'FCM Token updated successfully',
        ]);

        $user->refresh();
        $this->assertEquals('new-device-token', $user->fcm_token);
    }
}
