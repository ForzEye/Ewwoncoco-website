<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MarketingController extends Controller
{
    public function index()
    {
        $merchant = \Illuminate\Support\Facades\Auth::user()->merchant;
        if (!$merchant) {
            return redirect()->route('admin.dashboard')->with('error', 'Anda tidak memiliki toko yang terdaftar.');
        }

        $promotions = Promotion::where('merchant_id', $merchant->id)
            ->latest()
            ->get();

        return Inertia::render('Admin/Marketing/Index', [
            'promotions' => $promotions
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:cashback_points,fixed_discount',
            'value' => 'required|numeric|min:0',
            'min_purchase' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $merchant = \Illuminate\Support\Facades\Auth::user()->merchant;
        if (!$merchant) return back()->with('error', 'Toko tidak ditemukan.');

        Promotion::create([
            'merchant_id' => $merchant->id,
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'value' => $request->value,
            'min_purchase' => $request->min_purchase,
            'max_reward' => $request->max_reward,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'is_active' => true,
        ]);

        return back()->with('success', 'Promo berhasil dibuat.');
    }

    public function toggle(Request $request, $id)
    {
        $merchant = \Illuminate\Support\Facades\Auth::user()->merchant;
        if (!$merchant) return back()->with('error', 'Toko tidak ditemukan.');

        $promo = Promotion::where('merchant_id', $merchant->id)->findOrFail($id);
        $promo->update(['is_active' => !$promo->is_active]);

        return back()->with('success', 'Status promo diperbarui.');
    }
}
