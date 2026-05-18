<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Order;
use App\Models\PosTransaction;
use App\Models\PosTransactionItem;
use App\Models\PosShift;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Services\StockService;

class POSController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $activeShift = PosShift::where('cashier_id', $user->id)
            ->whereNull('closed_at')
            ->first();

        if (!$activeShift) {
            return redirect()->route('pos.shifts')->with('warning', 'Silakan buka shift kasir terlebih dahulu.');
        }

        if ($activeShift->is_locked) {
            return Inertia::render('POS/Locked', [
                'activeShift' => $activeShift->load('branch')
            ]);
        }

        $products = Product::where('is_available', true)->with('category')->get();
        $categories = ProductCategory::all();

        return Inertia::render('POS/Screen', [
            'products' => $products,
            'categories' => $categories,
            'activeShift' => $activeShift->load('branch')
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'nullable|string',
            'payment_method' => 'required|in:cash,qris',
            'items' => 'required|array|min:1',
            'amount_paid' => 'nullable|numeric',
        ]);

        $user = $request->user();
        
        // Cek shift aktif
        $activeShift = PosShift::where('cashier_id', $user->id)
            ->whereNull('closed_at')
            ->first();

        if (!$activeShift) {
            return response()->json([
                'success' => false,
                'message' => 'Anda harus membuka shift terlebih dahulu.'
            ], 403);
        }

        if ($activeShift->is_locked) {
            return response()->json([
                'success' => false,
                'message' => 'POS Terkunci! Silakan hubungi admin.'
            ], 403);
        }

        return DB::transaction(function () use ($request, $user, $activeShift) {
            $subtotal = collect($request->items)->sum(function ($item) {
                return $item['product']['price'] * $item['quantity'];
            });

            // Ambil merchant/branch dari user yang login (kasir)
            $merchantId = $user->merchant_id ?? 1; // fallback ke merchant pertama
            $branchId = $activeShift->branch_id;

            $transaction = PosTransaction::create([
                'merchant_id' => $merchantId,
                'branch_id' => $branchId,
                'cashier_id' => $user->id,
                'customer_id' => $request->customer_id, // Add customer support
                'shift_id' => $activeShift->id,
                'transaction_number' => 'POS-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3))),
                'payment_method' => $request->payment_method,
                'total' => $subtotal,
                'discount' => 0,
                'cash_received' => $request->amount_paid ?? $subtotal,
                'change_amount' => ($request->amount_paid ?? $subtotal) - $subtotal,
                'transaction_at' => now(),
            ]);

            // Handle Point Redemption if customer is selected
            if ($request->customer_id && $request->boolean('use_points', false)) {
                \App\Services\PointsService::redeemPoints($request->customer_id, $transaction->id, 'pos_transaction');
                $transaction->refresh();
            }

            foreach ($request->items as $item) {
                PosTransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product']['id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['product']['price'],
                    'subtotal' => $item['product']['price'] * $item['quantity'],
                ]);

                // Reduce Stock (Simple & Recipe)
                $product = Product::find($item['product']['id']);
                $product->decrement('stock', $item['quantity']);

                // Deduct Ingredients based on Recipe
                StockService::deductFromRecipe(
                    $item['product']['id'], 
                    $branchId, 
                    $item['quantity'], 
                    $transaction->transaction_number, 
                    'PosTransaction'
                );
            }

            // Award points for this purchase if customer is selected
            if ($transaction->customer_id) {
                \App\Services\PointsService::earnPoints($transaction->customer_id, $transaction->id, 'pos_transaction');
            }

            return response()->json([
                'success' => true,
                'transaction' => $transaction->load(['items.product', 'merchant', 'branch']),
                'message' => 'Transaksi berhasil'
            ]);
        });
    }
}
