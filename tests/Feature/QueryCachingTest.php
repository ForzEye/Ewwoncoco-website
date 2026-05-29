<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Merchant;
use App\Models\ProductCategory;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class QueryCachingTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_caches_active_outlets_categories_and_promotions()
    {
        $user = User::factory()->create();

        // Setup mock data
        $merchant = Merchant::create([
            'owner_id' => $user->id,
            'name' => 'EWWON COCO Pusat',
            'slug' => 'ewwon-coco-pusat',
            'category' => 'F&B',
            'address' => 'Jl. Sudirman',
            'phone' => '0215551234',
            'operational_hours' => [],
            'is_active' => true,
        ]);

        Branch::create([
            'merchant_id' => $merchant->id,
            'name' => 'Cabang Utama',
            'address' => 'Address',
            'phone' => '123',
            'lat' => -6.2,
            'lng' => 106.8,
            'is_active' => true,
        ]);

        ProductCategory::create([
            'merchant_id' => $merchant->id,
            'name' => 'Kategori 1',
        ]);

        Promotion::create([
            'merchant_id' => $merchant->id,
            'name' => 'Promo 1',
            'type' => 'cashback_points',
            'value' => 10,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(5),
            'is_active' => true,
        ]);

        // Clean cache
        Cache::flush();

        // 1. Trigger HTTP API Requests
        $this->getJson('/api/v1/outlets')->assertStatus(200);
        $this->getJson('/api/v1/categories')->assertStatus(200);
        $this->getJson('/api/v1/promos')->assertStatus(200);

        // 2. Assert cache key availability
        $this->assertTrue(Cache::has('outlets_active'));
        $this->assertTrue(Cache::has('product_categories'));
        $this->assertTrue(Cache::has('promotions_active'));
    }
}
