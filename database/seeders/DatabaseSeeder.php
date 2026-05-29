<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Merchant;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Users
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@ewwoncoco.id',
            'password' => Hash::make('SuperAdmin@123'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        $admin = User::create([
            'name' => 'Admin Owner',
            'email' => 'admin@ewwoncoco.id',
            'password' => Hash::make('Admin@123456'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $kasir = User::create([
            'name' => 'Kasir Utama',
            'email' => 'kasir@ewwoncoco.id',
            'password' => Hash::make('Kasir@123456'),
            'role' => 'kasir',
            'is_active' => true,
        ]);

        $customer1 = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@customer.com',
            'phone' => '081234567890',
            'password' => Hash::make('Customer@123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $customer2 = User::create([
            'name' => 'Sari Indah',
            'email' => 'sari@customer.com',
            'phone' => '081987654321',
            'password' => Hash::make('Customer@123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        // 2. Create Merchant
        $merchant = Merchant::create([
            'owner_id' => $admin->id,
            'name' => 'EWWON COCO Pusat',
            'slug' => 'ewwon-coco-pusat',
            'category' => 'F&B',
            'address' => 'Jl. Sudirman No. 123, Jakarta Pusat',
            'phone' => '0215551234',
            'operational_hours' => [
                'mon' => ['open' => '08:00', 'close' => '22:00'],
                'tue' => ['open' => '08:00', 'close' => '22:00'],
                'wed' => ['open' => '08:00', 'close' => '22:00'],
                'thu' => ['open' => '08:00', 'close' => '22:00'],
                'fri' => ['open' => '08:00', 'close' => '23:00'],
                'sat' => ['open' => '09:00', 'close' => '23:00'],
                'sun' => ['open' => '09:00', 'close' => '21:00'],
            ],
            'is_active' => true,
        ]);

        // Link users to merchant
        $admin->update(['merchant_id' => $merchant->id]);
        $kasir->update(['merchant_id' => $merchant->id]);

        // 3. Create Branches
        $branch1 = Branch::create([
            'merchant_id' => $merchant->id,
            'name' => 'Cabang Utama',
            'address' => 'Jl. Sudirman No. 123, Jakarta Pusat',
            'phone' => '0215551234',
            'lat' => -6.2088,
            'lng' => 106.8456,
            'is_active' => true,
        ]);

        // 4. Create Product Categories
        $catMinuman = ProductCategory::create([
            'merchant_id' => $merchant->id,
            'name' => 'Minuman Kelapa',
            'icon' => 'CupSoda',
            'order' => 1,
        ]);

        $catDessert = ProductCategory::create([
            'merchant_id' => $merchant->id,
            'name' => 'Dessert',
            'icon' => 'IceCream',
            'order' => 2,
        ]);

        // 5. Create Products
        $p1 = Product::create([
            'merchant_id' => $merchant->id,
            'category_id' => $catMinuman->id,
            'name' => 'Es Kelapa Muda Original',
            'slug' => 'es-kelapa-muda-original',
            'description' => 'Es kelapa muda asli yang menyegarkan dengan tambahan gula aren pilihan.',
            'price' => 15000,
            'image_url' => 'https://s3.morrbali.com/ewwoncoco/products/coconut_original.png',
            'barcode' => '899123456001',
            'stock' => 100,
            'min_stock' => 10,
            'is_available' => true,
        ]);

        $p2 = Product::create([
            'merchant_id' => $merchant->id,
            'category_id' => $catMinuman->id,
            'name' => 'Kelapa Jeruk Nipis',
            'slug' => 'kelapa-jeruk-nipis',
            'description' => 'Perpaduan air kelapa murni dengan kesegaran jeruk nipis asli.',
            'price' => 18000,
            'image_url' => 'https://s3.morrbali.com/ewwoncoco/products/coconut_lime.png',
            'barcode' => '899123456002',
            'stock' => 80,
            'min_stock' => 10,
            'is_available' => true,
        ]);

        Product::create([
            'merchant_id' => $merchant->id,
            'category_id' => $catDessert->id,
            'name' => 'Puding Kelapa',
            'slug' => 'puding-kelapa',
            'description' => 'Puding lembut yang terbuat dari air dan daging kelapa muda pilihan.',
            'price' => 25000,
            'image_url' => 'https://s3.morrbali.com/ewwoncoco/products/coconut_pudding.png',
            'barcode' => '899123456003',
            'stock' => 50,
            'min_stock' => 5,
            'is_available' => true,
        ]);

        // 6. Create Vouchers
        Voucher::create([
            'merchant_id' => $merchant->id,
            'code' => 'COCO10',
            'discount_type' => 'percent',
            'discount_value' => 10,
            'min_purchase' => 50000,
            'usage_limit' => 100,
            'used_count' => 0,
            'is_active' => true,
        ]);

        Voucher::create([
            'merchant_id' => $merchant->id,
            'code' => 'COCOGRATIS',
            'discount_type' => 'fixed',
            'discount_value' => 25000,
            'min_purchase' => 150000,
            'usage_limit' => 50,
            'used_count' => 0,
            'is_active' => true,
        ]);

        Voucher::create([
            'merchant_id' => $merchant->id,
            'code' => 'NEWCUSTOMER',
            'discount_type' => 'percent',
            'discount_value' => 15,
            'min_purchase' => 0,
            'usage_limit' => null,
            'used_count' => 0,
            'is_active' => true,
        ]);

        // 7. Create Customizations & Options
        $cIce = \App\Models\Customization::create([
            'merchant_id' => $merchant->id,
            'name' => 'Pilih Ice',
            'type' => 'single',
            'is_required' => true,
            'is_active' => true,
        ]);
        $cIce->options()->createMany([
            ['name' => 'Normal Ice', 'price' => 0],
            ['name' => 'Less Ice', 'price' => 0],
            ['name' => 'No Ice', 'price' => 0],
        ]);

        $cSugar = \App\Models\Customization::create([
            'merchant_id' => $merchant->id,
            'name' => 'Pilih Sugar',
            'type' => 'single',
            'is_required' => true,
            'is_active' => true,
        ]);
        $cSugar->options()->createMany([
            ['name' => 'Normal Sugar', 'price' => 0],
            ['name' => 'Less Sugar', 'price' => 0],
            ['name' => 'No Sugar', 'price' => 0],
        ]);

        $cToppings = \App\Models\Customization::create([
            'merchant_id' => $merchant->id,
            'name' => 'Tambah Topping',
            'type' => 'multiple',
            'is_required' => false,
            'is_active' => true,
        ]);
        $cToppings->options()->createMany([
            ['name' => 'Grass Jelly', 'price' => 3000],
            ['name' => 'Boba', 'price' => 2000],
            ['name' => 'Coconut Jelly', 'price' => 4000],
        ]);

        // Link customizations to products
        $p1->customizations()->sync([$cIce->id, $cSugar->id, $cToppings->id]);
        $p2->customizations()->sync([$cIce->id, $cSugar->id, $cToppings->id]);
    }
}
