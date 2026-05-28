<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiMonitoringMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response)
    {
        // Only log API routes to save space
        if (!$request->is('api/*')) {
            return;
        }

        $durationMs = defined('LARAVEL_START') ? (int) ((microtime(true) - LARAVEL_START) * 1000) : 0;

        try {
            $userAgent = $request->header('User-Agent', '');
            $isMobile = str_contains(strtolower($userAgent), 'dart') || 
                        str_contains(strtolower($userAgent), 'flutter') || 
                        $request->hasHeader('X-Platform') ||
                        $request->is('api/*');
            
            $projectName = $isMobile ? 'ewwoncoco-apps' : 'ewwoncoco-website';

            $sentryUrl = env('EWWONCOCO_SENTRY_URL');
            if (empty($sentryUrl) || $sentryUrl === 'null') {
                return;
            }
            $sentryUrl = rtrim($sentryUrl, '/');
            \Illuminate\Support\Facades\Http::timeout(2)->post($sentryUrl . '/api/store-api-log', [
                'project_name'     => $projectName,
                'environment'      => app()->environment(),
                'method'           => $request->method(),
                'url'              => $request->fullUrl(),
                'status_code'      => $response->getStatusCode(),
                'duration_ms'      => $durationMs,
                'ip_address'       => $request->ip(),
                // 'request_payload'  => $request->except(['password', 'password_confirmation']),
                // 'response_payload' => json_decode($response->getContent(), true),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('API Monitoring failed: ' . $e->getMessage());
        }
    }
}
