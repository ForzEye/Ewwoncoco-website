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
            $table->integer('void_count')->default(0)->after('closing_cash');
            $table->boolean('is_locked')->default(false)->after('void_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_shifts', function (Blueprint $table) {
            $table->dropColumn(['void_count', 'is_locked']);
        });
    }
};
