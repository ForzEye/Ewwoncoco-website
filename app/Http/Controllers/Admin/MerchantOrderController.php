<?php

namespace App\Http\Controllers\Admin;

use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Jobs\SimulateDeliveryJob;
use App\Jobs\SimulateThirdPartyDelivery;
use App\Models\LoyaltyPoint;
use App\Models\Order;
use App\Models\Promotion;
use App\Models\UserPointsBalance;
use App\Services\PointsService;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MerchantOrderController extends Controller
{
    public function index()
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return redirect()->route('admin.dashboard')->with('error', 'Anda tidak memiliki toko yang terdaftar.');
        }

        $orders = Order::where('merchant_id', $merchant->id)->with(['customer', 'branch'])->latest()->get();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show($id)
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $order = Order::where('merchant_id', $merchant->id)->with(['items.product', 'customer', 'branch'])->findOrFail($id);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,ready_for_pickup,on_delivery,delivered,cancelled',
        ]);

        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $order = Order::where('merchant_id', $merchant->id)->with('items.product')->findOrFail($id);
        $oldStatus = $order->status;

        try {
            DB::transaction(function () use ($order, $request, $oldStatus) {
                $order->update(['status' => $request->status]);

                // Trigger simulation if status changes to preparing or on_delivery
                if ($oldStatus !== 'confirmed' && $request->status === 'confirmed') {
                    // Deduct Stock for all items in order
                    foreach ($order->items as $item) {
                        StockService::deductFromRecipe(
                            $item->product_id,
                            $order->branch_id,
                            $item->quantity,
                            $order->order_number,
                            'OnlineOrder'
                        );
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
