<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add payment_proof_url
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_proof_url')->nullable()->after('payment_status');
        });

        // Change payment_method enum
        // Since SQLite doesn't support changing enum directly, and we are using MySQL
        // We use raw SQL for MySQL
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('qris', 'manual_transfer') NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('payment_proof_url');
        });

        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('qris', 'cash') NOT NULL");
        }
    }
};
