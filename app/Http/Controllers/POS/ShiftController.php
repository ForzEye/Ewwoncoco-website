<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Order;
use App\Models\PosShift;
use App\Models\PosTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $activeShift = PosShift::where('cashier_id', $user->id)
            ->whereNull('closed_at')
            ->with('branch')
            ->first();

        $breakdown = [
            'expected_cash' => 0,
            'expected_qris' => 0,
            'expected_online' => 0,
            'expected_gofood' => 0,
            'expected_grabfood' => 0,
            'expected_shopeefood' => 0,
        ];

        if ($activeShift) {
            // Find all shifts opened today for this branch
            $todayShifts = PosShift::where('branch_id', $activeShift->branch_id)
                ->whereDate('opened_at', today())
                ->get();
                
            $todayShiftIds = $todayShifts->pluck('id');
            if ($todayShiftIds->isEmpty()) {
                $todayShiftIds = collect([$activeShift->id]);
            }

            // Expected cash is the current shift's opening cash + cash sales from all shifts today
            $breakdown['expected_cash'] = $activeShift->opening_cash + PosTransaction::whereIn('shift_id', $todayShiftIds)
                ->where('payment_method', 'cash')
                ->sum('total');

            // Expected qris is qris sales from all shifts today
            $breakdown['expected_qris'] = PosTransaction::whereIn('shift_id', $todayShiftIds)
                ->where('payment_method', 'qris')
                ->sum('total');

            // Expected online is online orders since the earliest shift today
            $firstShiftOpenedAt = $todayShifts->min('opened_at') ?? $activeShift->opened_at;
            $breakdown['expected_online'] = Order::where('merchant_id', $activeShift->merchant_id ?? 1)
                ->where('branch_id', $activeShift->branch_id)
                ->whereBetween('created_at', [$firstShiftOpenedAt, now()])
                ->whereIn('status', ['completed', 'delivered', 'ready_for_pickup'])
                ->sum('total');

            // Expected ojol sales from all shifts today
            $breakdown['expected_gofood'] = PosTransaction::whereIn('shift_id', $todayShiftIds)
                ->where('payment_method', 'gofood')
                ->sum('total');

            $breakdown['expected_grabfood'] = PosTransaction::whereIn('shift_id', $todayShiftIds)
                ->where('payment_method', 'grabfood')
                ->sum('total');

            $breakdown['expected_shopeefood'] = PosTransaction::whereIn('shift_id', $todayShiftIds)
                ->where('payment_method', 'shopeefood')
                ->sum('total');
        }

        $branches = Branch::where('is_active', true)->get();

        return Inertia::render('POS/Shifts', [
            'activeShift' => $activeShift,
            'branches' => $branches,
            'breakdown' => array_map(fn ($val) => (float) $val, $breakdown),
        ]);
    }

    public function adminIndex(Request $request)
    {
        $activeShifts = PosShift::whereNull('closed_at')
            ->with(['cashier', 'branch'])
            ->orderBy('opened_at', 'desc')
            ->get();

        $recentShifts = PosShift::whereNotNull('closed_at')
            ->with(['cashier', 'branch'])
            ->orderBy('closed_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Shifts/Index', [
            'activeShifts' => $activeShifts,
            'recentShifts' => $recentShifts,
        ]);
    }

    public function open(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'opening_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        // Cek jika sudah ada shift aktif
        $exists = PosShift::where('cashier_id', $user->id)
            ->whereNull('closed_at')
            ->exists();

        if ($exists) {
            return back()->with('error', 'Anda masih memiliki shift yang aktif.');
        }

        PosShift::create([
            'cashier_id' => $user->id,
            'branch_id' => $request->branch_id,
            'opened_at' => now(),
            'opening_cash' => $request->opening_cash,
            'notes' => $request->notes,
        ]);

        return redirect()->route('pos.screen')->with('success', 'Shift berhasil dibuka.');
    }

    public function close(Request $request)
    {
        $request->validate([
            'closing_cash' => 'required|numeric|min:0',
            'closing_qris' => 'required|numeric|min:0',
            'closing_online' => 'required|numeric|min:0',
            'closing_grab' => 'required|numeric|min:0',
            'closing_gojek' => 'required|numeric|min:0',
            'closing_shopeefood' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $activeShift = PosShift::where('cashier_id', $user->id)
            ->whereNull('closed_at')
            ->first();

        if (! $activeShift) {
            return back()->with('error', 'Tidak ada shift aktif yang bisa ditutup.');
        }

        $activeShift->update([
            'closed_at' => now(),
            'closing_cash' => $request->closing_cash,
            'closing_qris' => $request->closing_qris,
            'closing_online' => $request->closing_online,
            'closing_grab' => $request->closing_grab,
            'closing_gojek' => $request->closing_gojek,
            'closing_shopeefood' => $request->closing_shopeefood,
            'notes' => $activeShift->notes."\nClosed Notes: ".$request->notes,
        ]);

        return redirect()->route('pos.shifts')->with('success', 'Shift berhasil ditutup.');
    }

    /**
     * Unlock a locked shift (Admin only)
     */
    public function unlock(Request $request, $id)
    {
        if (! in_array($request->user()->role, ['admin', 'super_admin'])) {
            abort(403);
        }

        $shift = PosShift::findOrFail($id);
        $shift->update([
            'is_locked' => false,
            'void_count' => 0, // Optional: reset count too
        ]);

        return back()->with('success', 'Shift berhasil dibuka kuncinya.');
    }

    /**
     * Force close a shift (Admin only)
     */
    public function forceClose(Request $request, $id)
    {
        if (! in_array($request->user()->role, ['admin', 'super_admin'])) {
            abort(403);
        }

        $shift = PosShift::findOrFail($id);

        if ($shift->closed_at) {
            return back()->with('error', 'Shift sudah ditutup.');
        }

        $shift->update([
            'closed_at' => now(),
            'closing_cash' => $request->closing_cash ?? 0,
            'notes' => $shift->notes."\n[FORCE CLOSED BY ADMIN]",
        ]);

        return back()->with('success', 'Shift berhasil ditutup paksa.');
    }
}
