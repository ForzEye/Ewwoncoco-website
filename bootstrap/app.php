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
        ]);

        // Force HTTPS & Security headers & CORS for API routes
        $middleware->api(append: [
            \App\Http\Middleware\ForceHttps::class,
            SecurityHeaders::class,
            HandleCors::class,
        ]);

        // Role-based access middleware alias
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'verify.webhook' => \App\Http\Middleware\VerifyWebhookSignature::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        \Sentry\Laravel\Integration::handles($exceptions);
    })->create();
