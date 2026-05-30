<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pos_transaction_items', function (Blueprint $table) {
            if (! Schema::hasColumn('pos_transaction_items', 'notes')) {
                $table->text('notes')->nullable()->after('subtotal');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pos_transaction_items', function (Blueprint $table) {
            $table->dropColumn('notes');
        });
    }
};
