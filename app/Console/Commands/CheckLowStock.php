<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\User;
use App\Services\Notification\FCMService;
use Illuminate\Console\Command;

class CheckLowStock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:low-stock';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cek produk dengan stok menipis dan kirim notifikasi ke Admin Merchant';

    /**
     * Execute the console command.
     */
    public function handle(FCMService $fcmService)
    {
        // 1. Check Finished Products (Only products without recipes/BOM)
        $lowStockProducts = Product::whereColumn('stock', '<=', 'min_stock')
            ->where('is_available', true)
            ->doesntHave('recipes')
            ->get();

        foreach ($lowStockProducts as $product) {
            $this->warn("Stok produk menipis: {$product->name} (Sisa: {$product->stock})");
            \App\Services\Notification\StockAlertService::checkAndSendProductAlert($product);
        }

        // 2. Check Branch Ingredients (Bahan Baku Cabang)
        $lowStockIngredients = \App\Models\BranchIngredient::with(['ingredient', 'branch'])
            ->whereColumn('stock', '<=', 'min_stock')
            ->get();

        foreach ($lowStockIngredients as $branchIngredient) {
            $ingredientName = $branchIngredient->ingredient->name ?? 'Bahan Baku';
            $branchName = $branchIngredient->branch->name ?? 'Cabang';
            $this->warn("Stok bahan baku menipis: {$ingredientName} di {$branchName} (Sisa: {$branchIngredient->stock})");
            \App\Services\Notification\StockAlertService::checkAndSendIngredientAlert($branchIngredient);
        }

        $this->info('Selesai memeriksa stok.');
    }
}
