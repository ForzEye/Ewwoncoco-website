<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\DeliveryRequest;
use App\Events\DriverLocationUpdated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SimulateThirdPartyDelivery implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $orderId;

    /**
     * Create a new job instance.
     */
    public function __construct($orderId)
    {
        $this->orderId = $orderId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $order = Order::with(['branch', 'delivery_request'])->find($this->orderId);
        if (!$order || !$order->delivery_request) return;

        $startLat = (float) $order->branch->lat;
        $startLng = (float) $order->branch->lng;
        $endLat = (float) $order->delivery_lat;
        $endLng = (float) $order->delivery_lng;

        $steps = 10; // Number of location updates
        $delay = 5;  // Seconds between updates

        for ($i = 1; $i <= $steps; $i++) {
            // Interpolate coordinates
            $currentLat = $startLat + ($endLat - $startLat) * ($i / $steps);
            $currentLng = $startLng + ($endLng - $startLng) * ($i / $steps);

            // Update DB
            $order->delivery_request->update([
                'driver_lat' => $currentLat,
                'driver_lng' => $currentLng,
                'status' => ($i === $steps) ? 'delivered' : 'on_delivery'
            ]);

            // Broadcast
            broadcast(new DriverLocationUpdated($order->id, $currentLat, $currentLng));

            // Sleep (using sleep in a queue job is okay for simulation, but in real app we'd use delayed jobs)
            if ($i < $steps) sleep($delay);
        }

        // Finalize order
        $order->update(['status' => 'delivered']);
        
        // Trigger rewards logic (already in controller, but here we update status directly)
        // Ideally we should call a service that handles this
    }
}
