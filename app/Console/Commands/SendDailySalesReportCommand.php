<?php

namespace App\Console\Commands;

use App\Mail\DailySalesReportMail;
use App\Models\SystemSetting;
use App\Services\DailySalesReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendDailySalesReportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'report:daily-sales {--date= : Target date in YYYY-MM-DD format (defaults to yesterday)} {--email= : Override recipient email address}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate daily sales PDF report and send to management email';

    /**
     * Execute the console command.
     */
    public function handle(DailySalesReportService $service)
    {
        $enabled = SystemSetting::getVal('daily_report_enabled', '1');
        
        // If feature is disabled and no manual date/email specified, skip
        if ($enabled !== '1' && !$this->option('date') && !$this->option('email')) {
            $this->info('Daily sales report is disabled in System Settings.');
            return 0;
        }

        $reportTime = SystemSetting::getVal('daily_report_time', '07:00');
        $isNightSchedule = in_array($reportTime, ['20:00', '21:00', '22:00', '23:00', '23:59']) || now()->hour >= 20;

        $targetDate = $this->option('date') ?: ($isNightSchedule ? Carbon::today()->toDateString() : Carbon::yesterday()->toDateString());

        
        $recipientsStr = $this->option('email') ?: SystemSetting::getVal('daily_report_recipients');
        if (empty($recipientsStr)) {
            $recipientsStr = SystemSetting::getVal('contact_email') ?: config('mail.from.address');
        }

        if (empty($recipientsStr)) {
            $this->error('No recipient email address configured for daily report.');
            return 1;
        }

        // Parse multiple comma-separated emails
        $recipients = array_filter(array_map('trim', explode(',', $recipientsStr)));

        $this->info("Generating daily sales report for {$targetDate}...");

        try {
            $data = $service->getDailyReportData($targetDate);

            // Generate PDF using native Dompdf
            $html = view('pdf.daily_sales_report', ['data' => $data])->render();
            $dompdf = new \Dompdf\Dompdf(['isRemoteEnabled' => true]);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('a4', 'portrait');
            $dompdf->render();
            $pdfContent = $dompdf->output();



            $this->info("Sending report PDF to: " . implode(', ', $recipients));

            Mail::to($recipients)->send(new DailySalesReportMail($data, $pdfContent));

            $this->info('Daily sales report sent successfully!');
            Log::info('Daily sales report email sent to ' . implode(', ', $recipients) . " for date {$targetDate}");

            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to generate or send daily report: " . $e->getMessage());
            Log::error("Daily Sales Report Error: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return 1;
        }
    }
}
