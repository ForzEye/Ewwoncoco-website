<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('orders')
            ->whereIn('status', ['confirmed', 'preparing', 'ready_for_pickup', 'on_delivery', 'delivered'])
            ->where('payment_status', 'pending')
            ->update(['payment_status' => 'confirmed']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No rollback needed for data fixes
    }
};
