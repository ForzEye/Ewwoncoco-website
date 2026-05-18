<?php

namespace App\Services\Notification;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FCMService
{
    protected $endpoint = 'https://fcm.googleapis.com/v1/projects/%s/messages:send';
    protected $projectId;
    protected $accessToken;

    public function __construct()
    {
        $this->projectId = config('services.firebase.project_id');
        // Token ini harus didapatkan dari Service Account JSON
        // Untuk mock, kita asumsikan sudah ada cara mendapatkan access token
        $this->accessToken = $this->getAccessToken();
    }

    /**
     * Send notification to a specific device token
     */
    public function sendToToken(string $token, string $title, string $body, array $data = [])
    {
        if (!$this->projectId || !$token) return false;

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
     * Mock getting access token (in real world use Google Client Library)
     */
    protected function getAccessToken()
    {
        return config('services.firebase.server_key'); // Temporary using legacy key for simulation
    }
}
