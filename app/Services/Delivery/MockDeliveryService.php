<?php

namespace App\Services\Delivery;

use App\Helpers\DistanceHelper;

class MockDeliveryService implements DeliveryServiceInterface
{
    protected $pricePerKm = 3000;
    protected $minFee = 10000;

    public function getQuote(array $origin, array $destination, string $provider): array
    {
        $distance = DistanceHelper::calculate(
            $origin['lat'], $origin['lng'],
            $destination['lat'], $destination['lng']
        );

        // Ongkir dinamis: jarak * harga/km, minimal 10rb
        $fee = max($this->minFee, round($distance * $this->pricePerKm));

        return [
            'provider' => $provider,
            'fee' => $fee,
            'distance' => $distance,
            'estimated_minutes' => ceil($distance * 3) + 10, // Estimasi 3 menit per km + 10 menit pickup
        ];
    }

    public function bookCourier(int $orderId, array $origin, array $destination, string $provider): array
    {
        // Simulasi booking berhasil
        return [
            'success' => true,
            'tracking_id' => 'MOCK-' . strtoupper(bin2hex(random_bytes(4))),
            'driver_name' => 'Budi ' . ($provider === 'gosend' ? 'GoSend' : 'Grab'),
            'driver_phone' => '081234567' . rand(100, 999),
            'driver_photo' => 'https://ui-avatars.com/api/?name=Budi&background=00C48C&color=fff',
            'estimated_arrival' => now()->addMinutes(15)->toDateTimeString(),
        ];
    }

    public function cancelDelivery(string $trackingId): bool
    {
        return true;
    }
}
