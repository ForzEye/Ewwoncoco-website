<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PosShift;
use App\Models\PosTransaction;
use App\Models\PosTransactionItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SalesDataSeeder extends Seeder
{
    public function run(): void
    {
        // Find merchant and branches
        $admin = User::where('role', 'admin')->first();
        if (! $admin) {
            echo "Admin user not found. Please run db:seed first.\n";

            return;
        }

        $merchant = $admin->merchant ?? $admin->ownedMerchant;
        if (! $merchant) {
            echo "Merchant not found. Please run db:seed first.\n";

            return;
        }

        $merchantId = $merchant->id;
        $branch = Branch::where('merchant_id', $merchantId)->first();
        if (! $branch) {
            echo "Branch not found.\n";

            return;
        }

        $products = Product::where('merchant_id', $merchantId)->get();
        if ($products->isEmpty()) {
            echo "No products found.\n";

            return;
        }

        $customer = User::where('role', 'customer')->first() ?? $admin;
        $cashier = User::where('role', 'kasir')->first() ?? $admin;

        // Create a mock shift
        $shift = PosShift::create([
            'branch_id' => $branch->id,
            'cashier_id' => $cashier->id,
            'opened_at' => now()->subDays(7),
            'opening_cash' => 500000,
            'notes' => 'Mock shift for demo sales data',
        ]);

        echo "Seeding orders and POS transactions for the last 7 days...\n";

        // Generate sales over the last 7 days
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);

            // 1. Generate Online Orders (1-3 orders per day)
            $numOrders = rand(1, 3);
            for ($o = 0; $o < $numOrders; $o++) {
                $orderProducts = $products->random(rand(1, min(3, $products->count())));
                $subtotal = 0;

                $order = Order::create([
                    'customer_id' => $customer->id,
                    'merchant_id' => $merchantId,
                    'branch_id' => $branch->id,
                    'order_number' => 'ORD-'.strtoupper(Str::random(8)),
                    'delivery_type' => rand(0, 1) ? 'pickup' : 'delivery',
                    'status' => 'delivered',
                    'payment_method' => rand(0, 1) ? 'qris' : 'manual_transfer',
                    'payment_status' => 'confirmed',
                    'subtotal' => 0,
                    'delivery_fee' => 0,
                    'discount' => 0,
                    'total' => 0,
                    'created_at' => $date->copy()->addHours(rand(8, 20)),
                    'updated_at' => $date,
                ]);

                foreach ($orderProducts as $product) {
                    $qty = rand(1, 3);
                    $sub = $product->price * $qty;
                    $subtotal += $sub;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'unit_price' => $product->price,
                        'subtotal' => $sub,
                    ]);
                }

                $order->update([
                    'subtotal' => $subtotal,
                    'total' => $subtotal,
                ]);
            }

            // 2. Generate POS Transactions (2-5 per day)
            $numPos = rand(2, 5);
            for ($p = 0; $p < $numPos; $p++) {
                $posProducts = $products->random(rand(1, min(3, $products->count())));
                $total = 0;

                $transaction = PosTransaction::create([
                    'merchant_id' => $merchantId,
                    'branch_id' => $branch->id,
                    'cashier_id' => $cashier->id,
                    'customer_id' => null,
                    'shift_id' => $shift->id,
                    'transaction_number' => 'TX-'.strtoupper(Str::random(8)),
                    'payment_method' => rand(0, 1) ? 'cash' : 'qris',
                    'total' => 0,
                    'discount' => 0,
                    'cash_received' => 100000,
                    'change_amount' => 0,
                    'transaction_at' => $date->copy()->addHours(rand(8, 21)),
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);

                foreach ($posProducts as $product) {
                    $qty = rand(1, 3);
                    $sub = $product->price * $qty;
                    $total += $sub;

                    PosTransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'unit_price' => $product->price,
                        'subtotal' => $sub,
                    ]);
                }

                $transaction->update([
                    'total' => $total,
                    'change_amount' => max(0, 100000 - $total),
                ]);
            }
        }

        echo "Successfully seeded mock sales data!\n";
    }
}
