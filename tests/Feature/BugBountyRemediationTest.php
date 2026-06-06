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
            $this->assertStringContainsString('Stok bahan baku tidak mencukupi: Kelapa Organik', $e->getMessage());
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

    /** @test */
    public function it_requires_customer_name_on_pos_checkout_and_saves_it()
    {
        $cashier = User::factory()->create(['role' => 'kasir', 'is_active' => true, 'merchant_id' => null]);

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
            'is_active' => true,
        ]);

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Es Kelapa Original',
            'slug' => 'es-kelapa-original',
            'price' => 15000,
            'stock' => 10,
            'is_available' => true,
        ]);

        \App\Models\PosShift::create([
            'cashier_id' => $cashier->id,
            'branch_id' => $branch->id,
            'opened_at' => now(),
            'opening_cash' => 100000,
        ]);

        // 1. Verify checkout fails validation if customer_name is missing
        $response = $this->actingAs($cashier)
            ->postJson('/pos/store', [
                'payment_method' => 'cash',
                'items' => [
                    [
                        'product' => ['id' => $product->id, 'price' => 15000],
                        'quantity' => 1,
                    ]
                ]
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer_name']);

        // 2. Verify checkout succeeds and stores customer_name when customer_name is provided
        $response = $this->actingAs($cashier)
            ->postJson('/pos/store', [
                'customer_name' => 'Budi POS Customer',
                'payment_method' => 'cash',
                'items' => [
                    [
                        'product' => ['id' => $product->id, 'price' => 15000],
                        'quantity' => 1,
                    ]
                ]
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('pos_transactions', [
            'customer_name' => 'Budi POS Customer',
            'payment_method' => 'cash',
            'total' => 15000,
        ]);
    }

    /** @test */
    public function it_throttles_low_stock_alerts_correctly_but_allows_immediate_state_transition_alerts()
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
        
        $admin = User::factory()->create([
            'role' => 'admin',
            'merchant_id' => $merchant->id,
            'fcm_token' => 'admin-fcm-token',
        ]);

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Coco Drink',
            'slug' => 'coco-drink',
            'price' => 10000,
            'stock' => 10,
            'min_stock' => 5,
            'is_available' => true,
        ]);

        // Mock FCMService to expect sendToToken twice (once for low stock, once for out of stock)
        $mockFCM = $this->mock(FCMService::class);
        $mockFCM->shouldReceive('sendToToken')
            ->twice()
            ->andReturn(true);

        // 1. Trigger low stock alert (stock = 4 <= min_stock) -> Should send 1st notification
        $product->stock = 4;
        \App\Services\Notification\StockAlertService::checkAndSendProductAlert($product);

        // 2. Trigger low stock alert again immediately -> Should be throttled (not sent)
        \App\Services\Notification\StockAlertService::checkAndSendProductAlert($product);

        // 3. Trigger out of stock alert (stock = 0 <= 0) -> Should bypass throttle and send 2nd notification immediately
        $product->stock = 0;
        \App\Services\Notification\StockAlertService::checkAndSendProductAlert($product);

        // 4. Trigger out of stock alert again -> Should be throttled (not sent)
        \App\Services\Notification\StockAlertService::checkAndSendProductAlert($product);
    }

    /** @test */
    public function it_filters_orders_by_date_range_and_search_query_on_merchant_orders_index_page()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $merchant = Merchant::create([
            'id' => 2,
            'owner_id' => $admin->id,
            'name' => 'EWWON COCO Branch Test',
            'slug' => 'ewwon-coco-branch-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);
        $admin->update(['merchant_id' => $merchant->id]);
        $admin->refresh();

        $branch = Branch::create([
            'merchant_id' => $merchant->id,
            'name' => 'Cabang Test',
            'address' => 'Test Cabang Address',
            'phone' => '0215551234',
            'is_active' => true,
        ]);

        // 1. Order within date range and matches search (Online)
        $order1 = Order::create([
            'customer_id' => User::factory()->create()->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-MATCHING-1',
            'total' => 20000,
            'subtotal' => 20000,
            'discount' => 0,
            'status' => 'pending',
            'payment_method' => 'qris',
            'created_at' => '2026-06-06 12:00:00',
        ]);

        // 2. Order within date range but does NOT match search (Online)
        $order2 = Order::create([
            'customer_id' => User::factory()->create()->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-OTHER-2',
            'total' => 25000,
            'subtotal' => 25000,
            'discount' => 0,
            'status' => 'pending',
            'payment_method' => 'qris',
            'created_at' => '2026-06-06 13:00:00',
        ]);

        // 3. Order outside date range but matches search (POS)
        $order3 = \App\Models\PosTransaction::create([
            'cashier_id' => $admin->id,
            'customer_id' => null,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'transaction_number' => 'POS-MATCHING-3',
            'total' => 30000,
            'discount' => 0,
            'payment_method' => 'cash',
            'customer_name' => 'Budi Walk-in',
            'transaction_at' => '2026-06-04 12:00:00',
            'created_at' => '2026-06-04 12:00:00',
        ]);

        // 4. POS Transaction matching search & inside date range
        $order4 = \App\Models\PosTransaction::create([
            'cashier_id' => $admin->id,
            'customer_id' => null,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'transaction_number' => 'POS-MATCHING-4',
            'total' => 40000,
            'discount' => 0,
            'payment_method' => 'cash',
            'customer_name' => 'Budi Walk-in',
            'transaction_at' => '2026-06-06 14:00:00',
            'created_at' => '2026-06-06 14:00:00',
        ]);

        // Scenario A: Filter only by search = 'MATCHING'
        $response = $this->actingAs($admin)
            ->get(route('admin.orders.index', ['search' => 'MATCHING']));

        $response->assertStatus(200);
        $orders = $response->original->getData()['page']['props']['orders']['data'];
        $this->assertCount(3, $orders); // Should return ORD-MATCHING-1, POS-MATCHING-3, POS-MATCHING-4

        // Scenario B: Filter by date range = '2026-06-05' to '2026-06-07'
        $response = $this->actingAs($admin)
            ->get(route('admin.orders.index', ['start_date' => '2026-06-05', 'end_date' => '2026-06-07']));

        $response->assertStatus(200);
        $orders = $response->original->getData()['page']['props']['orders']['data'];
        $this->assertCount(3, $orders); // Should return ORD-MATCHING-1, ORD-OTHER-2, POS-MATCHING-4 (not POS-MATCHING-3)

        // Scenario C: Filter by date range and search combined
        $response = $this->actingAs($admin)
            ->get(route('admin.orders.index', [
                'start_date' => '2026-06-05',
                'end_date' => '2026-06-07',
                'search' => 'MATCHING'
            ]));

        $response->assertStatus(200);
        $orders = $response->original->getData()['page']['props']['orders']['data'];
        $this->assertCount(2, $orders); // Should return ORD-MATCHING-1, POS-MATCHING-4
    }

    /** @test */
    public function it_filters_orders_by_date_range_and_search_query_on_super_admin_orders_page()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin', 'is_active' => true]);
        
        $merchant = Merchant::create([
            'id' => 10,
            'owner_id' => User::factory()->create()->id,
            'name' => 'EWWON COCO Super Test',
            'slug' => 'ewwon-coco-super-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        $branch = Branch::create([
            'merchant_id' => $merchant->id,
            'name' => 'Cabang Super Test',
            'address' => 'Test Cabang Address',
            'phone' => '0215551234',
            'is_active' => true,
        ]);

        // 1. Order inside date range, matches search
        $order1 = Order::create([
            'customer_id' => User::factory()->create()->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-SUPER-1',
            'total' => 20000,
            'subtotal' => 20000,
            'discount' => 0,
            'status' => 'pending',
            'payment_method' => 'qris',
        ]);
        $order1->created_at = '2026-06-06 12:00:00';
        $order1->save();

        // 2. Order inside date range, does NOT match search
        $order2 = Order::create([
            'customer_id' => User::factory()->create()->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-OTHER-SUPER-2',
            'total' => 25000,
            'subtotal' => 25000,
            'discount' => 0,
            'status' => 'pending',
            'payment_method' => 'qris',
        ]);
        $order2->created_at = '2026-06-06 13:00:00';
        $order2->save();

        // 3. Order outside date range, matches search
        $order3 = Order::create([
            'customer_id' => User::factory()->create()->id,
            'merchant_id' => $merchant->id,
            'branch_id' => $branch->id,
            'order_number' => 'ORD-SUPER-3',
            'total' => 30000,
            'subtotal' => 30000,
            'discount' => 0,
            'status' => 'pending',
            'payment_method' => 'qris',
        ]);
        $order3->created_at = '2026-06-04 12:00:00';
        $order3->save();

        // Test Global Orders View Filters (selectedBranchId is null)
        // Scenario A: Filter by search
        $response = $this->actingAs($superAdmin)
            ->get(route('superadmin.orders', ['search' => 'ORD-SUPER']));
        
        $response->assertStatus(200);
        $orders = $response->original->getData()['page']['props']['orders']['data'];
        $this->assertCount(2, $orders); // Should return ORD-SUPER-1, ORD-SUPER-3

        // Scenario B: Filter by date range
        $response = $this->actingAs($superAdmin)
            ->get(route('superadmin.orders', ['start_date' => '2026-06-05', 'end_date' => '2026-06-07']));
        
        $response->assertStatus(200);
        $orders = $response->original->getData()['page']['props']['orders']['data'];
        $this->assertCount(2, $orders); // Should return ORD-SUPER-1, ORD-OTHER-SUPER-2

        // Test Branch Detailed Orders View Filters (selectedBranchId is active)
        // Scenario C: Combined filter with branch
        $response = $this->actingAs($superAdmin)
            ->get(route('superadmin.orders', [
                'branch_id' => $branch->id,
                'start_date' => '2026-06-05',
                'end_date' => '2026-06-07',
                'search' => 'ORD-SUPER'
            ]));
        
        $response->assertStatus(200);
        $combinedOrders = $response->original->getData()['page']['props']['branchDetail']['combinedOrders']['data'];
        $this->assertCount(1, $combinedOrders); // Should return ORD-SUPER-1 only
        $this->assertEquals('ORD-SUPER-1', $combinedOrders[0]['order_number']);
    }

    /** @test */
    public function it_allows_pos_checkout_when_stock_is_depleted()
    {
        $cashier = User::factory()->create(['role' => 'kasir', 'is_active' => true, 'merchant_id' => null]);

        $merchant = Merchant::create([
            'id' => 3,
            'owner_id' => $cashier->id,
            'name' => 'EWWON COCO POS Stock Test',
            'slug' => 'ewwon-coco-pos-stock-test',
            'category' => 'F&B',
            'address' => 'Test Address',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        $cashier->update(['merchant_id' => $merchant->id]);

        $branch = Branch::create([
            'merchant_id' => $merchant->id,
            'name' => 'Cabang POS Stock Test',
            'address' => 'Test Cabang Address',
            'phone' => '0215551234',
            'is_active' => true,
        ]);

        \App\Models\PosShift::create([
            'cashier_id' => $cashier->id,
            'branch_id' => $branch->id,
            'opened_at' => now(),
            'opening_cash' => 100000,
        ]);

        // 1. Product without recipe, starting stock = 0
        $productNoRecipe = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Es Kelapa No Recipe',
            'slug' => 'es-kelapa-no-recipe',
            'price' => 15000,
            'stock' => 0,
            'is_available' => true,
        ]);

        // 2. Product with recipe, ingredient stock = 0
        $productWithRecipe = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Es Kelapa With Recipe',
            'slug' => 'es-kelapa-with-recipe',
            'price' => 20000,
            'is_available' => true,
        ]);

        $ingredient = Ingredient::create([
            'merchant_id' => $merchant->id,
            'name' => 'Kelapa POS',
            'unit' => 'gram',
        ]);

        Recipe::create([
            'product_id' => $productWithRecipe->id,
            'ingredient_id' => $ingredient->id,
            'quantity' => 100, // Needs 100g
        ]);

        $branchIngredient = BranchIngredient::create([
            'branch_id' => $branch->id,
            'ingredient_id' => $ingredient->id,
            'stock' => 0, // 0 stock
        ]);

        // Place transaction in POS
        $response = $this->actingAs($cashier)
            ->postJson('/pos/store', [
                'customer_name' => 'Budi POS Customer',
                'payment_method' => 'cash',
                'items' => [
                    [
                        'product' => ['id' => $productNoRecipe->id, 'price' => 15000],
                        'quantity' => 1,
                    ],
                    [
                        'product' => ['id' => $productWithRecipe->id, 'price' => 20000],
                        'quantity' => 1,
                    ]
                ]
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Assert no-recipe product stock is now negative (-1)
        $productNoRecipe->refresh();
        $this->assertEquals(-1, $productNoRecipe->stock);

        // Assert recipe ingredient stock is now negative (-100)
        $branchIngredient->refresh();
        $this->assertEquals(-100, $branchIngredient->stock);
    }
}
