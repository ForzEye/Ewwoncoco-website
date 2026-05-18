<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IngredientController extends Controller
{
    public function index()
    {
        $merchantId = auth()->user()->merchant_id;
        $ingredients = Ingredient::where('merchant_id', $merchantId)->get();

        return Inertia::render('Admin/Inventory/Ingredients', [
            'ingredients' => $ingredients
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'unit' => 'required|string|max:50',
        ]);

        Ingredient::create([
            'merchant_id' => auth()->user()->merchant_id,
            'name' => $request->name,
            'unit' => $request->unit,
        ]);

        return back()->with('success', 'Bahan baku berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'unit' => 'required|string|max:50',
        ]);

        $ingredient = Ingredient::findOrFail($id);
        $ingredient->update($request->only('name', 'unit'));

        return back()->with('success', 'Bahan baku berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $ingredient = Ingredient::findOrFail($id);
        $ingredient->delete();

        return back()->with('success', 'Bahan baku berhasil dihapus.');
    }
}
