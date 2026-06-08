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
        Schema::table('promotions', function (Blueprint $table) {
            $table->boolean('is_new_member_only')->default(false)->after('is_active');
            $table->integer('max_free_qty')->nullable()->after('get_quantity');
            $table->unsignedBigInteger('upgrade_from_option_id')->nullable()->after('applicable_on');
            $table->unsignedBigInteger('upgrade_to_option_id')->nullable()->after('upgrade_from_option_id');

            $table->foreign('upgrade_from_option_id')->references('id')->on('customization_options')->nullOnDelete();
            $table->foreign('upgrade_to_option_id')->references('id')->on('customization_options')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->dropForeign(['upgrade_from_option_id']);
            $table->dropForeign(['upgrade_to_option_id']);
            
            $table->dropColumn([
                'is_new_member_only',
                'max_free_qty',
                'upgrade_from_option_id',
                'upgrade_to_option_id',
            ]);
        });
    }
};
