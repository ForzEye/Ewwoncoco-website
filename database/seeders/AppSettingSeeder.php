<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'app_landing_hero_image',
                'value' => 'app/hero.png',
                'type' => 'image',
                'group' => 'landing',
            ],
            [
                'key' => 'app_landing_promo_text',
                'value' => 'Dapatkan diskon spesial untuk pesanan pertama Anda melalui aplikasi!',
                'type' => 'text',
                'group' => 'landing',
            ],
            [
                'key' => 'app_last_connected_at',
                'value' => now()->toDateTimeString(),
                'type' => 'text',
                'group' => 'system',
            ],
        ];

        foreach ($settings as $s) {
            AppSetting::updateOrCreate(['key' => $s['key']], $s);
        }
    }
}
