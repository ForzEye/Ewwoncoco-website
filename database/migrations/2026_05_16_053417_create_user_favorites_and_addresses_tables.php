<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // User Favorites
        Schema::create('user_favorites', function (Blueprint $row) {
            $row->id();
            $row->foreignId('user_id')->constrained()->onDelete('cascade');
            $row->foreignId('product_id')->constrained()->onDelete('cascade');
            $row->timestamps();
            
            $row->unique(['user_id', 'product_id']);
        });

        // Saved Addresses
        Schema::create('user_addresses', function (Blueprint $row) {
            $row->id();
            $row->foreignId('user_id')->constrained()->onDelete('cascade');
            $row->string('label'); // e.g. Home, Office, Apartment
            $row->text('address');
            $row->string('receiver_name')->nullable();
            $row->string('receiver_phone')->nullable();
            $row->decimal('latitude', 10, 8)->nullable();
            $row->decimal('longitude', 11, 8)->nullable();
            $row->boolean('is_default')->default(false);
            $row->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
        Schema::dropIfExists('user_favorites');
    }
};
