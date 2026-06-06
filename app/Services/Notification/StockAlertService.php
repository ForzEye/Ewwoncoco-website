<?php

namespace App\Services\Notification;

use App\Models\Product;
use App\Models\BranchIngredient;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class StockAlertService
{
    /**
     * Check if a product's stock is low and send an FCM push notification.
     */
    public static function checkAndSendProductAlert(Product $product)
    {
        if ($product->stock <= $product->min_stock && $product->is_available) {
            $isOutOfStock = $product->stock <= 0;
            $state = $isOutOfStock ? 'out' : 'low';
            $cacheKey = "stock_alert_product_{$product->id}_{$state}";

            if (Cache::has($cacheKey)) {
                return;
            }

            try {
                $fcmService = app(FCMService::class);
                
                // Find Admins and Cashiers of this merchant + all Super Admins
                $admins = User::whereNotNull('fcm_token')
                    ->where(function($query) use ($product) {
                        $query->where(function($q) use ($product) {
                            $q->whereIn('role', ['admin', 'kasir'])
                              ->where('merchant_id', $product->merchant_id);
                        })->orWhere('role', 'super_admin');
                    })
                    ->get();

                $title = $isOutOfStock ? 'Stok Produk Habis!' : 'Peringatan Stok Produk Rendah!';
                $body = $isOutOfStock 
                    ? "Stok produk {$product->name} telah habis (sisa 0). Segera lakukan restock!" 
                    : "Stok produk {$product->name} hampir habis (sisa " . self::formatNumber($product->stock) . "). Segera lakukan restock!";

                $sent = false;
                $tokens = $admins->pluck('fcm_token')->filter()->unique()->values();
                foreach ($tokens as $token) {
                    $fcmService->sendToToken(
                        $token,
                        $title,
                        $body,
                        [
                            'type' => 'low_stock_alert',
                            'product_id' => (string) $product->id,
                            'link' => '/admin/products',
                        ]
                    );
                    $sent = true;
                }

                if ($sent) {
                    Cache::put($cacheKey, true, now()->addHours(2));
                    // Clear opposite state key to allow immediate toggle alert
                    $oppositeState = $isOutOfStock ? 'low' : 'out';
                    Cache::forget("stock_alert_product_{$product->id}_{$oppositeState}");
                }
            } catch (\Exception $e) {
                Log::error('Failed to send product low stock notification: ' . $e->getMessage());
            }
        } else {
            // Clear all alert cache keys when stock is healthy
            Cache::forget("stock_alert_product_{$product->id}_low");
            Cache::forget("stock_alert_product_{$product->id}_out");
        }
    }

    /**
     * Check if a branch ingredient's stock is low and send an FCM push notification.
     */
    public static function checkAndSendIngredientAlert(BranchIngredient $branchIngredient)
    {
        if ($branchIngredient->stock <= $branchIngredient->min_stock) {
            $isOutOfStock = $branchIngredient->stock <= 0;
            $state = $isOutOfStock ? 'out' : 'low';
            $cacheKey = "stock_alert_ingredient_{$branchIngredient->id}_{$state}";

            if (Cache::has($cacheKey)) {
                return;
            }

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

                // Find Admins and Cashiers of this branch's merchant + all Super Admins
                $admins = User::whereNotNull('fcm_token')
                    ->where(function($query) use ($branch) {
                        $query->where(function($q) use ($branch) {
                            $q->whereIn('role', ['admin', 'kasir'])
                              ->where('merchant_id', $branch->merchant_id);
                        })->orWhere('role', 'super_admin');
                    })
                    ->get();

                $title = $isOutOfStock ? 'Stok Bahan Baku Habis!' : 'Peringatan Stok Bahan Baku Rendah!';
                $body = $isOutOfStock 
                    ? "Bahan baku {$ingredient->name} di {$branch->name} telah habis (sisa 0 {$ingredient->unit}). Segera lakukan restock!" 
                    : "Bahan baku {$ingredient->name} di {$branch->name} hampir habis (sisa " . self::formatNumber($branchIngredient->stock) . " {$ingredient->unit}). Segera lakukan restock!";

                $sent = false;
                $tokens = $admins->pluck('fcm_token')->filter()->unique()->values();
                foreach ($tokens as $token) {
                    $fcmService->sendToToken(
                        $token,
                        $title,
                        $body,
                        [
                            'type' => 'low_ingredient_alert',
                            'ingredient_id' => (string) $ingredient->id,
                            'branch_id' => (string) $branch->id,
                            'link' => '/admin/inventory/stock',
                        ]
                    );
                    $sent = true;
                }

                if ($sent) {
                    Cache::put($cacheKey, true, now()->addHours(2));
                    // Clear opposite state key to allow immediate toggle alert
                    $oppositeState = $isOutOfStock ? 'low' : 'out';
                    Cache::forget("stock_alert_ingredient_{$branchIngredient->id}_{$oppositeState}");
                }
            } catch (\Exception $e) {
                Log::error('Failed to send ingredient low stock notification: ' . $e->getMessage());
            }
        } else {
            // Clear all alert cache keys when stock is healthy
            Cache::forget("stock_alert_ingredient_{$branchIngredient->id}_low");
            Cache::forget("stock_alert_ingredient_{$branchIngredient->id}_out");
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
