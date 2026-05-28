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
            $table->integer('receipt_font_size')->default(9)->after('receipt_footer');
            $table->string('receipt_paper_width', 10)->default('58mm')->after('receipt_font_size');
            $table->boolean('receipt_extra_bold')->default(false)->after('receipt_paper_width');
            $table->integer('receipt_left_margin')->default(0)->after('receipt_extra_bold');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            $table->dropColumn([
                'receipt_font_size',
                'receipt_paper_width',
                'receipt_extra_bold',
                'receipt_left_margin'
            ]);
        });
    }
};
