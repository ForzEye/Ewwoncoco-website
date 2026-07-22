<?php

namespace App\Providers;

use App\Services\Delivery\DeliveryServiceInterface;
use App\Services\Delivery\MockDeliveryService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(
            DeliveryServiceInterface::class,
            MockDeliveryService::class
        );
    }



    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (str_contains(config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        // Configured Throttlers from Audit recommendation
        RateLimiter::for('orders', function (Request $request) {
            return Limit::perMinutes(10, 5)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('vouchers', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('chat', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('otp-send', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip().'|'.$request->input('identifier'));
        });

        RateLimiter::for('otp-verify', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip().'|'.$request->input('identifier'));
        });
    }
}
