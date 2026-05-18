<?php

namespace App\Services;

use App\Models\BranchIngredient;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

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
                ->first();

            if ($branchIngredient) {
                $branchIngredient->decrement('stock', $totalNeeded);

                // Record Movement
                StockMovement::create([
                    'branch_id' => $branchId,
                    'ingredient_id' => $recipe->ingredient_id,
                    'type' => 'OUT',
                    'quantity' => $totalNeeded,
                    'reference_id' => $referenceId,
                    'reference_type' => $referenceType,
                    'notes' => "Otomatis dari {$referenceType} #{$referenceId}",
                ]);
            }
        }
    }
}
