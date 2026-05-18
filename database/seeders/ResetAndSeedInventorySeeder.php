<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PosTransaction;
use App\Models\PosTransactionItem;
use App\Models\PosShift;
use App\Models\LoyaltyPoint;
use App\Models\StockMovement;
use App\Models\Review;
use App\Models\Ingredient;
use App\Models\Recipe;
use App\Models\BranchIngredient;
use App\Models\Product;
use App\Models\Branch;

class ResetAndSeedInventorySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Reset Sales Data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        Order::truncate();
        OrderItem::truncate();
        PosTransaction::truncate();
        PosTransactionItem::truncate();
        PosShift::truncate();
        LoyaltyPoint::truncate();
        StockMovement::truncate();
        Review::truncate();
        
        // Also clear inventory related to start fresh
        Ingredient::truncate();
        Recipe::truncate();
        BranchIngredient::truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $merchantId = 1; // Default merchant
        $branches = Branch::where('merchant_id', $merchantId)->get();

        // 2. Seed Basic Ingredients
        $ingredientsData = [
            ['name' => 'Air Kelapa Murni', 'unit' => 'ml'],
            ['name' => 'Daging Kelapa Muda', 'unit' => 'gr'],
            ['name' => 'Jeruk Peras', 'unit' => 'pcs'],
            ['name' => 'Gula Cair', 'unit' => 'ml'],
            ['name' => 'Susu Kental Manis', 'unit' => 'ml'],
            ['name' => 'Bubuk Jelly', 'unit' => 'gr'],
            ['name' => 'Cup Ewwon 16oz', 'unit' => 'pcs'],
            ['name' => 'Sedotan Bambu', 'unit' => 'pcs'],
        ];

        foreach ($ingredientsData as $data) {
            $ingredient = Ingredient::create([
                'merchant_id' => $merchantId,
                'name' => $data['name'],
                'unit' => $data['unit'],
            ]);

            // 3. Initialize Branch Stock
            foreach ($branches as $branch) {
                BranchIngredient::create([
                    'branch_id' => $branch->id,
                    'ingredient_id' => $ingredient->id,
                    'stock' => 10000, // Initial high stock for testing
                    'min_stock' => 500,
                    'average_cost' => rand(100, 5000),
                ]);
            }
        }

        // 4. Seed Recipes for existing Products
        $products = Product::where('merchant_id', $merchantId)->get();
        $ingMap = Ingredient::pluck('id', 'name');

        foreach ($products as $product) {
            $name = strtolower($product->name);
            
            // Default: Every product uses a Cup and a Straw
            Recipe::create(['product_id' => $product->id, 'ingredient_id' => $ingMap['Cup Ewwon 16oz'], 'quantity' => 1]);
            Recipe::create(['product_id' => $product->id, 'ingredient_id' => $ingMap['Sedotan Bambu'], 'quantity' => 1]);

            if (str_contains($name, 'kelapa')) {
                Recipe::create(['product_id' => $product->id, 'ingredient_id' => $ingMap['Air Kelapa Murni'], 'quantity' => 250]);
                Recipe::create(['product_id' => $product->id, 'ingredient_id' => $ingMap['Daging Kelapa Muda'], 'quantity' => 50]);
            }

            if (str_contains($name, 'jeruk')) {
                Recipe::create(['product_id' => $product->id, 'ingredient_id' => $ingMap['Jeruk Peras'], 'quantity' => 2]);
            }

            if (str_contains($name, 'shake') || str_contains($name, 'susu')) {
                Recipe::create(['product_id' => $product->id, 'ingredient_id' => $ingMap['Susu Kental Manis'], 'quantity' => 30]);
            }

            // Standard Sugar
            Recipe::create(['product_id' => $product->id, 'ingredient_id' => $ingMap['Gula Cair'], 'quantity' => 20]);
        }
    }
}
