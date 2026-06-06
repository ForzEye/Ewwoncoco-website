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
            if (!Schema::hasColumn('pos_transactions', 'customer_name')) {
                $table->string('customer_name')->nullable()->after('customer_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_transactions', function (Blueprint $table) {
            if (Schema::hasColumn('pos_transactions', 'customer_name')) {
                $table->dropColumn('customer_name');
            }
        });
    }
};
