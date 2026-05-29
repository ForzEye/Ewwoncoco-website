<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Point settings - using app_settings table with group='point'
        // Insert default settings

        DB::table('app_settings')->insert([
            [
                'key' => 'point_per_rupiah',
                'value' => '20000',
                'type' => 'number',
                'group' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'referral_reward_points',
                'value' => '20',
                'type' => 'number',
                'group' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'minimum_redeem_points',
                'value' => '10',
                'type' => 'number',
                'group' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'point_to_discount_ratio',
                'value' => '1000',
                'type' => 'number',
                'group' => 'point',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('app_settings')->where('group', 'point')->delete();
    }
};
