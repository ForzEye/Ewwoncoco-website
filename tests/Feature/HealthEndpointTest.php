<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_checks_db_connection_in_health_endpoint_and_updates_connection_timestamp()
    {
        // First, check that app_last_connected_at does not exist
        $this->assertDatabaseMissing('app_settings', [
            'key' => 'app_last_connected_at'
        ]);

        $response = $this->getJson('/api/v1/health');
        
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'status' => 'healthy'
        ]);
        $response->assertJsonStructure(['success', 'status', 'timestamp']);

        // Assert that app_last_connected_at is updated/created in the database
        $this->assertDatabaseHas('app_settings', [
            'key' => 'app_last_connected_at'
        ]);

        $value = AppSetting::getVal('app_last_connected_at');
        $this->assertNotNull($value);
        
        // Assert that the timestamp is a valid ISO 8601 string (starts with YYYY-MM-DDThh:mm:ss)
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', $value);
    }
}
