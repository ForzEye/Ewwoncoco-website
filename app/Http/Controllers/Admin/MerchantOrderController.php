<?php

namespace App\Http\Controllers\Admin;

use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Jobs\SimulateDeliveryJob;
use App\Jobs\SimulateThirdPartyDelivery;
use App\Models\LoyaltyPoint;
use App\Models\Order;
use App\Models\PosTransaction;
use App\Models\Promotion;
use App\Models\UserPointsBalance;
use App\Models\Product;
use App\Services\PointsService;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Inertia\Inertia;

class MerchantOrderController extends Controller
{
    public function index(Request $request)
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return redirect()->route('admin.dashboard')->with('error', 'Anda tidak memiliki toko yang terdaftar.');
        }

        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $search = $request->search;

        $onlineQuery = Order::where('merchant_id', $merchant->id)
            ->with(['customer', 'branch']);

        $posQuery = PosTransaction::where('merchant_id', $merchant->id)
            ->with(['customer', 'branch']);

        if ($startDate) {
            $onlineQuery->where('created_at', '>=', $startDate . ' 00:00:00');
            $posQuery->where(function($q) use ($startDate) {
                $q->where('transaction_at', '>=', $startDate . ' 00:00:00')
                  ->orWhere(function($sq) use ($startDate) {
                      $sq->whereNull('transaction_at')->where('created_at', '>=', $startDate . ' 00:00:00');
                  });
            });
        }

        if ($endDate) {
            $onlineQuery->where('created_at', '<=', $endDate . ' 23:59:59');
            $posQuery->where(function($q) use ($endDate) {
                $q->where('transaction_at', '<=', $endDate . ' 23:59:59')
                  ->orWhere(function($sq) use ($endDate) {
                      $sq->whereNull('transaction_at')->where('created_at', '<=', $endDate . ' 23:59:59');
                  });
            });
        }

        if ($search) {
            $onlineQuery->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
            $posQuery->where(function($q) use ($search) {
                $q->where('transaction_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $onlineOrders = $onlineQuery->latest()->get();
        $posTransactions = $posQuery->latest()->get();

        $mappedOnline = $onlineOrders->map(function ($order) {
            return [
                'id' => 'online-' . $order->id,
                'customer_id' => $order->customer_id,
                'merchant_id' => $order->merchant_id,
                'branch_id' => $order->branch_id,
                'order_number' => $order->order_number,
                'delivery_type' => $order->delivery_type,
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'subtotal' => (float)$order->subtotal,
                'delivery_fee' => (float)$order->delivery_fee,
                'discount' => (float)$order->discount,
                'total' => (float)$order->total,
                'notes' => $order->notes,
                'created_at' => $order->created_at->toIso8601String(),
                'updated_at' => $order->updated_at->toIso8601String(),
                'customer' => $order->customer,
                'branch' => $order->branch,
                'is_online' => true,
            ];
        });

        $mappedPos = $posTransactions->map(function ($pos) {
            return [
                'id' => 'pos-' . $pos->id,
                'customer_id' => $pos->customer_id,
                'merchant_id' => $pos->merchant_id,
                'branch_id' => $pos->branch_id,
                'order_number' => $pos->transaction_number,
                'delivery_type' => 'pickup',
                'status' => 'delivered',
                'payment_method' => $pos->payment_method,
                'payment_status' => 'confirmed',
                'subtotal' => (float)($pos->total + $pos->discount),
                'delivery_fee' => 0.0,
                'discount' => (float)$pos->discount,
                'total' => (float)$pos->total,
                'notes' => $pos->notes,
                'created_at' => $pos->transaction_at ? $pos->transaction_at->toIso8601String() : $pos->created_at->toIso8601String(),
                'updated_at' => $pos->updated_at->toIso8601String(),
                'customer' => $pos->customer ?? [
                    'name' => $pos->customer_name ?? 'Pelanggan Umum',
                    'email' => '-',
                    'phone' => '-',
                ],
                'branch' => $pos->branch,
                'is_online' => false,
            ];
        });

        $allOrders = $mappedOnline->concat($mappedPos)->sortByDesc('created_at')->values()->all();

        $perPage = 15;
        $page = Paginator::resolveCurrentPage() ?: 1;
        $allOrdersCollection = collect($allOrders);
        $paginatedOrders = new LengthAwarePaginator(
            $allOrdersCollection->forPage($page, $perPage)->values()->all(),
            $allOrdersCollection->count(),
            $perPage,
            $page,
            [
                'path' => Paginator::resolveCurrentPath(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $paginatedOrders,
            'filters' => [
                'start_date' => $startDate ?? '',
                'end_date' => $endDate ?? '',
                'search' => $search ?? '',
            ],
        ]);
    }

    public function show($id)
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        if (str_starts_with($id, 'pos-')) {
            $posId = substr($id, 4);
            $posTransaction = PosTransaction::where('merchant_id', $merchant->id)
                ->with(['items.product', 'customer', 'branch', 'cashier', 'merchant'])
                ->findOrFail($posId);

            $order = $this->mapPosTransactionToOrder($posTransaction);
        } else {
            $orderId = str_starts_with($id, 'online-') ? substr($id, 7) : $id;
            $orderModel = Order::where('merchant_id', $merchant->id)
                ->with(['items.product', 'customer', 'branch', 'merchant'])
                ->findOrFail($orderId);

            $order = array_merge($orderModel->toArray(), [
                'is_online' => true,
                'payment_proof_url' => $orderModel->payment_proof_url,
                'items' => $orderModel->items->map(function ($item) {
                    return array_merge($item->toArray(), [
                        'price' => (float)$item->unit_price,
                    ]);
                })->toArray(),
            ]);
        }

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        if (str_starts_with($id, 'pos-')) {
            return back()->with('error', 'Pesanan POS Kasir tidak dapat diubah statusnya.');
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,ready_for_pickup,on_delivery,delivered,cancelled',
        ]);

        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $orderId = str_starts_with($id, 'online-') ? substr($id, 7) : $id;
        $order = Order::where('merchant_id', $merchant->id)->with('items.product')->findOrFail($orderId);
        $oldStatus = $order->status;

        try {
            DB::transaction(function () use ($order, $request, $oldStatus) {
                $updateData = ['status' => $request->status];
                if ($request->status !== 'pending' && $request->status !== 'cancelled') {
                    $updateData['payment_status'] = 'confirmed';
                }
                $order->update($updateData);

                // Trigger stock deduction if status changes to confirmed
                if ($oldStatus !== 'confirmed' && $request->status === 'confirmed') {
                    // Deduct Stock for all items in order
                    foreach ($order->items as $item) {
                        $product = Product::with('recipes')->find($item->product_id);
                        if ($product) {
                            $multiplier = 1.0;
                            $custs = $item->customizations;
                            $array = is_string($custs) ? json_decode($custs, true) : $custs;
                            if (is_array($array)) {
                                foreach ($array as $opt) {
                                    if (!empty($opt['is_price_option']) && isset($opt['multiplier'])) {
                                        $multiplier = (float) $opt['multiplier'];
                                        break;
                                    }
                                }
                            }

                            if ($product->recipes->isEmpty()) {
                                $product->decrement('stock', $item->quantity * $multiplier);
                                $product->refresh();
                            }
                            StockService::deductFromRecipe(
                                $item->product_id,
                                $order->branch_id,
                                $item->quantity * $multiplier,
                                $order->order_number,
                                'OnlineOrder'
                            );
                        }
                    }
                }

                // Restore stock if a confirmed/preparing/ready/delivery order gets cancelled
                if ($oldStatus !== 'pending' && $oldStatus !== 'cancelled' && $request->status === 'cancelled') {
                    foreach ($order->items as $item) {
                        $product = Product::with('recipes')->find($item->product_id);
                        if ($product) {
                            $multiplier = 1.0;
                            $custs = $item->customizations;
                            $array = is_string($custs) ? json_decode($custs, true) : $custs;
                            if (is_array($array)) {
                                foreach ($array as $opt) {
                                    if (!empty($opt['is_price_option']) && isset($opt['multiplier'])) {
                                        $multiplier = (float) $opt['multiplier'];
                                        break;
                                    }
                                }
                            }

                            if ($product->recipes->isEmpty()) {
                                $product->increment('stock', $item->quantity * $multiplier);
                                $product->refresh();
                            } else {
                                StockService::restoreToRecipe(
                                    $item->product_id,
                                    $order->branch_id,
                                    $item->quantity * $multiplier,
                                    $order->order_number,
                                    'OnlineOrder'
                                );
                            }
                        }
                    }
                }
            });
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }

        if ($oldStatus !== 'preparing' && $request->status === 'preparing' && $order->delivery_type === 'delivery') {
            SimulateDeliveryJob::dispatch($order->id);
        }

        if ($oldStatus !== 'on_delivery' && $request->status === 'on_delivery' && $order->delivery_type === 'delivery') {
            SimulateThirdPartyDelivery::dispatch($order->id);
        }

        // Award Rewards if status changes to delivered
        if ($request->status === 'delivered') {
            $this->awardRewards($order);
        }

        // Dispatch Pusher Notification
        event(new OrderStatusUpdated($order));

        return back()->with('success', 'Status pesanan berhasil diperbarui.');
    }

    private function mapPosTransactionToOrder(PosTransaction $pos)
    {
        return [
            'id' => 'pos-' . $pos->id,
            'customer_id' => $pos->customer_id ?? 0,
            'merchant_id' => $pos->merchant_id,
            'branch_id' => $pos->branch_id,
            'order_number' => $pos->transaction_number,
            'delivery_type' => 'pickup',
            'status' => 'delivered',
            'payment_method' => $pos->payment_method,
            'payment_status' => 'confirmed',
            'subtotal' => (float)($pos->total + $pos->discount),
            'delivery_fee' => 0.0,
            'discount' => (float)$pos->discount,
            'total' => (float)$pos->total,
            'delivery_address' => null,
            'notes' => $pos->notes,
            'customer_name' => $pos->customer_name ?? ($pos->customer?->name ?? 'Pelanggan Umum'),
            'items' => $pos->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'order_id' => 'pos-' . $item->transaction_id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => (float)$item->unit_price,
                    'price' => (float)$item->unit_price,
                    'subtotal' => (float)$item->subtotal,
                    'notes' => $item->notes ?? null,
                    'customizations' => $item->customizations ?? null,
                    'product' => $item->product,
                ];
            }),
            'customer' => $pos->customer ?? [
                'name' => $pos->customer_name ?? 'Pelanggan Umum',
                'email' => '-',
                'phone' => '-',
            ],
            'branch' => $pos->branch,
            'cashier' => $pos->cashier,
            'merchant' => $pos->merchant,
            'created_at' => $pos->transaction_at ? $pos->transaction_at->toIso8601String() : $pos->created_at->toIso8601String(),
            'updated_at' => $pos->updated_at->toIso8601String(),
            'is_online' => false,
        ];
    }

    /**
     * Award Cashback and Referral Rewards
     */
    protected function awardRewards(Order $order)
    {
        $customer = $order->customer;
        if (! $customer) {
            return;
        }

        // 1. Award Base Purchase Points
        PointsService::earnPoints($customer->id, $order->id);

        // 2. Cashback Promo
        $promo = Promotion::active()
            ->where('merchant_id', $order->merchant_id)
            ->where('type', 'cashback_points')
            ->where('min_purchase', '<=', $order->total)
            ->first();

        if ($promo) {
            $cashback = $promo->value;
            if ($promo->max_reward && $cashback > $promo->max_reward) {
                $cashback = $promo->max_reward;
            }

            LoyaltyPoint::create([
                'customer_id' => $customer->id,
                'merchant_id' => $order->merchant_id,
                'points' => $cashback,
                'transaction_type' => 'earn',
                'reference_type' => 'cashback',
                'reference_id' => $order->id,
                'description' => "Cashback dari promo: {$promo->name}",
            ]);

            // Update balance
            $balance = UserPointsBalance::getOrCreateForUser($customer->id);
            $balance->addPoints($cashback);
        }

        // 3. Referral Reward (Only for first order)
        if ($customer->referred_by_id) {
            $orderCount = Order::where('customer_id', $customer->id)
                ->where('status', 'delivered')
                ->count();

            if ($orderCount === 1) { // This is their first delivered order
                PointsService::giveReferralBonus($customer->referred_by_id, $customer->id);
            }
        }
    }
}
