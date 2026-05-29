<?php

namespace Tests\Feature;

use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    /** @test */
    public function it_asserts_proper_security_headers_including_strict_csp()
    {
        $response = $this->get('/');

        $response->assertHeader('Content-Security-Policy');
        $this->assertStringNotContainsString('default-src *', $response->headers->get('Content-Security-Policy'));
        $this->assertStringContainsString("frame-ancestors 'self'", $response->headers->get('Content-Security-Policy'));
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }
}
