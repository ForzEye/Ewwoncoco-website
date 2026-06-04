<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\BranchIngredient;
use App\Models\Ingredient;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockManagementController extends Controller
{
    public function index(Request $request)
    {
        $merchantId = auth()->user()->merchant_id;
        $branches = Branch::where('merchant_id', $merchantId)->get();
        $selectedBranchId = $request->input('branch_id', $branches->first()?->id);

        $ingredients = Ingredient::where('merchant_id', $merchantId)->get();

        $stockData = BranchIngredient::where('branch_id', $selectedBranchId)
            ->whereHas('ingredient')
            ->with('ingredient')
            ->get();

        return Inertia::render('Admin/Inventory/Stock', [
            'branches' => $branches,
            'selectedBranchId' => (int) $selectedBranchId,
            'ingredients' => $ingredients,
            'stockData' => $stockData,
        ]);
    }

    public function stockIn(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
            'cost_per_unit' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $branchIngredient = BranchIngredient::firstOrNew([
                'branch_id' => $request->branch_id,
                'ingredient_id' => $request->ingredient_id,
            ]);

            $oldStock = (float) $branchIngredient->stock;
            $oldAvgCost = (float) $branchIngredient->average_cost;
            $newQty = (float) $request->quantity;
            $newCost = (float) $request->cost_per_unit;

            // Calculate new average cost
            // New_Avg_Cost = ((Old_Qty * Old_Avg_Cost) + (New_Qty * New_Price)) / (Old_Qty + New_Qty)
            $totalQty = $oldStock + $newQty;
            if ($totalQty > 0) {
                $newAvgCost = (($oldStock * $oldAvgCost) + ($newQty * $newCost)) / $totalQty;
            } else {
                $newAvgCost = $newCost;
            }

            $branchIngredient->stock = $totalQty;
            $branchIngredient->average_cost = $newAvgCost;
            $branchIngredient->save();

            // Record Movement
            StockMovement::create([
                'branch_id' => $request->branch_id,
                'ingredient_id' => $request->ingredient_id,
                'type' => 'IN',
                'quantity' => $newQty,
                'reference_type' => 'Purchase',
                'notes' => $request->notes,
            ]);

            return back()->with('success', 'Stok berhasil ditambahkan dan HPP rata-rata telah diupdate.');
        });
    }

    public function stockAdjust(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'actual_stock' => 'required|numeric|min:0',
            'notes' => 'required|string',
        ]);

        return DB::transaction(function () use ($request) {
            $branchIngredient = BranchIngredient::where('branch_id', $request->branch_id)
                ->where('ingredient_id', $request->ingredient_id)
                ->firstOrFail();

            $oldStock = (float) $branchIngredient->stock;
            $newStock = (float) $request->actual_stock;
            $diff = $newStock - $oldStock;

            $branchIngredient->update(['stock' => $newStock]);

            // Record Movement
            StockMovement::create([
                'branch_id' => $request->branch_id,
                'ingredient_id' => $request->ingredient_id,
                'type' => 'ADJUST',
                'quantity' => $diff,
                'notes' => $request->notes,
            ]);

            return back()->with('success', 'Stok berhasil disesuaikan.');
        });
    }
}
