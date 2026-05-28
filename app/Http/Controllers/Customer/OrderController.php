<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\Branch;
use App\Services\Delivery\DeliveryServiceInterface;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    protected $deliveryService;

    public function __construct(DeliveryServiceInterface $deliveryService)
    {
        $this->deliveryService = $deliveryService;
    }
    public function index(Request $request)
    {
        $orders = Order::where('customer_id', $request->user()->id)
            ->with(['items.product', 'branch', 'merchant'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Customer/Orders', [
            'orders' => $orders
        ]);
    }

    public function show(Request $request, $id)
    {
        $order = Order::with(['items.product', 'merchant', 'branch'])
            ->where('customer_id', $request->user()->id)
            ->findOrFail($id);

        return Inertia::render('Customer/OrderDetail', [
            'order' => $order
        ]);
    }

    public function checkout(Request $request)
    {
        return Inertia::render('Customer/Checkout');
    }

    public function getDeliveryQuote(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'destination_lat' => 'required|numeric',
            'destination_lng' => 'required|numeric',
            'provider' => 'required|in:gosend,grabexpress',
        ]);

        $branch = Branch::findOrFail($request->branch_id);
        
        $origin = ['lat' => $branch->lat ?? -6.2, 'lng' => $branch->lng ?? 106.8]; // Fallback if lat/lng not set
        $destination = ['lat' => $request->destination_lat, 'lng' => $request->destination_lng];

        $quote = $this->deliveryService->getQuote($origin, $destination, $request->provider);

        return response()->json($quote);
    }

    public function store(Request $request)
    {
        $request->validate([
            'delivery_type' => 'required|in:delivery,pickup',
            'address' => 'required_if:delivery_type,delivery|string|nullable',
            'delivery_provider' => 'required_if:delivery_type,delivery|in:gosend,grabexpress|nullable',
            'payment_method' => 'required|in:qris,manual_transfer',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $subtotal = 0;
        $orderItemsData = [];
        
        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $itemSubtotal = $product->price * $item['quantity'];
            $subtotal += $itemSubtotal;
            
            $orderItemsData[] = [
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'unit_price' => $product->price,
                'subtotal' => $itemSubtotal,
                'notes' => $item['notes'] ?? null,
            ];
        }

        // Ambil merchant/branch dari produk pertama untuk simplifikasi
        $firstProduct = Product::findOrFail($request->items[0]['product_id']);
        $branchId = $firstProduct->branch_id ?? Branch::where('merchant_id', $firstProduct->merchant_id)->first()->id;

        $deliveryFee = 0;
        if ($request->delivery_type === 'delivery') {
            $deliveryQuote = $this->getDeliveryQuoteData($branchId, $request->lat, $request->lng, $request->delivery_provider);
            $deliveryFee = $deliveryQuote['fee'];
        }
        
        $total = $subtotal + $deliveryFee;

        $order = Order::create([
            'customer_id' => $request->user()->id,
            'merchant_id' => $firstProduct->merchant_id,
            'branch_id' => $branchId,
            'order_number' => 'EC-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3))),
            'delivery_type' => $request->delivery_type,
            'status' => 'pending',
            'payment_method' => $request->payment_method,
            'payment_status' => 'pending',
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'discount' => 0,
            'total' => $total,
            'delivery_address' => $request->delivery_type === 'delivery' ? $request->address : 'Pick-up at Store',
            'delivery_lat' => $request->lat,
            'delivery_lng' => $request->lng,
        ]);

        foreach ($orderItemsData as $itemData) {
            $order->items()->create($itemData);
        }

        // Dispatch Event for Real-time POS notification
        event(new \App\Events\OrderPlaced($order));
        
        return redirect()->route('orders.detail', $order->id);
    }

    /**
     * Internal helper to get quote data
     */
    private function getDeliveryQuoteData($branchId, $lat, $lng, $provider)
    {
        $branch = Branch::findOrFail($branchId);
        $origin = ['lat' => $branch->lat ?? -6.2, 'lng' => $branch->lng ?? 106.8];
        $destination = ['lat' => $lat, 'lng' => $lng];

        return $this->deliveryService->getQuote($origin, $destination, $provider);
    }

    public function uploadPaymentProof(Request $request, $id)
    {
        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $order = Order::where('customer_id', $request->user()->id)->findOrFail($id);
        
        if ($request->hasFile('payment_proof')) {
            $file = $request->file('payment_proof');

            // 1. Magic byte check (SEC-003)
            $filePath = $file->getRealPath();
            $contents = file_get_contents($filePath);
            $hex = bin2hex(substr($contents, 0, 3));

            $validSignatures = [
                'ffd8ff', // JPEG/JPG
                '89504e', // PNG
            ];

            if (!in_array($hex, $validSignatures)) {
                return back()->with('error', 'Format file tidak valid atau berbahaya.');
            }

            // 2. Upload file securely as private to S3 (SEC-002)
            $filename = 'proof_' . $order->order_number . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = Storage::disk('s3')->putFileAs('payment_proofs', $file, $filename, 'private');
            
            $order->update([
                'payment_proof_url' => $path
            ]);
        }

        return back()->with('success', 'Bukti pembayaran berhasil diunggah.');
    }
}
