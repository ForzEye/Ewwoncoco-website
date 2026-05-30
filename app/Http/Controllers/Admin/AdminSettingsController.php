<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Branch;
use App\Models\Merchant;
use App\Services\PointsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminSettingsController extends Controller
{
    public function index(Request $request)
    {
        $merchant = Merchant::where('owner_id', $request->user()->id)->firstOrFail();
        $branch = Branch::where('merchant_id', $merchant->id)->first();

        return Inertia::render('Admin/Settings', [
            'merchant' => $merchant,
            'branch' => $branch,
            'loyalty_settings' => PointsService::getSettings(),
        ]);
    }

    public function update(Request $request)
    {
        $merchant = Merchant::where('owner_id', $request->user()->id)->firstOrFail();
        $isSuperAdmin = $request->user()->isSuperAdmin();

        $rules = [
            'phone' => 'required|string|max:20',
            'receipt_header' => 'nullable|string',
            'receipt_footer' => 'nullable|string',
            'instagram_handle' => 'nullable|string|max:100',
            'whatsapp_number' => 'nullable|string|max:20',
            'tiktok_handle' => 'nullable|string|max:100',
            'receipt_font_size' => 'required|integer|min:7|max:12',
            'receipt_paper_width' => 'required|string|in:58mm,80mm',
            'receipt_extra_bold' => 'required|boolean',
            'receipt_left_margin' => 'required|integer|min:-15|max:15',
            'receipt_font_weight' => 'required|integer|min:100|max:950',
            'bank_name' => 'nullable|string|max:50',
            'bank_account_number' => 'nullable|string|max:30',
            'bank_account_name' => 'nullable|string|max:100',
            'qris_image' => 'nullable|image|mimes:png,jpg,jpeg|max:2048',
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
            // Delete old image if exists
            if ($merchant->qris_image_url) {
                if (str_starts_with($merchant->qris_image_url, 'http')) {
                    $oldPath = parse_url($merchant->qris_image_url, PHP_URL_PATH);
                    $oldPath = ltrim(str_replace('/'.env('AWS_BUCKET'), '', $oldPath), '/');
                    Storage::disk('s3')->delete($oldPath);
                } else {
                    Storage::disk('public')->delete($merchant->qris_image_url);
                }
            }
            $path = $request->file('qris_image')->store('qris', 's3');
            $validated['qris_image_url'] = Storage::disk('s3')->url($path);
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
        $branch = Branch::where('merchant_id', $merchant->id)->first();
        if ($branch) {
            $branchData = [
                'phone' => $request->phone,
            ];

            if ($isSuperAdmin) {
                $branchData['address'] = $request->address;
                if ($lat !== null) {
                    $branchData['lat'] = $lat;
                }
                if ($lng !== null) {
                    $branchData['lng'] = $lng;
                }
            }

            $branch->update($branchData);

            // Clear branch caching so changes reflect immediately in mobile app
            Cache::forget('outlets_active');
        }

        // Handle Loyalty Settings (SuperAdmin only)
        if ($isSuperAdmin && $request->has('loyalty_settings')) {
            foreach ($request->loyalty_settings as $key => $value) {
                AppSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value, 'type' => 'number', 'group' => 'loyalty']
                );
            }
        }

        return redirect()->back()->with('success', 'Pengaturan berhasil diperbarui.');
    }
}
