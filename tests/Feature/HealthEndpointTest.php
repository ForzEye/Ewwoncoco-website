<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    /** @test */
    public function it_checks_db_connection_in_health_endpoint_read_only()
    {
        $response = $this->getJson('/api/v1/health');
        
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'status' => 'healthy'
        ]);
        $response->assertJsonStructure(['success', 'status', 'timestamp']);
    }
}
