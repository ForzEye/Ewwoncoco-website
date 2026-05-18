<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecipeController extends Controller
{
    public function index()
    {
        $merchantId = auth()->user()->merchant_id;
        
        $products = Product::where('merchant_id', $merchantId)
            ->with(['recipes.ingredient', 'category'])
            ->get();

        $ingredients = Ingredient::where('merchant_id', $merchantId)->get();

        return Inertia::render('Admin/Inventory/Recipes', [
            'products' => $products,
            'ingredients' => $ingredients
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.0001',
        ]);

        Recipe::updateOrCreate(
            ['product_id' => $request->product_id, 'ingredient_id' => $request->ingredient_id],
            ['quantity' => $request->quantity]
        );

        return back()->with('success', 'Bahan berhasil ditambahkan ke resep.');
    }

    public function destroy($id)
    {
        $recipe = Recipe::findOrFail($id);
        $recipe->delete();

        return back()->with('success', 'Bahan berhasil dihapus dari resep.');
    }
}
