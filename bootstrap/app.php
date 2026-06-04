<?php

use App\Http\Middleware\ApiMonitoringMiddleware;
use App\Http\Middleware\ForceHttps;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\VerifyWebhookSignature;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Support\Facades\Http;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        // Force HTTPS & Security headers & Inertia middleware
        $middleware->web(append: [
            ForceHttps::class,
            SecurityHeaders::class,
            HandleInertiaRequests::class,
            ApiMonitoringMiddleware::class,
        ]);

        // Force HTTPS & Security headers & CORS for API routes
        $middleware->api(append: [
            ForceHttps::class,
            SecurityHeaders::class,
            HandleCors::class,
            ApiMonitoringMiddleware::class,
        ]);

        // Role-based access middleware alias
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'verify.webhook' => VerifyWebhookSignature::class,
        ]);
    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->command('check:low-stock')->hourly();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->reportable(function (Throwable $e) {
            try {
                $userAgent = request()->header('User-Agent', '');
                $isMobile = str_contains(strtolower($userAgent), 'dart') ||
                            str_contains(strtolower($userAgent), 'flutter') ||
                            request()->hasHeader('X-Platform') ||
                            request()->is('api/*');

                $projectName = $isMobile ? 'ewwoncoco-apps' : 'ewwoncoco-website';

                $sentryUrl = rtrim(env('EWWONCOCO_SENTRY_URL', 'http://127.0.0.1:9000'), '/');
                Http::timeout(3)->post($sentryUrl.'/api/store-log', [
                    'project_name' => $projectName,
                    'environment' => app()->environment(),
                    'level' => 'error',
                    'message' => $e->getMessage() ?: get_class($e),
                    'stack_trace' => $e->getTraceAsString(),
                    'url' => request()->fullUrl(),
                    'user_data' => request()->user() ? request()->user()->toArray() : null,
                ]);
            } catch (Throwable $err) {
                // Ignore if logging server is down
            }
        });
    })->create();
