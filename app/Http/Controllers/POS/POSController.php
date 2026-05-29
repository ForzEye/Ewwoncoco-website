<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\PosShift;
use App\Models\PosTransaction;
use App\Models\PosTransactionItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Promotion;
use App\Services\Notification\WhatsAppService;
use App\Services\PointsService;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class POSController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $activeShift = PosShift::where('cashier_id', $user->id)
            ->whereNull('closed_at')
            ->first();

        if (! $activeShift) {
            return redirect()->route('pos.shifts')->with('warning', 'Silakan buka shift kasir terlebih dahulu.');
        }

        if ($activeShift->is_locked) {
            return Inertia::render('POS/Locked', [
                'activeShift' => $activeShift->load('branch'),
            ]);
        }

        $products = Product::where('is_available', true)->with(['category', 'customizations.options'])->get();
        $categories = ProductCategory::all();

        $merchantId = $user->merchant_id ?? 1;
        $promotions = Promotion::active()
            ->where('merchant_id', $merchantId)
            ->where('type', 'bogo')
            ->whereIn('applicable_on', ['offline', 'all'])
            ->get();

        return Inertia::render('POS/Screen', [
            'products' => $products,
            'categories' => $categories,
            'activeShift' => $activeShift->load('branch'),
            'promotions' => $promotions,
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

        if (! $activeShift) {
            return response()->json([
                'success' => false,
                'message' => 'Anda harus membuka shift terlebih dahulu.',
            ], 403);
        }

        if ($activeShift->is_locked) {
            return response()->json([
                'success' => false,
                'message' => 'POS Terkunci! Silakan hubungi admin.',
            ], 403);
        }

        return DB::transaction(function () use ($request, $user, $activeShift) {
            $subtotal = collect($request->items)->sum(function ($item) {
                $itemPrice = $item['product']['price'];
                if (isset($item['customizations']) && is_array($item['customizations'])) {
                    $itemPrice += collect($item['customizations'])->sum('price');
                }

                return $itemPrice * $item['quantity'];
            });

            // Ambil merchant/branch dari user yang login (kasir)
            $merchantId = $user->merchant_id ?? 1; // fallback ke merchant pertama
            $branchId = $activeShift->branch_id;

            // Fetch active BOGO promotions for this merchant
            $bogoPromosCollection = Promotion::active()
                ->where('merchant_id', $merchantId)
                ->where('type', 'bogo')
                ->whereIn('applicable_on', ['offline', 'all'])
                ->get();

            // Specific BOGOs (linked to a product)
            $specificBogoPromos = $bogoPromosCollection->whereNotNull('buy_product_id')->keyBy('buy_product_id');

            // Global BOGO (applies to "all menus")
            $globalBogoPromo = $bogoPromosCollection->whereNull('buy_product_id')->first();

            $transaction = PosTransaction::create([
                'merchant_id' => $merchantId,
                'branch_id' => $branchId,
                'cashier_id' => $user->id,
                'customer_id' => $request->customer_id, // Add customer support
                'shift_id' => $activeShift->id,
                'transaction_number' => 'POS-'.date('Ymd').'-'.strtoupper(bin2hex(random_bytes(3))),
                'payment_method' => $request->payment_method,
                'total' => $subtotal,
                'discount' => 0,
                'cash_received' => $request->amount_paid ?? $subtotal,
                'change_amount' => ($request->amount_paid ?? $subtotal) - $subtotal,
                'transaction_at' => now(),
            ]);

            // Handle Point Redemption if customer is selected
            if ($request->customer_id && $request->boolean('use_points', false)) {
                PointsService::redeemPoints($request->customer_id, $transaction->id, 'pos_transaction');
                $transaction->refresh();
            }

            foreach ($request->items as $item) {
                $productId = $item['product']['id'];
                $qty = $item['quantity'];
                $unitPrice = $item['product']['price'];
                if (isset($item['customizations']) && is_array($item['customizations'])) {
                    $unitPrice += collect($item['customizations'])->sum('price');
                }

                PosTransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $productId,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $unitPrice * $qty,
                    'customizations' => $item['customizations'] ?? null,
                ]);

                // Reduce Stock (Simple & Recipe)
                $product = Product::find($productId);
                $product->decrement('stock', $qty);

                // Deduct Ingredients based on Recipe
                StockService::deductFromRecipe(
                    $productId,
                    $branchId,
                    $qty,
                    $transaction->transaction_number,
                    'PosTransaction'
                );

                // Apply BOGO Promo
                $promo = null;
                $freeProductId = null;

                if (isset($specificBogoPromos[$productId])) {
                    $promo = $specificBogoPromos[$productId];
                    $freeProductId = $promo->get_product_id;
                } elseif ($globalBogoPromo) {
                    $promo = $globalBogoPromo;
                    $freeProductId = $globalBogoPromo->get_product_id ?: $productId; // Specific free product or same product
                }

                if ($promo && $freeProductId) {
                    $buyQty = $promo->buy_quantity ?: 1;
                    $getQty = $promo->get_quantity ?: 1;

                    $multiplier = floor($qty / $buyQty);
                    $freeQty = $multiplier * $getQty;

                    if ($freeQty > 0) {
                        PosTransactionItem::create([
                            'transaction_id' => $transaction->id,
                            'product_id' => $freeProductId,
                            'quantity' => $freeQty,
                            'unit_price' => 0,
                            'subtotal' => 0,
                            'notes' => 'PROMO BOGO: '.$promo->name,
                        ]);

                        // Reduce Stock of free product
                        $freeProduct = Product::find($freeProductId);
                        if ($freeProduct) {
                            $freeProduct->decrement('stock', $freeQty);

                            StockService::deductFromRecipe(
                                $freeProductId,
                                $branchId,
                                $freeQty,
                                $transaction->transaction_number,
                                'PosTransaction'
                            );
                        }
                    }
                }
            }

            // Award points for this purchase if customer is selected
            if ($transaction->customer_id) {
                PointsService::earnPoints($transaction->customer_id, $transaction->id, 'pos_transaction');

                // Send premium WhatsApp receipt
                try {
                    $waService = app(WhatsAppService::class);
                    $waService->sendOfflineReceipt($transaction);
                } catch (\Exception $e) {
                    Log::error('Failed to send WA offline receipt: '.$e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'transaction' => $transaction->load(['items.product', 'merchant', 'branch']),
                'message' => 'Transaksi berhasil',
            ]);
        });
    }
}
