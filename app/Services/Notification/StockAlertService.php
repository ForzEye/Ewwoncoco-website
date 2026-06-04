<?php

namespace App\Services\Notification;

use App\Models\Product;
use App\Models\BranchIngredient;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class StockAlertService
{
    /**
     * Check if a product's stock is low and send an FCM push notification.
     */
    public static function checkAndSendProductAlert(Product $product)
    {
        if ($product->stock <= $product->min_stock && $product->is_available) {
            try {
                $fcmService = app(FCMService::class);
                
                // Find Admins of this merchant + all Super Admins
                $admins = User::whereNotNull('fcm_token')
                    ->where(function($query) use ($product) {
                        $query->where(function($q) use ($product) {
                            $q->where('role', 'admin')
                              ->where('merchant_id', $product->merchant_id);
                        })->orWhere('role', 'super_admin');
                    })
                    ->get();

                foreach ($admins as $admin) {
                    $fcmService->sendToToken(
                        $admin->fcm_token,
                        'Peringatan Stok Produk Rendah!',
                        "Stok produk {$product->name} sisa " . self::formatNumber($product->stock) . ". Segera lakukan restock!",
                        [
                            'type' => 'low_stock_alert',
                            'product_id' => (string) $product->id,
                            'link' => '/admin/products',
                        ]
                    );
                }
            } catch (\Exception $e) {
                Log::error('Failed to send product low stock notification: ' . $e->getMessage());
            }
        }
    }

    /**
     * Check if a branch ingredient's stock is low and send an FCM push notification.
     */
    public static function checkAndSendIngredientAlert(BranchIngredient $branchIngredient)
    {
        if ($branchIngredient->stock <= $branchIngredient->min_stock) {
            try {
                $fcmService = app(FCMService::class);
                $ingredient = $branchIngredient->ingredient;
                $branch = $branchIngredient->branch;
                
                if (!$ingredient || !$branch) {
                    // Try to load relations if missing
                    $branchIngredient->load(['ingredient', 'branch']);
                    $ingredient = $branchIngredient->ingredient;
                    $branch = $branchIngredient->branch;
                }

                if (!$ingredient || !$branch) {
                    return;
                }

                // Find Admins of this branch's merchant + all Super Admins
                $admins = User::whereNotNull('fcm_token')
                    ->where(function($query) use ($branch) {
                        $query->where(function($q) use ($branch) {
                            $q->where('role', 'admin')
                              ->where('merchant_id', $branch->merchant_id);
                        })->orWhere('role', 'super_admin');
                    })
                    ->get();

                foreach ($admins as $admin) {
                    $fcmService->sendToToken(
                        $admin->fcm_token,
                        'Peringatan Stok Bahan Baku Rendah!',
                        "Stok {$ingredient->name} di {$branch->name} sisa " . self::formatNumber($branchIngredient->stock) . " {$ingredient->unit}. Segera lakukan restock!",
                        [
                            'type' => 'low_ingredient_alert',
                            'ingredient_id' => (string) $ingredient->id,
                            'branch_id' => (string) $branch->id,
                            'link' => '/admin/inventory/stock',
                        ]
                    );
                }
            } catch (\Exception $e) {
                Log::error('Failed to send ingredient low stock notification: ' . $e->getMessage());
            }
        }
    }

    /**
     * Format a decimal number to remove unnecessary trailing .00 or zeros,
     * while using Indonesian format (comma as decimal separator, dot as thousands separator).
     */
    private static function formatNumber($value): string
    {
        $formatted = number_format((float) $value, 2, ',', '.');
        if (str_contains($formatted, ',')) {
            $formatted = rtrim(rtrim($formatted, '0'), ',');
        }
        return $formatted;
    }
}
