<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Sentry\Laravel\Integration;

class SentryIntegrationTest extends TestCase
{
    /** @test */
    public function it_checks_sentry_handler_is_registered_in_the_app()
    {
        $dsn = config('sentry.dsn');
        $this->assertEquals('https://public@sentry.ewwoncoco.id/1', $dsn);

        // Check if Sentry is bound in the IoC Container / ready to report
        $this->assertTrue(app()->bound('sentry'));
    }
}
