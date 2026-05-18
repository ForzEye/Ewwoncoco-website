<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OtpCode;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;

class MonitoringController extends Controller
{
    /**
     * Display the monitoring dashboard.
     */
    public function index()
    {
        return Inertia::render('SuperAdmin/Monitoring/Index');
    }

    /**
     * API for real-time OTP logs.
     */
    public function getOtpLogs()
    {
        $logs = OtpCode::latest()
            ->limit(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'identifier' => $log->identifier,
                    'type' => $log->type,
                    'channel' => $log->channel,
                    'status' => $log->status,
                    'error_message' => $log->error_message,
                    'is_used' => $log->is_used,
                    'created_at' => $log->created_at->diffForHumans(),
                ];
            });

        return response()->json($logs);
    }

    /**
     * Fetch parsed error logs from storage/logs/laravel.log.
     */
    public function getErrorLogs()
    {
        $logPath = storage_path('logs/laravel.log');
        if (!File::exists($logPath)) {
            return response()->json([]);
        }

        $fileContent = File::get($logPath);
        
        // Regex matching standard Laravel log lines e.g.: [2026-05-18 12:00:00] production.ERROR: ...
        $pattern = '/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s+([a-zA-Z0-9_-]+)\.([A-Z]+):\s+(.*?)(?=\n\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]|\z)/s';
        
        preg_match_all($pattern, $fileContent, $matches, PREG_SET_ORDER);
        
        $errors = [];
        $idIndex = 1;

        foreach (array_reverse($matches) as $match) {
            $errors[] = [
                'id' => $idIndex++,
                'timestamp' => $match[1],
                'env' => $match[2],
                'level' => $match[3],
                'message' => trim($match[4]),
            ];
            
            // Limit response size to prevent UI lag (latest 100 errors)
            if ($idIndex > 100) {
                break;
            }
        }

        return response()->json($errors);
    }

    /**
     * Clear the laravel.log file database.
     */
    public function clearErrorLogs()
    {
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            File::put($logPath, '');
            return response()->json(['success' => true, 'message' => 'Logs cleared successfully']);
        }
        
        return response()->json(['success' => false, 'message' => 'Log file does not exist'], 404);
    }
}
