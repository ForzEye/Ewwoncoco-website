<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class AppSetting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'group'];

    public static function getVal($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (! $setting) {
            return $default;
        }

        if ($setting->type === 'image' && $setting->value) {
            // Check if it's a JSON array (multiple images)
            $decoded = json_decode($setting->value, true);
            if (is_array($decoded)) {
                return array_map(function ($path) {
                    return Storage::disk('s3')->url($path);
                }, $decoded);
            }

            return Storage::disk('s3')->url($setting->value);
        }

        return $setting->value;
    }
}
