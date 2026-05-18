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
        // 1. Tabel Master Bahan Baku
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained()->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('unit', 50); // pcs, ml, gr, kg, etc.
            $table->timestamps();
        });

        // 2. Tabel Stok per Cabang
        Schema::create('branch_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ingredient_id')->constrained()->cascadeOnDelete();
            $table->decimal('stock', 15, 2)->default(0);
            $table->decimal('min_stock', 15, 2)->default(0);
            $table->decimal('average_cost', 15, 2)->default(0);
            $table->timestamps();
        });

        // 3. Tabel Resep (BOM)
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ingredient_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 15, 4); // Misal: 0.25 kg
            $table->timestamps();
        });

        // 4. Tabel Histori Pergerakan Stok
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ingredient_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['IN', 'OUT', 'ADJUST']);
            $table->decimal('quantity', 15, 2);
            $table->string('reference_id')->nullable();
            $table->string('reference_type')->nullable(); // Order, PosTransaction, Purchase
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('recipes');
        Schema::dropIfExists('branch_ingredients');
        Schema::dropIfExists('ingredients');
    }
};
