<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     * Semua data ini tersedia di setiap halaman React via usePage().props
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone,
                    'role' => $request->user()->role,
                    'avatar_url' => $request->user()->avatar_url,
                    'is_active' => $request->user()->is_active,
                ] : null,
            ],

            // Flash messages — tersedia di semua halaman
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],

            // App config yang aman untuk di-share ke frontend
            'app' => [
                'name' => config('app.name'),
                'locale' => app()->getLocale(),
                'version' => config('app.version', '3.1'),
            ],

            'site_settings' => fn () => SystemSetting::all()->pluck('value', 'key')->toArray(),
        ]);
    }
}
