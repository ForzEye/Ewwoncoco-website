<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class AdminSettingsController extends Controller
{
    public function index(Request $request)
    {
        $merchant = Merchant::where('owner_id', $request->user()->id)->firstOrFail();
        $branch = \App\Models\Branch::where('merchant_id', $merchant->id)->first();

        return Inertia::render('Admin/Settings', [
            'merchant' => $merchant,
            'branch' => $branch,
            'loyalty_settings' => \App\Services\PointsService::getSettings(),
        ]);
    }

    public function update(Request $request)
    {
        $merchant = Merchant::where('owner_id', $request->user()->id)->firstOrFail();
        $isSuperAdmin = $request->user()->isSuperAdmin();

        $rules = [
            'phone'               => 'required|string|max:20',
            'receipt_header'      => 'nullable|string',
            'receipt_footer'      => 'nullable|string',
            'instagram_handle'    => 'nullable|string|max:100',
            'whatsapp_number'     => 'nullable|string|max:20',
            'tiktok_handle'       => 'nullable|string|max:100',
            'receipt_font_size'   => 'required|integer|min:7|max:12',
            'receipt_paper_width' => 'required|string|in:58mm,80mm',
            'receipt_extra_bold'  => 'required|boolean',
            'receipt_left_margin' => 'required|integer|min:-15|max:15',
            'receipt_font_weight' => 'required|integer|min:100|max:950',
            'bank_name'           => 'nullable|string|max:50',
            'bank_account_number' => 'nullable|string|max:30',
            'bank_account_name'   => 'nullable|string|max:100',
            'qris_image'          => 'nullable|image|mimes:png,jpg,jpeg|max:2048',
        ];

        if ($isSuperAdmin) {
            $rules['name'] = 'required|string|max:100';
            $rules['address'] = 'required|string';
            $rules['lat'] = 'nullable|numeric';
            $rules['lng'] = 'nullable|numeric';
        }

        $validated = $request->validate($rules);

        // Handle QRIS image upload
        if ($request->hasFile('qris_image')) {
            // Delete old image if exists and is a storage path
            if ($merchant->qris_image_url && !str_starts_with($merchant->qris_image_url, 'http')) {
                Storage::disk('public')->delete($merchant->qris_image_url);
            }
            $path = $request->file('qris_image')->store('qris', 'public');
            $validated['qris_image_url'] = $path;
        }

        // Remove files and map parameters not in merchants table
        unset($validated['qris_image']);
        
        $lat = null;
        $lng = null;
        if ($isSuperAdmin) {
            $lat = $validated['lat'] ?? null;
            $lng = $validated['lng'] ?? null;
            unset($validated['lat']);
            unset($validated['lng']);
        }

        $merchant->update($validated);

        // Auto-update first branch corresponding to this merchant
        $branch = \App\Models\Branch::where('merchant_id', $merchant->id)->first();
        if ($branch) {
            $branchData = [
                'phone' => $request->phone,
            ];

            if ($isSuperAdmin) {
                $branchData['address'] = $request->address;
                if ($lat !== null) $branchData['lat'] = $lat;
                if ($lng !== null) $branchData['lng'] = $lng;
            }

            $branch->update($branchData);

            // Clear branch caching so changes reflect immediately in mobile app
            \Illuminate\Support\Facades\Cache::forget('outlets_active');
        }

        // Handle Loyalty Settings (SuperAdmin only)
        if ($isSuperAdmin && $request->has('loyalty_settings')) {
            foreach ($request->loyalty_settings as $key => $value) {
                \App\Models\AppSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value, 'type' => 'number', 'group' => 'loyalty']
                );
            }
        }

        return redirect()->back()->with('success', 'Pengaturan berhasil diperbarui.');
    }
}
