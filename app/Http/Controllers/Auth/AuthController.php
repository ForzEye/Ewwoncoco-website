<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Tampilkan halaman login
     */
    public function showLogin(): Response
    {
        session(['login_page_loaded_at' => microtime(true)]);

        return Inertia::render('Auth/Login');
    }

    /**
     * Tampilkan halaman register
     */
    public function showRegister(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Register customer baru
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => 'customer',
            'is_active' => true,
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('shop')->with('success', 'Selamat datang di EWWON COCO!');
    }

    /**
     * Login standar menggunakan email dan password
     */
    public function login(Request $request)
    {
        // 1. Honeypot Anti-Bot Check
        if ($request->filled('username_full')) {
            // Silently log the attempt or throw error (looks normal to confuse bot scripts)
            throw ValidationException::withMessages([
                'email' => 'Deteksi Keamanan: Akses ditolak karena terindikasi lalu lintas bot otomatis.',
            ]);
        }

        // 2. Server-Side Page Load Speed Anti-Bot Check
        $loadedAt = session('login_page_loaded_at');
        if ($loadedAt) {
            $secondsDiff = microtime(true) - $loadedAt;
            // If submitted in under 1.0 second, it is highly likely a script submission
            if ($secondsDiff < 1.0) {
                throw ValidationException::withMessages([
                    'email' => 'Deteksi Keamanan: Pengisian formulir terdeteksi terlalu cepat. Silakan mencoba kembali.',
                ]);
            }
        }

        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $user = Auth::user();

            if (! $user->is_active) {
                Auth::logout();
                throw ValidationException::withMessages([
                    'email' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.',
                ]);
            }

            // Redirect berdasarkan role
            return match ($user->role) {
                'super_admin' => redirect()->route('superadmin.dashboard'),
                'admin' => redirect()->route('admin.dashboard'),
                'kasir' => redirect()->route('pos.dashboard'),
                default => redirect()->route('shop'),
            };
        }

        throw ValidationException::withMessages([
            'email' => 'Email atau kata sandi yang Anda masukkan salah.',
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
