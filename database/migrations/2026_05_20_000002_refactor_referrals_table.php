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
        Schema::table('referrals', function (Blueprint $table) {
            // Drop index and unique constraint first to avoid SQLite issues
            try {
                $table->dropIndex('referrals_referral_code_index');
            } catch (\Exception $e) {}
            try {
                $table->dropUnique('referrals_referral_code_unique');
            } catch (\Exception $e) {}
        });

        Schema::table('referrals', function (Blueprint $table) {
            $table->dropColumn(['referral_code', 'is_used']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('referrals', function (Blueprint $table) {
            $table->string('referral_code', 10)->nullable();
            $table->boolean('is_used')->default(false);
        });
    }
};

