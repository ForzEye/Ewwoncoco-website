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
        Schema::table('merchants', function (Blueprint $table) {
            $table->text('receipt_header')->nullable()->after('qris_image_url');
            $table->text('receipt_footer')->nullable()->after('receipt_header');
            $table->string('instagram_handle', 100)->nullable()->after('receipt_footer');
            $table->string('whatsapp_number', 20)->nullable()->after('instagram_handle');
            $table->string('tiktok_handle', 100)->nullable()->after('whatsapp_number');
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group', 50)->default('general');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        
        Schema::table('merchants', function (Blueprint $table) {
            $table->dropColumn(['receipt_header', 'receipt_footer', 'instagram_handle', 'whatsapp_number', 'tiktok_handle']);
        });
    }
};
