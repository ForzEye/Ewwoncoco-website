<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Events\OrderStatusUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OnlineOrderController extends Controller
{
    /**
     * Get pending online orders for the cashier's merchant
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $merchantId = $user->merchant_id ?? 1;

        $orders = Order::where('merchant_id', $merchantId)
            ->whereIn('status', ['pending', 'confirmed', 'preparing', 'ready_for_pickup'])
            ->with(['customer', 'items.product', 'branch'])
            ->latest()
            ->get();

        if ($request->wantsJson()) {
            return response()->json($orders);
        }

        return Inertia::render('POS/OnlineOrders', [
            'orders' => $orders
        ]);
    }

    /**
     * Accept (ACC) an online order
     */
    public function accept(Request $request, $id)
    {
        $user = $request->user();
        $merchantId = $user->merchant_id ?? 1;

        $order = Order::where('merchant_id', $merchantId)->findOrFail($id);
        
        if ($order->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Pesanan sudah di-ACC sebelumnya.'], 422);
        }

        $activeShift = \App\Models\PosShift::where('cashier_id', $user->id)
            ->whereNull('closed_at')
            ->first();

        $order->update([
            'status' => 'confirmed',
            'cashier_id' => $user->id,
            'shift_id' => $activeShift ? $activeShift->id : null,
        ]);

        // Deduct Stock for all items in order
        $order->load('items.product');
        foreach ($order->items as $item) {
            \App\Services\StockService::deductFromRecipe(
                $item->product_id, 
                $order->branch_id, 
                $item->quantity, 
                $order->id, 
                'OnlineOrder'
            );
        }

        // Create notification for customer
        if ($order->customer_id) {
            \App\Models\Notification::create([
                'user_id' => $order->customer_id,
                'title' => 'Pesanan Diterima',
                'body' => 'Pesanan #' . $order->order_number . ' telah dikonfirmasi dan mulai disiapkan.',
                'type' => 'order_update',
                'data' => ['order_id' => $order->id]
            ]);
        }

        // Broadcast status update to customer
        event(new OrderStatusUpdated($order));

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil diterima.',
            'order' => $order->load(['customer', 'items.product', 'branch'])
        ]);
    }

    /**
     * Update order status from POS
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:preparing,ready_for_pickup,delivered,cancelled'
        ]);

        $user = $request->user();
        $merchantId = $user->merchant_id ?? 1;

        $order = Order::where('merchant_id', $merchantId)->findOrFail($id);
        
        $updateData = ['status' => $request->status];
        
        // If cashier_id is not set yet, set it now
        if (!$order->cashier_id) {
            $updateData['cashier_id'] = $user->id;
            
            $activeShift = \App\Models\PosShift::where('cashier_id', $user->id)
                ->whereNull('closed_at')
                ->first();
            if ($activeShift) {
                $updateData['shift_id'] = $activeShift->id;
            }
        }

        $order->update($updateData);

        // Create notification for customer
        if ($order->customer_id) {
            \App\Models\Notification::create([
                'user_id' => $order->customer_id,
                'title' => 'Pembaruan Pesanan #' . $order->order_number,
                'body' => 'Status pesanan Anda sekarang: ' . strtoupper(str_replace('_', ' ', $order->status)),
                'type' => 'order_update',
                'data' => ['order_id' => $order->id]
            ]);
        }

        // Broadcast status update to customer
        event(new OrderStatusUpdated($order));

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui.',
            'order' => $order->load(['customer', 'items.product', 'branch'])
        ]);
    }

    /**
     * Reject an online order
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:255'
        ]);

        $user = $request->user();
        $merchantId = $user->merchant_id ?? 1;

        $order = Order::where('merchant_id', $merchantId)->findOrFail($id);
        
        $order->update([
            'status' => 'cancelled',
            'rejection_reason' => $request->reason
        ]);

        // Create notification for customer
        if ($order->customer_id) {
            \App\Models\Notification::create([
                'user_id' => $order->customer_id,
                'title' => 'Pesanan Dibatalkan',
                'body' => 'Maaf, pesanan #' . $order->order_number . ' dibatalkan. Alasan: ' . $request->reason,
                'type' => 'order_update',
                'data' => ['order_id' => $order->id]
            ]);
        }

        // Broadcast status update to customer
        event(new OrderStatusUpdated($order));

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil ditolak.',
            'order' => $order->load(['customer', 'items.product', 'branch'])
        ]);
    }
}
