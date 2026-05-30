<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PosShift;
use App\Models\PosTransaction;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $date = $request->input('date', now()->toDateString());

        $posTransactions = PosTransaction::where('cashier_id', $user->id)
            ->whereDate('transaction_at', $date)
            ->with(['items.product', 'shift', 'merchant', 'branch', 'cashier'])
            ->get();

        $onlineOrders = Order::where('cashier_id', $user->id)
            ->where('status', 'delivered')
            ->whereDate('updated_at', $date)
            ->with(['items.product', 'merchant', 'branch', 'customer', 'cashier'])
            ->get();

        // Standardize format for frontend
        $merged = $posTransactions->concat($onlineOrders)->map(function ($item) {
            $isOnline = isset($item->order_number);

            return [
                'id' => $item->id,
                'is_online' => $isOnline,
                'transaction_number' => $isOnline ? $item->order_number : $item->transaction_number,
                'transaction_at' => $isOnline ? $item->updated_at : $item->transaction_at,
                'payment_method' => $item->payment_method,
                'total' => (float) $item->total,
                'items' => $item->items,
                'merchant' => $item->merchant ?? null,
                'branch' => $item->branch ?? null,
                'cashier' => $isOnline ? ($item->cashier ?? null) : ($item->cashier ?? null),
                // Map customer to cashier for online orders display if needed
                'customer' => $isOnline ? ($item->customer ?? null) : null,
            ];
        })->sortByDesc(function ($item) {
            return Carbon::parse($item['transaction_at'])->timestamp;
        })->values();

        // Manual pagination for merged collection
        $page = $request->input('page', 1);
        $perPage = 15;
        $paginated = new LengthAwarePaginator(
            $merged->forPage($page, $perPage)->values(),
            $merged->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('POS/Transactions', [
            'transactions' => $paginated,
            'filters' => ['date' => $date],
        ]);
    }

    public function show($id)
    {
        $transaction = PosTransaction::with(['items.product', 'cashier', 'shift.branch'])
            ->findOrFail($id);

        return response()->json($transaction);
    }

    public function void(Request $request, $id)
    {
        $transaction = PosTransaction::findOrFail($id);
        $user = $request->user();

        // Cek shift aktif kasir tersebut
        $activeShift = PosShift::where('id', $transaction->shift_id)
            ->whereNull('closed_at')
            ->first();

        if (! $activeShift) {
            $msg = 'Shift sudah ditutup.';

            return $request->wantsJson()
                ? response()->json(['success' => false, 'message' => $msg], 403)
                : redirect()->back()->with('error', $msg);
        }

        if ($activeShift->is_locked) {
            $msg = 'POS sudah terkunci.';

            return $request->wantsJson()
                ? response()->json(['success' => false, 'message' => $msg], 403)
                : redirect()->back()->with('error', $msg);
        }

        // Logic Void Limit
        if ($activeShift->void_count >= 3) {
            $activeShift->update(['is_locked' => true]);
            $msg = 'Batas void (3x) tercapai! POS Terkunci.';

            return $request->wantsJson()
                ? response()->json(['success' => false, 'message' => $msg], 403)
                : redirect()->back()->with('error', $msg);
        }

        return DB::transaction(function () use ($transaction, $activeShift, $request) {
            // Restore Stock
            foreach ($transaction->items as $item) {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }

            // Reverse Loyalty Points if customer is associated
            if ($transaction->customer_id) {
                // 1. Revert Earned Points
                $earnLedger = \App\Models\LoyaltyPoint::where('customer_id', $transaction->customer_id)
                    ->where('reference_type', 'pos_transaction')
                    ->where('reference_id', $transaction->id)
                    ->where('transaction_type', 'earn')
                    ->first();

                if ($earnLedger) {
                    $balance = \App\Models\UserPointsBalance::where('user_id', $transaction->customer_id)->first();
                    if ($balance) {
                        $balance->deductPoints($earnLedger->points);
                    }
                    $earnLedger->delete();
                }

                // 2. Revert Redeemed Points (Kembalikan poin yang dipakai potong harga)
                $redeemLedger = \App\Models\LoyaltyPoint::where('customer_id', $transaction->customer_id)
                    ->where('reference_type', 'pos_transaction')
                    ->where('reference_id', $transaction->id)
                    ->where('transaction_type', 'redeem')
                    ->first();

                if ($redeemLedger) {
                    $balance = \App\Models\UserPointsBalance::getOrCreateForUser($transaction->customer_id);
                    $balance->addPoints(abs($redeemLedger->points));
                    $redeemLedger->delete();
                }
            }

            $transaction->delete(); // For now let's just delete to restore stock correctly.

            $activeShift->increment('void_count');

            $message = 'Transaksi berhasil dibatalkan.';
            if ($activeShift->void_count >= 3) {
                $activeShift->update(['is_locked' => true]);
                $message .= ' Batas void tercapai, POS terkunci.';
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'void_count' => $activeShift->void_count,
                ]);
            }

            return redirect()->back()->with('success', $message);
        });
    }
}
