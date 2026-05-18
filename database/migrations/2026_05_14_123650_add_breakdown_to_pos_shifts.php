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
        Schema::table('pos_shifts', function (Blueprint $table) {
            $table->decimal('closing_qris', 15, 2)->default(0)->after('closing_cash');
            $table->decimal('closing_online', 15, 2)->default(0)->after('closing_qris');
            $table->decimal('closing_grab', 15, 2)->default(0)->after('closing_online');
            $table->decimal('closing_gojek', 15, 2)->default(0)->after('closing_grab');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_shifts', function (Blueprint $table) {
            $table->dropColumn(['closing_qris', 'closing_online', 'closing_grab', 'closing_gojek']);
        });
    }
};
