<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pos_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('pos_transactions', 'customer_id')) {
                $table->foreignId('customer_id')->nullable()->after('cashier_id')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('pos_transactions', 'discount')) {
                $table->integer('discount')->default(0)->after('total');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pos_transactions', function (Blueprint $table) {
            $table->dropColumn(['customer_id', 'discount']);
        });
    }
};
