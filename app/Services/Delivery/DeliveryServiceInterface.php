<?php

namespace App\Services\Delivery;

interface DeliveryServiceInterface
{
    /**
     * Get delivery fee estimate
     */
    public function getQuote(array $origin, array $destination, string $provider): array;

    /**
     * Book a courier
     */
    public function bookCourier(int $orderId, array $origin, array $destination, string $provider): array;

    /**
     * Cancel delivery
     */
    public function cancelDelivery(string $trackingId): bool;
}
