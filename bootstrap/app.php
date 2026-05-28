<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Http\Middleware\HandleCors;

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
            \App\Http\Middleware\ForceHttps::class,
            SecurityHeaders::class,
            HandleInertiaRequests::class,
            \App\Http\Middleware\ApiMonitoringMiddleware::class,
        ]);

        // Force HTTPS & Security headers & CORS for API routes
        $middleware->api(append: [
            \App\Http\Middleware\ForceHttps::class,
            SecurityHeaders::class,
            HandleCors::class,
            \App\Http\Middleware\ApiMonitoringMiddleware::class,
        ]);

        // Role-based access middleware alias
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'verify.webhook' => \App\Http\Middleware\VerifyWebhookSignature::class,
        ]);
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
                \Illuminate\Support\Facades\Http::timeout(3)->post($sentryUrl . '/api/store-log', [
                    'project_name' => $projectName,
                    'environment' => app()->environment(),
                    'level' => 'error',
                    'message' => $e->getMessage() ?: get_class($e),
                    'stack_trace' => $e->getTraceAsString(),
                    'url' => request()->fullUrl(),
                    'user_data' => request()->user() ? request()->user()->toArray() : null,
                ]);
            } catch (\Throwable $err) {
                // Ignore if logging server is down
            }
        });
    })->create();
