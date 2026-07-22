<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use App\Models\SystemSetting;

$deliveryTime = SystemSetting::getVal('daily_report_time', '07:00');
Schedule::command('report:daily-sales')->dailyAt($deliveryTime);

