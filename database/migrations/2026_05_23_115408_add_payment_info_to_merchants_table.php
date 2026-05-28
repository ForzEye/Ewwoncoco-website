<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            // Add bank transfer fields (qris_image_url already exists from initial migration)
            $table->string('bank_name', 50)->nullable()->after('qris_image_url')->comment('Nama bank (BCA, Mandiri, dst)');
            $table->string('bank_account_number', 30)->nullable()->after('bank_name')->comment('Nomor rekening transfer');
            $table->string('bank_account_name', 100)->nullable()->after('bank_account_number')->comment('Nama pemilik rekening');
        });
    }

    public function down(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            $table->dropColumn(['bank_name', 'bank_account_number', 'bank_account_name']);
        });
    }
};
