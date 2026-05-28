<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Merchant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchManagementController extends Controller
{
    public function index(Request $request)
    {
        $branches = Branch::query()
            ->with('merchant')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $merchants = Merchant::where('is_active', true)->get();

        return Inertia::render('SuperAdmin/Branches', [
            'branches' => $branches,
            'merchants' => $merchants,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'merchant_id' => 'required|exists:merchants,id',
            'name' => 'required|string|max:100',
            'address' => 'required|string',
            'phone' => 'required|string|max:20',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
        ]);

        Branch::create($request->all());
        \Illuminate\Support\Facades\Cache::forget('outlets_active');

        return back()->with('success', 'Cabang berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'address' => 'required|string',
            'phone' => 'required|string|max:20',
            'is_active' => 'required|boolean',
        ]);

        $branch = Branch::findOrFail($id);
        $branch->update($request->all());
        \Illuminate\Support\Facades\Cache::forget('outlets_active');

        return back()->with('success', 'Cabang berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $branch = Branch::findOrFail($id);
        $branch->delete();
        \Illuminate\Support\Facades\Cache::forget('outlets_active');

        return back()->with('success', 'Cabang berhasil dihapus.');
    }
}
