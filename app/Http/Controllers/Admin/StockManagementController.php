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

use App\Models\PosShift;

class StockManagementController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $merchantId = $user->merchant_id;

        if ($user->role === 'kasir') {
            // Temukan cabang tempat kasir memiliki shift aktif, atau default ke cabang pertama merchant
            $activeShift = PosShift::where('cashier_id', $user->id)
                ->whereNull('closed_at')
                ->first();
            
            $branchId = $activeShift ? $activeShift->branch_id : Branch::where('merchant_id', $merchantId)->first()?->id;
            
            $branches = Branch::where('id', $branchId)->get();
            $selectedBranchId = $branchId;
        } else {
            $branches = Branch::where('merchant_id', $merchantId)->get();
            $selectedBranchId = $request->input('branch_id', $branches->first()?->id);
        }

        $ingredients = Ingredient::where('merchant_id', $merchantId)->get();

        $stockData = BranchIngredient::where('branch_id', $selectedBranchId)
            ->whereHas('ingredient')
            ->with('ingredient')
            ->get();

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $search = $request->input('search');
        $type = $request->input('type');

        $stockMovementsQuery = StockMovement::where('branch_id', $selectedBranchId)
            ->with(['ingredient', 'branch', 'user']);

        if ($startDate) {
            $stockMovementsQuery->where('created_at', '>=', $startDate . ' 00:00:00');
        }
        if ($endDate) {
            $stockMovementsQuery->where('created_at', '<=', $endDate . ' 23:59:59');
        }
        if ($type) {
            $stockMovementsQuery->where('type', $type);
        }
        if ($search) {
            $stockMovementsQuery->where(function ($q) use ($search) {
                $q->where('notes', 'like', "%{$search}%")
                  ->orWhereHas('ingredient', function ($iq) use ($search) {
                      $iq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $stockMovements = $user->role !== 'kasir'
            ? $stockMovementsQuery->latest()->paginate(15)->withQueryString()
            : [
                'data' => [],
                'links' => [],
                'total' => 0,
                'from' => 0,
                'to' => 0,
            ];

        return Inertia::render('Admin/Inventory/Stock', [
            'branches' => $branches,
            'selectedBranchId' => (int) $selectedBranchId,
            'ingredients' => $ingredients,
            'stockData' => $stockData,
            'stockMovements' => $stockMovements,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate ?? '',
                'search' => $search ?? '',
                'type' => $type ?? '',
            ],
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
                'notes' => $request->notes ?? '-',
                'user_id' => auth()->id(),
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
            $branchIngredient->refresh();
            \App\Services\Notification\StockAlertService::checkAndSendIngredientAlert($branchIngredient);

            // Record Movement
            StockMovement::create([
                'branch_id' => $request->branch_id,
                'ingredient_id' => $request->ingredient_id,
                'type' => 'ADJUST',
                'quantity' => $diff,
                'notes' => $request->notes ?? '-',
                'user_id' => auth()->id(),
            ]);

            return back()->with('success', 'Stok berhasil disesuaikan.');
        });
     }

    public function update(Request $request, $id)
    {
        $request->validate([
            'stock' => 'required|numeric|min:0',
            'min_stock' => 'required|numeric|min:0',
            'average_cost' => 'required|numeric|min:0',
        ]);

        $branchIngredient = BranchIngredient::findOrFail($id);

        $oldStock = (float) $branchIngredient->stock;
        $oldMin = (float) $branchIngredient->min_stock;
        $oldCost = (float) $branchIngredient->average_cost;

        $newStock = (float) $request->stock;
        $newMin = (float) $request->min_stock;
        $newCost = (float) $request->average_cost;

        $branchIngredient->update([
            'stock' => $newStock,
            'min_stock' => $newMin,
            'average_cost' => $newCost,
        ]);
        $branchIngredient->refresh();
        \App\Services\Notification\StockAlertService::checkAndSendIngredientAlert($branchIngredient);

        // Log directly in StockMovement
        StockMovement::create([
            'branch_id' => $branchIngredient->branch_id,
            'ingredient_id' => $branchIngredient->ingredient_id,
            'type' => 'ADJUST',
            'quantity' => $newStock - $oldStock,
            'notes' => 'Edit Langsung Admin (Stok: ' . $oldStock . '->' . $newStock . ', HPP: ' . $oldCost . '->' . $newCost . ', Min: ' . $oldMin . '->' . $newMin . ')',
            'user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Stok cabang berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $branchIngredient = BranchIngredient::findOrFail($id);
        
        // Log the deletion movement
        StockMovement::create([
            'branch_id' => $branchIngredient->branch_id,
            'ingredient_id' => $branchIngredient->ingredient_id,
            'type' => 'ADJUST',
            'quantity' => -$branchIngredient->stock,
            'notes' => 'Hapus Stok Cabang: ' . $branchIngredient->ingredient?->name,
            'user_id' => auth()->id(),
        ]);

        $branchIngredient->delete();

        return back()->with('success', 'Bahan baku berhasil dihapus dari cabang ini.');
    }
}
