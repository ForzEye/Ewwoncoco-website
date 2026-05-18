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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('cashier_id')->nullable()->after('branch_id')->constrained('users')->nullOnDelete();
            $table->foreignId('shift_id')->nullable()->after('cashier_id')->constrained('pos_shifts')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['cashier_id']);
            $table->dropColumn('cashier_id');
            $table->dropForeign(['shift_id']);
            $table->dropColumn('shift_id');
        });
    }
};
