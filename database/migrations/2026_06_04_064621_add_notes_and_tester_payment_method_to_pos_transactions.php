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
        Schema::table('pos_transactions', function (Blueprint $table) {
            if (config('database.default') === 'mysql') {
                DB::statement("ALTER TABLE pos_transactions MODIFY COLUMN payment_method ENUM('cash', 'qris', 'tester') NOT NULL");
            } else {
                $table->string('payment_method')->change();
            }

            if (! Schema::hasColumn('pos_transactions', 'notes')) {
                $table->text('notes')->nullable()->after('change_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_transactions', function (Blueprint $table) {
            if (config('database.default') === 'mysql') {
                DB::statement("ALTER TABLE pos_transactions MODIFY COLUMN payment_method ENUM('cash', 'qris') NOT NULL");
            } else {
                $table->string('payment_method')->change();
            }

            if (Schema::hasColumn('pos_transactions', 'notes')) {
                $table->dropColumn('notes');
            }
        });
    }
};
