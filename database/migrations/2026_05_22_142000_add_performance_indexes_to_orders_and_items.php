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
        Schema::table('orders', function (Blueprint $table) {
            // Indeks komposit untuk mempercepat pencarian riwayat pesanan (where customer_id order by created_at desc)
            $table->index(['customer_id', 'created_at'], 'orders_customer_created_idx');

            // Indeks pada branch_id untuk menyaring pesanan per cabang dengan cepat di sistem kasir/POS
            $table->index('branch_id', 'orders_branch_id_idx');

            // Indeks pada status untuk memfasilitasi pelacakan status pesanan real-time di dasbor
            $table->index('status', 'orders_status_idx');
        });

        Schema::table('order_items', function (Blueprint $table) {
            // Indeks kunci asing untuk mempercepat join kueri item dari transaksi pesanan
            $table->index('order_id', 'order_items_order_id_idx');
            $table->index('product_id', 'order_items_product_id_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_customer_created_idx');
            $table->dropIndex('orders_branch_id_idx');
            $table->dropIndex('orders_status_idx');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('order_items_order_id_idx');
            $table->dropIndex('order_items_product_id_idx');
        });
    }
};
