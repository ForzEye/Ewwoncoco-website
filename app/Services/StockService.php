<?php

namespace App\Services;

use App\Models\BranchIngredient;
use App\Models\Product;
use App\Models\StockMovement;

class StockService
{
    /**
     * Deduct stock based on recipe for a given product and branch.
     */
    public static function deductFromRecipe($productId, $branchId, $quantity = 1, $referenceId = null, $referenceType = null)
    {
        $product = Product::with('recipes')->findOrFail($productId);

        if ($product->recipes->isEmpty()) {
            return; // No recipe, no stock deduction for ingredients
        }

        foreach ($product->recipes as $recipe) {
            $totalNeeded = $recipe->quantity * $quantity;

            $branchIngredient = BranchIngredient::where('branch_id', $branchId)
                ->where('ingredient_id', $recipe->ingredient_id)
                ->lockForUpdate()
                ->first();

            if (! $branchIngredient) {
                if ($referenceType === 'PosTransaction') {
                    $branchIngredient = BranchIngredient::create([
                        'branch_id' => $branchId,
                        'ingredient_id' => $recipe->ingredient_id,
                        'stock' => 0,
                        'min_stock' => 0,
                        'average_cost' => 0,
                    ]);
                } else {
                    $ingredientName = $recipe->ingredient->name ?? ('Bahan #'.$recipe->ingredient_id);
                    throw new \Exception("Stok bahan baku tidak mencukupi: {$ingredientName} (Butuh: {$totalNeeded}, Tersedia: 0). Silakan lakukan isi ulang stok terlebih dahulu.");
                }
            }

            if ($branchIngredient->stock < $totalNeeded) {
                if ($referenceType !== 'PosTransaction') {
                    $ingredientName = $recipe->ingredient->name ?? ('Bahan #'.$recipe->ingredient_id);
                    throw new \Exception("Stok bahan baku tidak mencukupi: {$ingredientName} (Butuh: {$totalNeeded}, Tersedia: ".($branchIngredient->stock ?? 0)."). Silakan lakukan isi ulang stok terlebih dahulu.");
                }
            }

            $branchIngredient->decrement('stock', $totalNeeded);
            $branchIngredient->refresh();
            \App\Services\Notification\StockAlertService::checkAndSendIngredientAlert($branchIngredient);

            // Record Movement
            StockMovement::create([
                'branch_id' => $branchId,
                'ingredient_id' => $recipe->ingredient_id,
                'type' => 'OUT',
                'quantity' => $totalNeeded,
                'reference_id' => $referenceId,
                'reference_type' => $referenceType,
                'notes' => "Otomatis dari {$referenceType} #{$referenceId}",
                'user_id' => auth()->id(),
            ]);
        }
    }

    /**
     * Restore stock based on recipe for a given product and branch.
     */
    public static function restoreToRecipe($productId, $branchId, $quantity = 1, $referenceId = null, $referenceType = null)
    {
        $product = Product::with('recipes')->findOrFail($productId);

        if ($product->recipes->isEmpty()) {
            return; // No recipe, no stock restore for ingredients
        }

        foreach ($product->recipes as $recipe) {
            $totalNeeded = $recipe->quantity * $quantity;

            $branchIngredient = BranchIngredient::where('branch_id', $branchId)
                ->where('ingredient_id', $recipe->ingredient_id)
                ->lockForUpdate()
                ->first();

            if ($branchIngredient) {
                $branchIngredient->increment('stock', $totalNeeded);
                $branchIngredient->refresh();

                // Record Movement
                StockMovement::create([
                    'branch_id' => $branchId,
                    'ingredient_id' => $recipe->ingredient_id,
                    'type' => 'IN',
                    'quantity' => $totalNeeded,
                    'reference_id' => $referenceId,
                    'reference_type' => $referenceType,
                    'notes' => "Pengembalian otomatis dari void {$referenceType} #{$referenceId}",
                    'user_id' => auth()->id(),
                ]);
            }
        }
    }
}

