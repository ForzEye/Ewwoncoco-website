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
        Schema::table('otp_codes', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('identifier')->after('user_id')->comment('Email or Phone Number');
            $table->enum('channel', ['email', 'whatsapp'])->default('email')->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('otp_codes', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->dropColumn(['identifier', 'channel']);
        });
    }
};
