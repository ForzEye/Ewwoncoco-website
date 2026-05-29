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
        // 1. Table for customization groups (e.g. Choose Sugar, Choose Ice, Add Toppings)
        Schema::create('customizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->enum('type', ['single', 'multiple'])->default('single');
            $table->boolean('is_required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Table for customization option values (e.g. Less Ice, Normal Sugar, Grass Jelly)
        Schema::create('customization_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customization_id')->constrained('customizations')->cascadeOnDelete();
            $table->string('name', 100);
            $table->decimal('price', 12, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Pivot table linking products and customizations
        Schema::create('product_customizations', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customization_id')->constrained('customizations')->cascadeOnDelete();
            $table->primary(['product_id', 'customization_id']);
        });

        // 4. Add transactional snapshot columns
        Schema::table('order_items', function (Blueprint $table) {
            $table->json('customizations')->nullable()->after('notes');
        });

        Schema::table('pos_transaction_items', function (Blueprint $table) {
            $table->json('customizations')->nullable()->after('subtotal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_transaction_items', function (Blueprint $table) {
            $table->dropColumn('customizations');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('customizations');
        });

        Schema::dropIfExists('product_customizations');
        Schema::dropIfExists('customization_options');
        Schema::dropIfExists('customizations');
    }
};
