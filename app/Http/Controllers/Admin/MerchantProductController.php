<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MerchantProductController extends Controller
{
    public function index()
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return redirect()->route('admin.dashboard');
        }

        $products = Product::where('merchant_id', $merchant->id)
            ->with(['category', 'recipes.ingredient.branchStocks'])
            ->latest()
            ->get();

        $products->transform(function ($product) {
            $product->stock = $product->getGlobalDynamicStock();
            return $product;
        });

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
        ]);
    }

    public function create()
    {
        $merchant = Auth::user()->merchant;
        $categories = ProductCategory::all();
        $ingredients = Ingredient::where('merchant_id', $merchant->id)->get();

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories,
            'ingredients' => $ingredients,
        ]);
    }

    public function store(Request $request)
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $request->validate([
            'name' => 'required|string|max:150',
            'category_id' => 'required|exists:product_categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products');
            $imageUrl = Storage::url($path);
        }

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'name' => $request->name,
            'slug' => Str::slug($request->name).'-'.Str::random(5),
            'category_id' => $request->category_id,
            'price' => $request->price,
            'stock' => $request->stock,
            'description' => $request->description,
            'image_url' => $imageUrl,
            'is_available' => true,
        ]);

        // Handle Recipe items if provided
        if ($request->has('recipes') && is_array($request->recipes)) {
            foreach ($request->recipes as $recipeData) {
                if (! empty($recipeData['ingredient_id']) && ! empty($recipeData['quantity'])) {
                    Recipe::create([
                        'product_id' => $product->id,
                        'ingredient_id' => $recipeData['ingredient_id'],
                        'quantity' => $recipeData['quantity'],
                    ]);
                }
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return redirect()->route('admin.dashboard');
        }

        $product = Product::where('merchant_id', $merchant->id)->with('recipes')->findOrFail($id);
        $categories = ProductCategory::all();
        $ingredients = Ingredient::where('merchant_id', $merchant->id)->get();

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'ingredients' => $ingredients,
        ]);
    }

    public function update(Request $request, $id)
    {
        $merchant = Auth::user()->merchant;
        if (! $merchant) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $product = Product::where('merchant_id', $merchant->id)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:150',
            'category_id' => 'required|exists:product_categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = $request->except(['image', 'recipes']);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image_url) {
                // For S3/MinIO, the path is the URL suffix or we can just try to extract it
                $oldPath = parse_url($product->image_url, PHP_URL_PATH);
                $oldPath = ltrim(str_replace('/'.env('AWS_BUCKET'), '', $oldPath), '/');
                Storage::delete($oldPath);
            }

            $path = $request->file('image')->store('products');
            $data['image_url'] = Storage::url($path);
        }

        $product->update($data);

        // Handle Recipe items sync
        if ($request->has('recipes') && is_array($request->recipes)) {
            // Delete old ones first
            $product->recipes()->delete();

            foreach ($request->recipes as $recipeData) {
                if (! empty($recipeData['ingredient_id']) && ! empty($recipeData['quantity'])) {
                    Recipe::create([
                        'product_id' => $product->id,
                        'ingredient_id' => $recipeData['ingredient_id'],
                        'quantity' => $recipeData['quantity'],
                    ]);
                }
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $merchant = Auth::user()->merchant;
        $product = Product::where('merchant_id', $merchant->id)->findOrFail($id);

        if ($product->image_url) {
            $oldPath = parse_url($product->image_url, PHP_URL_PATH);
            $oldPath = ltrim(str_replace('/'.env('AWS_BUCKET'), '', $oldPath), '/');
            Storage::delete($oldPath);
        }

        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus.');
    }
}
