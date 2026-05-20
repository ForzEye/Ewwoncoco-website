<?php

namespace App\Services\Notification;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class FCMService
{
    protected $endpoint = 'https://fcm.googleapis.com/v1/projects/%s/messages:send';
    protected $projectId;
    protected $accessToken;

    public function __construct()
    {
        $this->projectId = config('services.firebase.project_id');
        $this->accessToken = $this->getAccessToken();
    }

    /**
     * Send notification to a specific device token
     */
    public function sendToToken(string $token, string $title, string $body, array $data = [])
    {
        if (!$this->projectId || !$token || !$this->accessToken) {
            Log::warning('FCM Send skipped: missing projectId, token, or accessToken');
            return false;
        }

        $url = sprintf($this->endpoint, $this->projectId);

        try {
            $response = Http::withToken($this->accessToken)
                ->post($url, [
                    'message' => [
                        'token' => $token,
                        'notification' => [
                            'title' => $title,
                            'body' => $body,
                        ],
                        'data' => $data,
                        'webpush' => [
                            'fcm_options' => [
                                'link' => $data['link'] ?? '/',
                            ],
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::error('FCM Send Failed: ' . $response->body());
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('FCM Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Base64url helper
     */
    private function base64UrlEncode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    /**
     * Generate OAuth2 access token from Service Account JSON using JWT signing
     */
    protected function getAccessToken()
    {
        $cacheKey = 'fcm_access_token';
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $credentialsPath = base_path('app/firebase/service-account.json');

        if (!file_exists($credentialsPath)) {
            Log::error('FCM Service Account file not found at: ' . $credentialsPath);
            return null;
        }

        $credentials = json_decode(file_get_contents($credentialsPath), true);
        if (!$credentials) {
            Log::error('FCM Service Account JSON invalid');
            return null;
        }

        $privateKey = $credentials['private_key'];
        $clientEmail = $credentials['client_email'];

        $header = $this->base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        
        $now = time();
        $payload = $this->base64UrlEncode(json_encode([
            'iss' => $clientEmail,
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $now + 3600,
            'iat' => $now
        ]));

        $signatureInput = "$header.$payload";
        $signature = '';
        
        if (!openssl_sign($signatureInput, $signature, $privateKey, 'SHA256')) {
            Log::error('FCM Failed to sign JWT via OpenSSL');
            return null;
        }

        $signedSignature = $this->base64UrlEncode($signature);
        $jwt = "$signatureInput.$signedSignature";

        try {
            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt
            ]);

            if ($response->failed()) {
                Log::error('FCM Token Generation Failed: ' . $response->body());
                return null;
            }

            $tokenData = $response->json();
            $accessToken = $tokenData['access_token'];
            $expiresIn = $tokenData['expires_in'] ?? 3600;

            // Cache token slightly less than expiry (e.g. 50 minutes)
            Cache::put($cacheKey, $accessToken, $expiresIn - 300);

            return $accessToken;
        } catch (\Exception $e) {
            Log::error('FCM Token Exchange Exception: ' . $e->getMessage());
            return null;
        }
    }
}

