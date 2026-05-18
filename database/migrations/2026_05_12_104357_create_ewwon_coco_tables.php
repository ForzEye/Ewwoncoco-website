<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Modifikasi tabel users
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->unique()->nullable()->after('email');
            $table->enum('role', ['super_admin', 'admin', 'kasir', 'customer'])->default('customer')->after('password');
            $table->string('avatar_url')->nullable()->after('role');
            $table->string('google_id')->nullable()->after('avatar_url');
            $table->boolean('is_active')->default(true)->after('google_id');
        });

        // 2. Tabel otp_codes
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('code', 6);
            $table->enum('type', ['login', 'register', 'reset_password']);
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);
            $table->timestamps();
        });

        // 3. Tabel merchants
        Schema::create('merchants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->string('category', 50);
            $table->text('address');
            $table->string('phone', 20);
            $table->json('operational_hours');
            $table->string('qris_image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Tabel branches
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->text('address');
            $table->string('phone', 20);
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 5. Tabel product_categories
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained()->cascadeOnDelete();
            $table->string('name', 80);
            $table->string('icon', 50)->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 6. Tabel products
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('product_categories')->nullOnDelete();
            $table->string('name', 150);
            $table->string('slug', 150);
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('image_url')->nullable();
            $table->string('barcode', 50)->nullable();
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(5);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });

        // 7. Tabel orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users');
            $table->foreignId('merchant_id')->constrained();
            $table->foreignId('branch_id')->constrained();
            $table->string('order_number', 20)->unique();
            $table->enum('status', ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'on_delivery', 'delivered', 'cancelled'])->default('pending');
            $table->enum('payment_method', ['qris', 'cash']);
            $table->enum('payment_status', ['pending', 'confirmed', 'failed'])->default('pending');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('delivery_fee', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->text('delivery_address')->nullable();
            $table->decimal('delivery_lat', 10, 8)->nullable();
            $table->decimal('delivery_lng', 11, 8)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 8. Tabel order_items
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 9. Tabel delivery_requests
        Schema::create('delivery_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->enum('provider', ['gosend', 'grabexpress']);
            $table->string('provider_order_id', 100)->nullable();
            $table->enum('status', ['requesting', 'finding_driver', 'on_pickup', 'on_delivery', 'delivered', 'cancelled'])->default('requesting');
            $table->decimal('delivery_fee', 12, 2);
            $table->string('driver_name', 100)->nullable();
            $table->string('driver_phone', 20)->nullable();
            $table->string('driver_photo')->nullable();
            $table->decimal('driver_lat', 10, 8)->nullable();
            $table->decimal('driver_lng', 11, 8)->nullable();
            $table->timestamp('estimated_arrival')->nullable();
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });

        // 10. Tabel pos_shifts
        Schema::create('pos_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashier_id')->constrained('users');
            $table->foreignId('branch_id')->constrained();
            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();
            $table->decimal('opening_cash', 12, 2);
            $table->decimal('closing_cash', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 11. Tabel pos_transactions
        Schema::create('pos_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained();
            $table->foreignId('branch_id')->constrained();
            $table->foreignId('cashier_id')->constrained('users');
            $table->foreignId('shift_id')->nullable()->constrained('pos_shifts');
            $table->string('transaction_number', 20)->unique();
            $table->enum('payment_method', ['cash', 'qris']);
            $table->decimal('total', 12, 2);
            $table->decimal('cash_received', 12, 2)->nullable();
            $table->decimal('change_amount', 12, 2)->nullable();
            $table->timestamp('transaction_at')->useCurrent();
            $table->timestamps();
        });

        // 12. Tabel pos_transaction_items
        Schema::create('pos_transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('pos_transactions')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });

        // 13. Tabel vouchers
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained()->cascadeOnDelete();
            $table->string('code', 30)->unique();
            $table->enum('discount_type', ['percent', 'fixed']);
            $table->decimal('discount_value', 10, 2);
            $table->decimal('min_purchase', 12, 2)->default(0);
            $table->decimal('max_discount', 12, 2)->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 14. Tabel loyalty_points
        Schema::create('loyalty_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('merchant_id')->constrained()->cascadeOnDelete();
            $table->integer('points');
            $table->enum('transaction_type', ['earn', 'redeem', 'expired']);
            $table->string('reference_type', 30)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('description', 150)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 15. Tabel reviews
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('merchant_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('loyalty_points');
        Schema::dropIfExists('vouchers');
        Schema::dropIfExists('pos_transaction_items');
        Schema::dropIfExists('pos_transactions');
        Schema::dropIfExists('pos_shifts');
        Schema::dropIfExists('delivery_requests');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('product_categories');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('merchants');
        Schema::dropIfExists('otp_codes');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role', 'avatar_url', 'google_id', 'is_active']);
        });
    }
};
