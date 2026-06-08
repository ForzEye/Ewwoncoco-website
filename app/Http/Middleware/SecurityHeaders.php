<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Strict Content Security Policy (Remove wildcards, specify trusted sources)
        $csp = "default-src 'self'; ".
               "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://app.sandbox.midtrans.com https://app.midtrans.com https://www.gstatic.com; ".
               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ".
               "img-src 'self' data: blob: https:; ".
               "connect-src 'self' wss: ws: https://*.pusher.com wss://*.pusher.com https://nominatim.openstreetmap.org https://api.gojek.com https://partner-api.grab.com https://*.googleapis.com; ".
               "font-src 'self' https://fonts.gstatic.com data:; ".
               "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://www.openstreetmap.org https://*.openstreetmap.org; ".
               "frame-ancestors 'self'; ".
               "object-src 'none';";

        $response->headers->set('Content-Security-Policy', $csp);
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

        return $response;
    }
}
