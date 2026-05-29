<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AntiBotTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_sets_login_page_loaded_at_in_session_on_view_login()
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $this->assertTrue(session()->has('login_page_loaded_at'));
    }

    /** @test */
    public function it_blocks_login_attempts_when_honeypot_field_is_filled()
    {
        $user = User::create([
            'name' => 'John Human',
            'email' => 'john@human.com',
            'password' => Hash::make('secret123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        // Submit form with honeypot filled
        $response = $this->withSession(['login_page_loaded_at' => microtime(true) - 5])
            ->post('/login', [
                'email' => 'john@human.com',
                'password' => 'secret123',
                'username_full' => 'I am a bot autofiller', // Honeypot filled!
            ]);

        $response->assertSessionHasErrors('email');
        $this->assertStringContainsString('lalu lintas bot otomatis', session('errors')->first('email'));
        $this->assertFalse(auth()->check());
    }

    /** @test */
    public function it_blocks_login_attempts_when_submitted_too_fast()
    {
        $user = User::create([
            'name' => 'John Human',
            'email' => 'john@human.com',
            'password' => Hash::make('secret123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        // Submit form instantly (loaded_at is current microtime)
        $response = $this->withSession(['login_page_loaded_at' => microtime(true)])
            ->post('/login', [
                'email' => 'john@human.com',
                'password' => 'secret123',
                'username_full' => '', // Honeypot blank
            ]);

        $response->assertSessionHasErrors('email');
        $this->assertStringContainsString('terlalu cepat', session('errors')->first('email'));
        $this->assertFalse(auth()->check());
    }

    /** @test */
    public function it_allows_standard_human_login_when_rules_are_satisfied()
    {
        $user = User::create([
            'name' => 'John Human',
            'email' => 'john@human.com',
            'password' => Hash::make('secret123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        // Submit form after 2 seconds (loaded_at is 2 seconds in the past)
        $response = $this->withSession(['login_page_loaded_at' => microtime(true) - 2.0])
            ->post('/login', [
                'email' => 'john@human.com',
                'password' => 'secret123',
                'username_full' => '', // Honeypot blank
            ]);

        $response->assertRedirect('/shop');
        $this->assertTrue(auth()->check());
        $this->assertEquals($user->id, auth()->id());
    }
}
