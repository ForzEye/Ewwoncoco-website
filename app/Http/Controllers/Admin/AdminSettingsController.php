<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AdminSettingsController extends Controller
{
    public function index(Request $request)
    {
        $merchant = Merchant::where('owner_id', $request->user()->id)->firstOrFail();

        return Inertia::render('Admin/Settings', [
            'merchant' => $merchant,
            'loyalty_settings' => \App\Services\PointsService::getSettings(),
        ]);
    }

    public function update(Request $request)
    {
        $merchant = Merchant::where('owner_id', $request->user()->id)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'receipt_header' => 'nullable|string',
            'receipt_footer' => 'nullable|string',
            'instagram_handle' => 'nullable|string|max:100',
            'whatsapp_number' => 'nullable|string|max:20',
            'tiktok_handle' => 'nullable|string|max:100',
        ]);

        $merchant->update($validated);

        // Handle Loyalty Settings (SuperAdmin only)
        if ($request->user()->isSuperAdmin() && $request->has('loyalty_settings')) {
            foreach ($request->loyalty_settings as $key => $value) {
                \App\Models\AppSetting::setVal($key, $value);
            }
        }

        return redirect()->back()->with('success', 'Pengaturan berhasil diperbarui.');
    }
}
