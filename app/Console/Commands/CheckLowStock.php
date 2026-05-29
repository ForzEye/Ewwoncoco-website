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
        $lowStockProducts = Product::with(['merchant', 'branch'])
            ->whereColumn('stock', '<=', 'min_stock')
            ->where('is_available', true)
            ->get();

        if ($lowStockProducts->isEmpty()) {
            $this->info('Semua stok aman.');

            return;
        }

        foreach ($lowStockProducts as $product) {
            $this->warn("Stok menipis: {$product->name} (Sisa: {$product->stock})");

            // Cari Admin dari merchant ini
            $admins = User::where('role', 'admin')
                ->whereHas('merchant', function ($q) use ($product) {
                    $q->where('id', $product->merchant_id);
                })
                ->whereNotNull('fcm_token')
                ->get();

            foreach ($admins as $admin) {
                $fcmService->sendToToken(
                    $admin->fcm_token,
                    'Peringatan Stok Rendah!',
                    "Stok produk {$product->name} sisa {$product->stock}. Segera lakukan restock!",
                    [
                        'type' => 'low_stock_alert',
                        'product_id' => (string) $product->id,
                        'link' => '/admin/products',
                    ]
                );
            }
        }

        $this->info('Selesai memeriksa stok.');
    }
}
