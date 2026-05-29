<?php

namespace App\Jobs;

use App\Events\DriverLocationUpdated;
use App\Events\OrderStatusUpdated;
use App\Models\DeliveryRequest;
use App\Models\Order;
use App\Services\Delivery\DeliveryServiceInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SimulateDeliveryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $orderId;

    public function __construct(int $orderId)
    {
        $this->orderId = $orderId;
    }

    public function handle(DeliveryServiceInterface $deliveryService): void
    {
        $order = Order::with(['branch', 'delivery_request'])->findOrFail($this->orderId);

        // 1. Book Courier (Mock)
        $origin = ['lat' => $order->branch->lat ?? -6.2, 'lng' => $order->branch->lng ?? 106.8];
        $destination = ['lat' => $order->delivery_lat, 'lng' => $order->delivery_lng];

        $booking = $deliveryService->bookCourier($order->id, $origin, $destination, $order->payment_method); // payment_method used as provider here for simplicity in mock

        $deliveryRequest = DeliveryRequest::create([
            'order_id' => $order->id,
            'provider' => $order->payment_method === 'gosend' ? 'gosend' : 'grabexpress',
            'provider_order_id' => $booking['tracking_id'],
            'status' => 'finding_driver',
            'delivery_fee' => $order->delivery_fee,
            'driver_name' => $booking['driver_name'],
            'driver_phone' => $booking['driver_phone'],
            'driver_photo' => $booking['driver_photo'],
            'requested_at' => now(),
        ]);

        // 2. Simulate Timeline

        // Finding -> Pickup (5s)
        sleep(5);
        $deliveryRequest->update(['status' => 'on_pickup']);
        broadcast(new OrderStatusUpdated($order->refresh()));

        // Pickup -> Delivery (5s)
        sleep(5);
        $deliveryRequest->update(['status' => 'on_delivery']);
        $order->update(['status' => 'on_delivery']);
        broadcast(new OrderStatusUpdated($order->refresh()));

        // Simulate Movement (3 steps)
        for ($i = 1; $i <= 3; $i++) {
            sleep(3);
            $lat = $origin['lat'] + ($destination['lat'] - $origin['lat']) * ($i / 3);
            $lng = $origin['lng'] + ($destination['lng'] - $origin['lng']) * ($i / 3);
            broadcast(new DriverLocationUpdated($order->id, $lat, $lng));
        }

        // Delivered (3s)
        sleep(3);
        $deliveryRequest->update(['status' => 'delivered', 'delivered_at' => now()]);
        $order->update(['status' => 'delivered']);
        broadcast(new OrderStatusUpdated($order->refresh()));
    }
}
