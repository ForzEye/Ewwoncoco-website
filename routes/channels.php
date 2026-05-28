<?php

use Illuminate\Support\Facades\Broadcast;

// Channel authorization untuk order tracking
Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    // Customer dapat mendengarkan channel order miliknya sendiri
    // Admin & kasir dapat mendengarkan semua order
    if (in_array($user->role, ['admin', 'super_admin', 'kasir'])) {
        return true;
    }
    return \App\Models\Order::where('id', $orderId)
        ->where('customer_id', $user->id)
        ->exists();
});

// Channel untuk driver location update
Broadcast::channel('delivery.{deliveryId}', function ($user, $deliveryId) {
    if (in_array($user->role, ['admin', 'super_admin'])) {
        return true;
    }
    return \App\Models\DeliveryRequest::whereHas('order', function ($q) use ($user) {
        $q->where('customer_id', $user->id);
    })->where('id', $deliveryId)->exists();
});

// Channel notifikasi admin (pesanan masuk)
Broadcast::channel('merchant.{merchantId}.orders', function ($user, $merchantId) {
    // Super admin can access all
    if ($user->role === 'super_admin') {
        return true;
    }
    
    // Admin or Kasir can access their own merchant's orders
    if (in_array($user->role, ['admin', 'kasir'])) {
        return $user->merchant_id == $merchantId || \App\Models\Merchant::where('id', $merchantId)
            ->where('owner_id', $user->id)
            ->exists();
    }
    
    return false;
});

// Channel Chat
Broadcast::channel('chat.{roomId}', function ($user, $roomId) {
    $room = \App\Models\ChatRoom::find($roomId);
    if (!$room) return false;

    // Customer dapat mengakses jika ini room miliknya
    if ($user->role === 'customer') {
        return $user->id === $room->customer_id;
    }

    // Admin/Merchant dapat mengakses jika room ini milik merchant-nya
    $merchant = $user->merchant;
    return $merchant && $merchant->id === $room->merchant_id;
});
