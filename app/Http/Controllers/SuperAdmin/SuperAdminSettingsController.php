<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Services\DailySalesReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class SuperAdminSettingsController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::all()->pluck('value', 'key');

        return Inertia::render('SuperAdmin/Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $settings = $request->all();

        foreach ($settings as $key => $value) {
            SystemSetting::setVal($key, $value);
        }

        return redirect()->back()->with('success', 'Pengaturan sistem berhasil diperbarui.');
    }

    /**
     * Preview generated Daily Sales Report PDF directly in browser
     */
    public function previewDailyReport(Request $request, DailySalesReportService $service)
    {
        $date = $request->query('date', now()->subDay()->toDateString());
        $data = $service->getDailyReportData($date);

        $pdf = Pdf::loadView('pdf.daily_sales_report', ['data' => $data]);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('Preview_Laporan_Penjualan_Harian_' . $date . '.pdf');
    }

    /**
     * Trigger manual test email sending for Daily Sales Report
     */
    public function sendTestDailyReport(Request $request)
    {
        $email = $request->input('test_email');
        
        $params = ['--date' => now()->subDay()->toDateString()];
        if ($email) {
            $params['--email'] = $email;
        }

        $exitCode = Artisan::call('report:daily-sales', $params);

        if ($exitCode === 0) {
            return redirect()->back()->with('success', 'Test laporan harian berhasil dikirim ke email!');
        }

        return redirect()->back()->with('error', 'Gagal mengirim test laporan. Periksa log email Anda.');
    }
}

