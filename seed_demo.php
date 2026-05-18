<?php

use App\Models\Order;
use App\Models\PosTransaction;
use App\Models\Merchant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$merchant = Merchant::first();
if (!$merchant) {
    echo "Merchant not found\n";
    exit;
}

$user = User::where('role', 'customer')->first();
if (!$user) {
    echo "Customer user not found\n";
    exit;
}

$branch = \App\Models\Branch::where('merchant_id', $merchant->id)->first();
if (!$branch) {
    echo "Branch not found\n";
    exit;
}

for ($i = 0; $i < 10; $i++) {
    // Create Online Orders
    Order::create([
        'merchant_id' => $merchant->id,
        'customer_id' => $user->id,
        'branch_id' => $branch->id,
        'order_number' => 'ORD-' . strtoupper(bin2hex(random_bytes(3))),
        'subtotal' => rand(20000, 80000),
        'delivery_fee' => 0,
        'total' => rand(20000, 80000),
        'status' => 'delivered',
        'payment_status' => 'confirmed',
        'payment_method' => 'qris',
        'created_at' => now()->subDays(rand(0, 7))
    ]);

    // Create POS Transactions
    PosTransaction::create([
        'merchant_id' => $merchant->id,
        'branch_id' => $branch->id,
        'cashier_id' => 1,
        'transaction_number' => 'POS-' . strtoupper(bin2hex(random_bytes(3))),
        'total' => rand(15000, 45000),
        'payment_method' => 'cash',
        'transaction_at' => now()->subDays(rand(0, 7))
    ]);
}

echo "Successfully generated sample data.\n";
