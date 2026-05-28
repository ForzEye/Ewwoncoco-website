<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class VoucherController extends Controller
{
    public function index()
    {
        $merchant = Auth::user()->merchant;
        if (!$merchant) return redirect()->route('admin.dashboard');

        $vouchers = Voucher::where('merchant_id', $merchant->id)
            ->whereNull('user_id')
            ->latest()
            ->get();

        return Inertia::render('Admin/Vouchers', [
            'vouchers' => $vouchers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'code' => 'required|string|max:30|unique:vouchers,code',
            'discount_type' => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_purchase' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:today',
            'is_online_only' => 'boolean',
            'points_cost' => 'nullable|integer|min:1',
        ]);

        $merchant = Auth::user()->merchant;

        Voucher::create([
            'merchant_id' => $merchant->id,
            'name' => $request->name,
            'description' => $request->description,
            'code' => strtoupper($request->code),
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'min_purchase' => $request->min_purchase,
            'max_discount' => $request->max_discount,
            'usage_limit' => $request->usage_limit,
            'expires_at' => $request->expires_at,
            'is_online_only' => $request->is_online_only ?? true,
            'points_cost' => $request->points_cost,
            'is_active' => true,
        ]);

        return back()->with('success', 'Voucher berhasil dibuat.');
    }

    public function toggle(Request $request, $id)
    {
        $merchant = Auth::user()->merchant;
        $voucher = Voucher::where('merchant_id', $merchant->id)->whereNull('user_id')->findOrFail($id);
        $voucher->update(['is_active' => !$voucher->is_active]);

        return back()->with('success', 'Status voucher diperbarui.');
    }

    public function destroy($id)
    {
        $merchant = Auth::user()->merchant;
        $voucher = Voucher::where('merchant_id', $merchant->id)->whereNull('user_id')->findOrFail($id);
        $voucher->delete();

        return back()->with('success', 'Voucher berhasil dihapus.');
    }
}
