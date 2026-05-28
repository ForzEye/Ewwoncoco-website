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
        Schema::table('promotions', function (Blueprint $table) {
            // We can change type by modifying the enum column to a regular string column
            // so we don't have compatibility issues with SQLite/MySQL when modifying enum.
            $table->string('type')->change();

            // Add fields for BOGO (Buy One Get One)
            $table->foreignId('buy_product_id')->nullable()->constrained('products')->onDelete('cascade');
            $table->foreignId('get_product_id')->nullable()->constrained('products')->onDelete('cascade');
            $table->integer('buy_quantity')->nullable()->default(1);
            $table->integer('get_quantity')->nullable()->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->dropForeign(['buy_product_id']);
            $table->dropForeign(['get_product_id']);
            $table->dropColumn(['buy_product_id', 'get_product_id', 'buy_quantity', 'get_quantity']);
            
            // Revert type back to enum if needed, but keeping it as string is usually fine.
        });
    }
};
