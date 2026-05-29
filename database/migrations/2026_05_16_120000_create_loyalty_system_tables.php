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
        // 1. Tabel user_points_balance (cached balance per user)
        if (! Schema::hasTable('user_points_balance')) {
            Schema::create('user_points_balance', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->integer('balance')->default(0);
                $table->timestamps();

                $table->unique('user_id');
            });
        }

        // 2. Tabel referrals
        if (! Schema::hasTable('referrals')) {
            Schema::create('referrals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('referee_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('referral_code', 10)->unique();
                $table->boolean('is_used')->default(false);
                $table->timestamps();

                $table->index('referrer_id');
                $table->index('referral_code');
            });
        }

        // 3. Update reviews table - add referral_code field ke users (only if not exists)
        if (! Schema::hasColumn('users', 'referral_code')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('referral_code', 10)->nullable()->unique()->after('is_active');
            });
        }

        // 4. Modify loyalty_points untuk align dengan design baru
        // 5. Add indexes ke loyalty_points untuk performa (only if table exists)
        if (Schema::hasTable('loyalty_points')) {
            Schema::table('loyalty_points', function (Blueprint $table) {
                // We use try-catch or individual checks for indexes if needed,
                // but usually, we just check column existence for index fields.
                $table->index(['customer_id', 'transaction_type'], 'lp_cust_type_idx');
                $table->index('created_at', 'lp_created_at_idx');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('referral_code');
        });

        Schema::dropIfExists('referrals');
        Schema::dropIfExists('user_points_balance');
    }
};
