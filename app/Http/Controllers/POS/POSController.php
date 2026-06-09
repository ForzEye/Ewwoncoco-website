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

        $branchId = $activeShift->branch_id;
        $products = Product::where('is_available', true)
            ->with([
                'category', 
                'customizations.options',
                'recipes.ingredient.branchStocks' => function ($query) use ($branchId) {
                    $query->where('branch_id', $branchId);
                }
            ])
            ->get();

        $products->transform(function ($product) use ($branchId) {
            $product->stock = $product->calculateDynamicStock($branchId);
            return $product;
        });

        $categories = ProductCategory::all();

        $merchantId = $user->merchant_id ?? 1;
        $promotions = Promotion::active()
            ->where('merchant_id', $merchantId)
            ->whereIn('type', ['bogo', 'upgrade'])
            ->whereIn('applicable_on', ['offline', 'all', 'gofood', 'grabfood', 'shopeefood'])
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
            'customer_name' => 'required|string|min:1',
            'payment_method' => 'required|in:cash,qris,tester,gofood,grabfood,shopeefood',
            'items' => 'required|array|min:1',
            'items.*.customizations' => 'nullable|array',
            'items.*.customizations.*.id' => 'required|exists:customization_options,id',
            'items.*.customizations.*.claim_upgrade' => 'nullable|boolean',
            'manual_discount_type' => 'nullable|in:percent,fixed',
            'manual_discount_value' => 'nullable|numeric|min:0',
            'discount_reason' => 'nullable|string',
            'amount_paid' => 'nullable|numeric',
            'notes' => 'nullable|string',
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
            $merchantId = $user->merchant_id ?? 1; // fallback ke merchant pertama
            $branchId = $activeShift->branch_id;

            // Fetch active promotions for this merchant
            $paymentMethod = $request->payment_method;
            $applicableOn = ['all'];
            if (in_array($paymentMethod, ['gofood', 'grabfood', 'shopeefood'])) {
                $applicableOn[] = $paymentMethod;
            } else {
                $applicableOn[] = 'offline';
            }

            // Determine if the customer is a new member
            $isNewMember = false;
            if ($request->customer_id) {
                $posTxCount = PosTransaction::where('customer_id', $request->customer_id)->count();
                $orderCount = \App\Models\Order::where('customer_id', $request->customer_id)
                    ->where('status', '!=', 'cancelled')
                    ->count();
                $isNewMember = ($posTxCount + $orderCount) === 0;
            }

            $promosQuery = Promotion::active()
                ->where('merchant_id', $merchantId)
                ->whereIn('applicable_on', $applicableOn);

            if ($request->customer_id) {
                if (!$isNewMember) {
                    $promosQuery->where('is_new_member_only', false);
                }
            } else {
                $promosQuery->where('is_new_member_only', false);
            }

            $activePromos = $promosQuery->get();
            $bogoPromosCollection = $activePromos->where('type', 'bogo');
            $upgradePromos = $activePromos->where('type', 'upgrade');

            // Specific BOGOs (linked to a product)
            $specificBogoPromos = $bogoPromosCollection->whereNotNull('buy_product_id')->keyBy('buy_product_id');

            // Global BOGO (applies to "all menus")
            $globalBogoPromo = $bogoPromosCollection->whereNull('buy_product_id')->first();

            $subtotal = collect($request->items)->sum(function ($item) use ($upgradePromos) {
                $itemPrice = $item['product']['price'];
                if (isset($item['customizations']) && is_array($item['customizations'])) {
                    foreach ($item['customizations'] as $custOpt) {
                        $price = $custOpt['price'];
                        $hasUpgrade = $upgradePromos->where('upgrade_to_option_id', $custOpt['id'])->first();
                        if ($hasUpgrade && !empty($custOpt['claim_upgrade'])) {
                            $price = 0; // Upgrade is free!
                        }
                        $itemPrice += $price;
                    }
                }

                return $itemPrice * $item['quantity'];
            });

            $isTester = $request->payment_method === 'tester';

            $manualDiscount = 0;
            if ($request->manual_discount_type && $request->manual_discount_value > 0) {
                if ($request->manual_discount_type === 'percent') {
                    $manualDiscount = (int) floor(($subtotal * $request->manual_discount_value) / 100);
                } else {
                    $manualDiscount = (int) $request->manual_discount_value;
                }
            }

            $totalBeforePoints = max(0, $subtotal - $manualDiscount);

            $transaction = PosTransaction::create([
                'merchant_id' => $merchantId,
                'branch_id' => $branchId,
                'cashier_id' => $user->id,
                'customer_id' => $request->customer_id, // Add customer support
                'customer_name' => $request->customer_name, // Save custom customer name
                'shift_id' => $activeShift->id,
                'transaction_number' => 'POS-'.date('Ymd').'-'.strtoupper(bin2hex(random_bytes(3))),
                'payment_method' => $request->payment_method,
                'total' => $isTester ? 0 : $totalBeforePoints,
                'discount' => $isTester ? $subtotal : $manualDiscount,
                'manual_discount_type' => $request->manual_discount_type,
                'manual_discount_value' => $request->manual_discount_value,
                'discount_reason' => $request->discount_reason,
                'cash_received' => $isTester ? 0 : ($request->amount_paid ?? $totalBeforePoints),
                'change_amount' => $isTester ? 0 : max(0, ($request->amount_paid ?? $totalBeforePoints) - $totalBeforePoints),
                'transaction_at' => now(),
                'notes' => $request->notes,
            ]);

            // Handle Point Redemption if customer is selected and not a tester
            if ($request->customer_id && $request->boolean('use_points', false) && ! $isTester) {
                PointsService::redeemPoints($request->customer_id, $transaction->id, 'pos_transaction');
                $transaction->refresh();
            }

            foreach ($request->items as $item) {
                $productId = $item['product']['id'];
                $qty = $item['quantity'];
                $unitPrice = $item['product']['price'];
                $processedCustomizations = [];
                if (isset($item['customizations']) && is_array($item['customizations'])) {
                    foreach ($item['customizations'] as $custOpt) {
                        $originalPrice = $custOpt['price'] ?? 0;
                        $price = $custOpt['price'] ?? 0;
                        $hasUpgrade = $upgradePromos->where('upgrade_to_option_id', $custOpt['id'])->first();
                        if ($hasUpgrade && !empty($custOpt['claim_upgrade'])) {
                            $price = 0;
                        }
                        $custOpt['price'] = $price;
                        $custOpt['original_price'] = $originalPrice;
                        $unitPrice += $price;
                        $processedCustomizations[] = $custOpt;
                    }
                }

                PosTransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $productId,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $unitPrice * $qty,
                    'customizations' => $processedCustomizations ?: null,
                ]);

                $product = Product::with('recipes')->find($productId);
                if ($product) {
                    if ($product->recipes->isEmpty()) {
                        $product->decrement('stock', $qty);
                        $product->refresh();
                        \App\Services\Notification\StockAlertService::checkAndSendProductAlert($product);
                    }
                }

                // Deduct Ingredients based on Recipe (blocking)
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

                    // Apply max free quantity limit if set
                    if ($promo->max_free_qty) {
                        $freeQty = min($freeQty, $promo->max_free_qty);
                    }

                    if ($freeQty > 0) {
                        PosTransactionItem::create([
                            'transaction_id' => $transaction->id,
                            'product_id' => $freeProductId,
                            'quantity' => $freeQty,
                            'unit_price' => 0,
                            'subtotal' => 0,
                            'notes' => 'PROMO BOGO: '.$promo->name,
                        ]);

                        $freeProduct = Product::with('recipes')->find($freeProductId);
                        if ($freeProduct) {
                            if ($freeProduct->recipes->isEmpty()) {
                                $freeProduct->decrement('stock', $freeQty);
                                $freeProduct->refresh();
                                \App\Services\Notification\StockAlertService::checkAndSendProductAlert($freeProduct);
                            }

                            // Deduct Ingredients for free BOGO product (blocking)
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

            // Award points for this purchase if customer is selected and not a tester
            if ($transaction->customer_id && $transaction->payment_method !== 'tester') {
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
                'transaction' => $transaction->load(['items.product', 'merchant', 'branch', 'cashier']),
                'message' => 'Transaksi berhasil',
            ]);
        });
    }
}
