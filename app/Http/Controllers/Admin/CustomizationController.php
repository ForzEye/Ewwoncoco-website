<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customization;
use App\Models\CustomizationOption;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomizationController extends Controller
{
    public function index()
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return redirect()->route('admin.dashboard')->with('error', 'Anda tidak memiliki toko yang terdaftar.');
        }

        $customizations = Customization::where('merchant_id', $merchant->id)
            ->with(['options', 'products'])
            ->orderBy('order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $products = Product::where('merchant_id', $merchant->id)->get();

        return Inertia::render('Admin/Customizations/Index', [
            'customizations' => $customizations,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:single,multiple',
            'is_required' => 'required|boolean',
            'options' => 'required|array|min:1',
            'options.*.name' => 'required|string|max:100',
            'options.*.price' => 'required|numeric|min:0',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $customization = Customization::create([
            'merchant_id' => $merchant->id,
            'name' => $request->name,
            'type' => $request->type,
            'is_required' => $request->is_required,
            'is_active' => true,
        ]);

        foreach ($request->options as $option) {
            $customization->options()->create([
                'name' => $option['name'],
                'price' => $option['price'],
                'is_active' => true,
            ]);
        }

        if ($request->has('product_ids')) {
            $customization->products()->sync($request->product_ids);
        }

        return redirect()->route('admin.customizations.index')->with('success', 'Kustomisasi berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $customization = Customization::where('merchant_id', $merchant->id)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:single,multiple',
            'is_required' => 'required|boolean',
            'options' => 'required|array|min:1',
            'options.*.name' => 'required|string|max:100',
            'options.*.price' => 'required|numeric|min:0',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $customization->update([
            'name' => $request->name,
            'type' => $request->type,
            'is_required' => $request->is_required,
        ]);

        // Re-create options to keep it simple and clean
        $customization->options()->delete();
        foreach ($request->options as $option) {
            $customization->options()->create([
                'name' => $option['name'],
                'price' => $option['price'],
                'is_active' => true,
            ]);
        }

        if ($request->has('product_ids')) {
            $customization->products()->sync($request->product_ids);
        } else {
            $customization->products()->detach();
        }

        return redirect()->route('admin.customizations.index')->with('success', 'Kustomisasi berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $customization = Customization::where('merchant_id', $merchant->id)->findOrFail($id);
        $customization->delete();

        return redirect()->route('admin.customizations.index')->with('success', 'Kustomisasi berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:customizations,id',
            'orders.*.order' => 'required|integer',
        ]);

        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $merchant) {
            foreach ($request->orders as $item) {
                Customization::where('merchant_id', $merchant->id)
                    ->where('id', $item['id'])
                    ->update(['order' => $item['order']]);
            }
        });

        return redirect()->route('admin.customizations.index')->with('success', 'Urutan kustomisasi berhasil diperbarui.');
    }
}
