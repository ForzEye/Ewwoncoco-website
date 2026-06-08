<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class MarketingController extends Controller
{
    public function index()
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return redirect()->route('admin.dashboard')->with('error', 'Anda tidak memiliki toko yang terdaftar.');
        }

        $promotions = Promotion::where('merchant_id', $merchant->id)
            ->with(['buyProduct', 'getProduct'])
            ->latest()
            ->get();

        $promotions->transform(function ($promo) {
            // Count from POS transaction items where notes matches the promotion name
            $posUsage = \DB::table('pos_transaction_items')
                ->where('notes', 'like', 'PROMO BOGO: ' . $promo->name)
                ->sum('quantity');

            // Count from online order items where notes matches the promotion name
            $onlineUsage = \DB::table('order_items')
                ->where('notes', 'like', 'PROMO BOGO: ' . $promo->name)
                ->sum('quantity');

            // Calculate total cost (quantity of free items * original product price)
            $posCost = \DB::table('pos_transaction_items')
                ->join('products', 'pos_transaction_items.product_id', '=', 'products.id')
                ->where('pos_transaction_items.notes', 'like', 'PROMO BOGO: ' . $promo->name)
                ->sum(\DB::raw('pos_transaction_items.quantity * products.price'));

            $onlineCost = \DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->where('order_items.notes', 'like', 'PROMO BOGO: ' . $promo->name)
                ->sum(\DB::raw('order_items.quantity * products.price'));

            $promo->used_count = (int) ($posUsage + $onlineUsage);
            $promo->marketing_cost = (float) ($posCost + $onlineCost);
            return $promo;
        });

        $products = Product::where('merchant_id', $merchant->id)->get();

        return Inertia::render('Admin/Marketing/Index', [
            'promotions' => $promotions,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:cashback_points,fixed_discount,bogo',
            'value' => 'required_unless:type,bogo|nullable|numeric|min:0',
            'min_purchase' => 'required_unless:type,bogo|nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'buy_product_id' => 'nullable',
            'get_product_id' => 'nullable',
            'buy_quantity' => 'required_if:type,bogo|nullable|integer|min:1',
            'get_quantity' => 'required_if:type,bogo|nullable|integer|min:1',
            'applicable_on' => 'required|in:all,online,offline,gofood,grabfood,shopeefood',
        ]);

        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        Promotion::create([
            'merchant_id' => $merchant->id,
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'value' => $request->type === 'bogo' ? 0 : $request->value,
            'min_purchase' => $request->type === 'bogo' ? 0 : $request->min_purchase,
            'max_reward' => $request->max_reward,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'buy_product_id' => ($request->buy_product_id === 'all' || ! $request->buy_product_id) ? null : $request->buy_product_id,
            'get_product_id' => ($request->get_product_id === 'all' || ! $request->get_product_id) ? null : $request->get_product_id,
            'buy_quantity' => $request->buy_quantity,
            'get_quantity' => $request->get_quantity,
            'is_active' => true,
            'applicable_on' => $request->applicable_on,
        ]);

        Cache::forget('promotions_active');

        return back()->with('success', 'Promo berhasil dibuat.');
    }

    public function toggle(Request $request, $id)
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $promo = Promotion::where('merchant_id', $merchant->id)->findOrFail($id);
        $promo->update(['is_active' => ! $promo->is_active]);

        Cache::forget('promotions_active');

        return back()->with('success', 'Status promo diperbarui.');
    }

    public function destroy($id)
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $promo = Promotion::where('merchant_id', $merchant->id)->findOrFail($id);
        $promo->delete();

        Cache::forget('promotions_active');

        return back()->with('success', 'Promo berhasil dihapus.');
    }
}
