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
        Schema::table('pos_transactions', function (Blueprint $table) {
            $table->enum('manual_discount_type', ['percent', 'fixed'])->nullable();
            $table->decimal('manual_discount_value', 15, 2)->nullable();
            $table->string('discount_reason')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_transactions', function (Blueprint $table) {
            $table->dropColumn(['manual_discount_type', 'manual_discount_value', 'discount_reason']);
        });
    }
};
