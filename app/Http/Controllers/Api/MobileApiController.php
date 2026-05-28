<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Promotion;
use App\Models\Voucher;
use Illuminate\Http\Request;
use App\Services\OtpService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
class MobileApiController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required',
            'device_id' => 'nullable|string',
            'device_name' => 'nullable|string',
        ]);

        $user = User::where('email', $request->email)
            ->orWhere('phone', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email/No HP atau password salah.'
            ], 401);
        }

        // Adaptive Security Check
        $deviceId = $request->device_id;
        if ($deviceId) {
            $device = \App\Models\UserDevice::where('user_id', $user->id)
                ->where('device_id', $deviceId)
                ->first();

            $isNewDevice = !$device;
            $isLongInactive = $device && $device->last_login_at && $device->last_login_at->diffInDays(now()) >= 2;

            // Per-channel OTP toggles
            $waOtpEnabled    = \App\Models\SystemSetting::getVal('otp_enabled', '1') === '1';
            $emailOtpEnabled = \App\Models\SystemSetting::getVal('otp_email_enabled', '1') === '1';
            $anyOtpEnabled   = $waOtpEnabled || $emailOtpEnabled;

            if ($anyOtpEnabled && ($isNewDevice || $isLongInactive)) {
                // Auto-send OTP for security verification
                $otpService = app(OtpService::class);

                // Prefer WA channel if phone exists AND WA OTP is enabled,
                // otherwise fall back to email OTP.
                if ($user->phone && $waOtpEnabled) {
                    $identifier = $user->phone;
                    $channel    = 'whatsapp';
                } else {
                    $identifier = $user->email;
                    $channel    = 'email';
                }
                
                // Track this as a login type OTP
                $otpService->sendOtp($identifier, 'login', $channel);

                return response()->json([
                    'success' => false,
                    'otp_required' => true,
                    'message' => 'Login dari perangkat baru atau sudah lama tidak login. Verifikasi OTP diperlukan.',
                    'identifier' => $identifier,
                    'channel' => $channel
                ], 202); 
            }

            // Update device log
            if ($device) {
                $device->update(['last_login_at' => now(), 'device_name' => $request->device_name]);
            } else {
                \App\Models\UserDevice::create([
                    'user_id' => $user->id,
                    'device_id' => $deviceId,
                    'device_name' => $request->device_name,
                    'last_login_at' => now(),
                    'is_trusted' => !$anyOtpEnabled
                ]);
            }
        }

        $token = $user->createToken('mobile-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'avatar' => $user->avatar ? config('filesystems.disks.minio.url') . '/' . $user->avatar : null,
                'avatar_url' => $user->avatar_url ?? ($user->avatar ? config('filesystems.disks.minio.url') . '/' . $user->avatar : null),
            ]
        ]);
    }
    /**
     * Get authenticated user profile
     */
    public function getUserProfile(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    }

    /**
     * Get list of all available outlets/branches
     */
    public function getOutlets()
    {
        $outlets = \Illuminate\Support\Facades\Cache::remember('outlets_active', 3600, function () {
            return Branch::where('is_active', true)->get();
        });

        return response()->json([
            'success' => true,
            'data' => $outlets
        ]);
    }

    public function getCategories()
    {
        $categories = \Illuminate\Support\Facades\Cache::remember('product_categories', 3600, function () {
            return ProductCategory::all();
        });

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    public function getProducts(Request $request, $branchId)
    {
        // Ambil produk yang spesifik untuk cabang ini ATAU yang bersifat global (branch_id null)
        $products = Product::with('category')
            ->where(function($query) use ($branchId) {
                $query->where('branch_id', $branchId)
                      ->orWhereNull('branch_id');
            })
            ->where('is_available', true)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Submit a new order from mobile app
     */
    public function storeOrder(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'delivery_fee' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'required|in:manual_transfer,qris',
            'delivery_type' => 'required|in:pickup,delivery',
            'delivery_address' => 'nullable|string',
            'delivery_lat' => 'nullable|numeric',
            'delivery_lng' => 'nullable|numeric',
            'notes' => 'nullable|string|max:500',
            'voucher_code' => 'nullable|string|max:30',
        ]);

        $user = $request->user();
        $branch = Branch::find($validated['branch_id']);

        try {
            DB::beginTransaction();

            $orderNumber = 'ORD-' . now()->format('ymdHi') . '-' . strtoupper(substr(uniqid(), -4));

            $order = Order::create([
                'customer_id' => $user?->id,
                'merchant_id' => $branch->merchant_id ?? null,
                'branch_id' => $validated['branch_id'],
                'order_number' => $orderNumber,
                'delivery_type' => $validated['delivery_type'],
                'status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'pending',
                'subtotal' => $validated['subtotal'],
                'delivery_fee' => $validated['delivery_fee'] ?? 0,
                'discount' => $validated['discount'] ?? 0,
                'total' => $validated['total'],
                'delivery_address' => $validated['delivery_address'] ?? null,
                'delivery_lat' => $validated['delivery_lat'] ?? null,
                'delivery_lng' => $validated['delivery_lng'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            // 3. Handle Auto Point Redemption
            if ($request->boolean('use_points', true)) {
                \App\Services\PointsService::redeemPoints($user->id, $order->id);
                $order->refresh(); // Refresh to get updated total/discount
            }

            // 4. Handle Voucher
            if ($request->filled('voucher_code')) {
                \App\Services\VoucherService::applyToOrder($order->id, $request->voucher_code);
                $order->refresh();
            }

            // Load relations for response
            $order->load('items.product', 'branch');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat!',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            $traceId = (string) \Illuminate\Support\Str::uuid();
            \Illuminate\Support\Facades\Log::error('Order creation failed: ' . $e->getMessage(), [
                'trace_id' => $traceId,
                'exception' => $e,
                'user_id' => $request->user()?->id,
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pesanan. Silakan coba beberapa saat lagi.',
                'trace_id' => $traceId
            ], 500);
        }
    }

    /**
     * Get order history for authenticated user
     */
    public function getOrders(Request $request)
    {
        $user = $request->user();
        $orders = Order::with('items.product', 'branch')
            ->where('customer_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Get single order detail
     */
    public function getOrderDetail(Request $request, $orderId)
    {
        $user = $request->user();
        $order = Order::with('items.product', 'branch', 'deliveryRequest')
            ->where('customer_id', $user->id)
            ->findOrFail($orderId);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Register new user via mobile app
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => 'customer',
        ]);

        $token = $user->createToken('mobile-token')->plainTextToken;

        // Tambahkan fallback properties agar seragam dengan payload login
        $userData = $user->toArray();
        $userData['avatar'] = $user->avatar ?? null;
        $userData['avatar_url'] = $user->avatar_url ?? null;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $userData,
        ], 201);
    }

    /**
     * Get active promotions
     */
    public function getPromos()
    {
        $promos = \Illuminate\Support\Facades\Cache::remember('promotions_active', 300, function () {
            return Promotion::where('is_active', true)
                ->where(function($query) {
                    $query->whereNull('end_date')
                          ->orWhere('end_date', '>=', now());
                })
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $promos
        ]);
    }

    /**
     * Get mobile app dynamic settings
     */
    public function getSettings()
    {
        $heroImagesRaw = \App\Models\AppSetting::getVal('app_landing_hero_image');
        $heroImages = [];

        if ($heroImagesRaw) {
            if (is_array($heroImagesRaw)) {
                $heroImages = $heroImagesRaw;
            } else {
                $heroImages[] = $heroImagesRaw;
            }
        }

        // Get merchant payment info (first active merchant)
        $merchant = \App\Models\Merchant::where('is_active', true)->first();

        // Build QRIS image public URL
        $qrisImageUrl = null;
        if ($merchant && $merchant->qris_image_url) {
            if (str_starts_with($merchant->qris_image_url, 'http')) {
                $qrisImageUrl = $merchant->qris_image_url;
            } else {
                $qrisImageUrl = \Illuminate\Support\Facades\Storage::disk('public')->url($merchant->qris_image_url);
            }
        }

        $settings = [
            'hero_images'          => $heroImages,
            'hero_image'           => !empty($heroImages) ? $heroImages[0] : null,
            'promo_text'           => \App\Models\AppSetting::getVal('app_landing_promo_text'),
            'support_whatsapp'     => \App\Models\AppSetting::getVal('app_support_whatsapp'),
            // Payment info
            'qris_image_url'       => $qrisImageUrl,
            'bank_name'            => $merchant?->bank_name,
            'bank_account_number'  => $merchant?->bank_account_number,
            'bank_account_name'    => $merchant?->bank_account_name,
            // OTP Toggles
            'otp_enabled'       => \App\Models\SystemSetting::getVal('otp_enabled', '1') === '1',
            'otp_email_enabled' => \App\Models\SystemSetting::getVal('otp_email_enabled', '1') === '1',
        ];

        return response()->json([
            'success' => true,
            'data'    => $settings
        ]);
    }

    /**
     * Update app connectivity status
     */
    public function health()
    {
        try {
            \Illuminate\Support\Facades\DB::connection()->getPdo();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'unhealthy',
                'error' => 'Database connection failed'
            ], 500);
        }

        // Update app last connected at status
        \App\Models\AppSetting::updateOrCreate(
            ['key' => 'app_last_connected_at'],
            ['value' => now()->toIso8601String(), 'type' => 'text', 'group' => 'system']
        );

        return response()->json([
            'success' => true,
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String()
        ]);
    }

    public function uploadPaymentProof(Request $request, $orderId)
    {
        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user();
        $order = Order::where('customer_id', $user->id)->findOrFail($orderId);

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
                return response()->json([
                    'success' => false,
                    'message' => 'Format file tidak valid atau berbahaya.'
                ], 422);
            }

            // 2. Upload file securely as private to S3 (SEC-002)
            $path = Storage::disk('s3')->putFile('payment_proofs', $file, 'private');
            
            $order->update([
                'payment_proof_url' => $path,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Bukti pembayaran berhasil diunggah.',
            'order' => $order->fresh(),
        ]);
    }

    /**
     * Get user notifications
     */
    public function getNotifications(Request $request)
    {
        $notifications = \App\Models\Notification::where('user_id', $request->user()->id)
            ->latest()
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    // ─── Chat Endpoints ───

    /**
     * Get user chat rooms
     */
    public function getChatRooms(Request $request)
    {
        $rooms = \App\Models\ChatRoom::with(['merchant'])
            ->where('customer_id', $request->user()->id)
            ->orderBy('last_message_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rooms
        ]);
    }

    /**
     * Open or create chat room with merchant
     */
    public function openChatRoom(Request $request, $merchantId)
    {
        $room = \App\Models\ChatRoom::firstOrCreate([
            'customer_id' => $request->user()->id,
            'merchant_id' => $merchantId
        ]);

        return response()->json([
            'success' => true,
            'data' => $room->load('merchant')
        ]);
    }

    /**
     * Get chat messages
     */
    public function getChatMessages(Request $request, $roomId)
    {
        $room = \App\Models\ChatRoom::findOrFail($roomId);
        if ($room->customer_id !== $request->user()->id) abort(403);

        $messages = \App\Models\ChatMessage::with('sender:id,name,avatar_url')
            ->where('chat_room_id', $roomId)
            ->oldest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    /**
     * Send chat message
     */
    public function sendChatMessage(Request $request, $roomId)
    {
        $request->validate(['message' => 'required|string']);
        
        $room = \App\Models\ChatRoom::findOrFail($roomId);
        if ($room->customer_id !== $request->user()->id) abort(403);

        $message = \App\Models\ChatMessage::create([
            'chat_room_id' => $roomId,
            'sender_id' => $request->user()->id,
            'message' => $request->message
        ]);

        $room->update(['last_message_at' => now()]);

        // Broadcast to Pusher
        broadcast(new \App\Events\MessageSent($message))->toOthers();

        return response()->json([
            'success' => true,
            'data' => $message->load('sender:id,name,avatar_url')
        ]);
    }

    /**
     * Validate voucher code
     */
    public function validateVoucher(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric'
        ]);

        $result = \App\Services\VoucherService::validate(
            $request->code, 
            $request->user()->id, 
            $request->subtotal, 
            true // Is Online
        );

        return response()->json($result);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20|unique:users,phone,' . $user->id,
            'gender' => 'nullable|in:male,female,other',
            'birth_date' => 'nullable|date',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        $file = $request->file('avatar');
        
        // Basic Magic Byte Validation for security (SEC-005)
        $allowedMagicBytes = [
            'ffd8ff' => 'image/jpeg',
            '89504e' => 'image/png',
        ];
        
        $fileContent = file_get_contents($file->getRealPath());
        $magicBytes = bin2hex(substr($fileContent, 0, 3));
        
        if (!isset($allowedMagicBytes[$magicBytes])) {
            return response()->json([
                'success' => false,
                'message' => 'Format file tidak valid atau berbahaya.'
            ], 422);
        }

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $path = $file->store('avatars');
            $user->update(['avatar_url' => \Illuminate\Support\Facades\Storage::url($path)]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil diperbarui.',
            'avatar_url' => $user->avatar_url
        ]);
    }

    // ─── Favorites ───
    public function getFavorites(Request $request)
    {
        $favorites = \App\Models\Favorite::with('product')
            ->where('user_id', $request->user()->id)
            ->whereHas('product')
            ->get();
        return response()->json(['success' => true, 'data' => $favorites]);
    }

    public function toggleFavorite(Request $request, $productId)
    {
        $userId = $request->user()->id;
        $fav = \App\Models\Favorite::where('user_id', $userId)->where('product_id', $productId)->first();
        
        if ($fav) {
            $fav->delete();
            return response()->json(['success' => true, 'is_favorite' => false]);
        } else {
            \App\Models\Favorite::create(['user_id' => $userId, 'product_id' => $productId]);
            return response()->json(['success' => true, 'is_favorite' => true]);
        }
    }

    // ─── Addresses ───
    public function getAddresses(Request $request)
    {
        $addresses = \App\Models\Address::where('user_id', $request->user()->id)->get();
        return response()->json(['success' => true, 'data' => $addresses]);
    }

    public function storeAddress(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string',
            'address' => 'required|string',
            'receiver_name' => 'nullable|string',
            'receiver_phone' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_default' => 'boolean',
        ]);

        if ($validated['is_default'] ?? false) {
            \App\Models\Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address = \App\Models\Address::create(array_merge($validated, ['user_id' => $request->user()->id]));
        return response()->json(['success' => true, 'data' => $address]);
    }

    public function deleteAddress(Request $request, $id)
    {
        \App\Models\Address::where('user_id', $request->user()->id)->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ─── AI Recommendations ───
    public function getRecommendations(Request $request)
    {
        $userId = $request->user()->id;
        $recommendations = \App\Services\RecommendationService::getForUser($userId);
        
        return response()->json([
            'success' => true,
            'data' => $recommendations
        ]);
    }

    public function getRelatedProducts($productId)
    {
        $related = \App\Services\RecommendationService::getFrequentlyBoughtTogether($productId);
        
        return response()->json([
            'success' => true,
            'data' => $related
        ]);
    }

    /**
     * Send OTP to Email or WhatsApp
     */
    public function sendOtp(Request $request, OtpService $otpService)
    {
        $validator = Validator::make($request->all(), [
            'identifier' => 'required', // email or phone
            'type'       => 'required|in:register,login,reset_password',
            'channel'    => 'required|in:email,whatsapp',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        // Logic: if channel is whatsapp but not supported yet, you can force email or return error
        // For now, let's allow it as a "framework" placeholder

        $success = $otpService->sendOtp(
            $request->identifier,
            $request->type,
            $request->channel
        );

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Kode OTP berhasil dikirim ke ' . $request->identifier
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal mengirim OTP. Silakan coba lagi.'
        ], 500);
    }

    /**
     * Verify OTP Code
     */
    public function verifyOtp(Request $request, OtpService $otpService)
    {
        $validator = Validator::make($request->all(), [
            'identifier' => 'required',
            'code'       => 'required|string|size:6',
            'type'       => 'required|in:register,login,reset_password',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $isValid = $otpService->verifyOtp($request->identifier, $request->code, $request->type);

        if ($isValid) {
            $data = [
                'success' => true,
                'message' => 'Verifikasi berhasil.'
            ];

            // If login/register verification, trust the device and provide session info
            if ($request->type === 'login' || $request->type === 'register') {
                $user = User::where('email', $request->identifier)
                    ->orWhere('phone', $request->identifier)
                    ->first();

                if ($user) {
                    // Mark device as trusted if device_id provided
                    if ($request->filled('device_id')) {
                        \App\Models\UserDevice::updateOrCreate(
                            ['user_id' => $user->id, 'device_id' => $request->device_id],
                            ['is_trusted' => true, 'last_login_at' => now()]
                        );
                    }

                    if ($request->type === 'login') {
                        $token = $user->createToken('mobile-token')->plainTextToken;
                        $data['token'] = $token;
                        $data['user'] = [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'phone' => $user->phone,
                            'role' => $user->role,
                        ];
                    }
                }
            }

            return response()->json($data);
        }

        return response()->json([
            'success' => false,
            'message' => 'Kode OTP tidak valid atau sudah kadaluarsa.'
        ], 400);
    }

    /**
     * Get available standard public vouchers and point-redeemable templates
     */
    public function getVouchers(Request $request)
    {
        $vouchers = Voucher::where('is_active', true)
            ->whereNull('user_id')
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>=', now());
            })
            ->where(function($q) {
                $q->whereNull('usage_limit')
                  ->orWhereColumn('used_count', '<', 'usage_limit');
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $vouchers
        ]);
    }

    /**
     * Redeem a point-redeemable voucher template
     */
    public function redeemVoucher(Request $request)
    {
        $request->validate([
            'voucher_id' => 'required|integer|exists:vouchers,id',
        ]);

        $userId = $request->user()->id;
        $result = \App\Services\VoucherService::redeemVoucher($request->voucher_id, $userId);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result, 200);
    }

    /**
     * Get owned claimed vouchers of the authenticated user
     */
    public function getMyVouchers(Request $request)
    {
        $userId = $request->user()->id;
        $vouchers = Voucher::where('user_id', $userId)
            ->where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>=', now());
            })
            ->where(function($q) {
                $q->whereNull('usage_limit')
                  ->orWhereColumn('used_count', '<', 'usage_limit');
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $vouchers
        ]);
    }
}

