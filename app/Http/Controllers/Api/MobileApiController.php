<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\AppSetting;
use App\Models\Branch;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\Favorite;
use App\Models\Merchant;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Promotion;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\UserDevice;
use App\Models\Voucher;
use App\Services\OtpService;
use App\Services\PointsService;
use App\Services\RecommendationService;
use App\Services\VoucherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

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

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email/No HP atau password salah.',
            ], 401);
        }

        // Adaptive Security Check
        $deviceId = $request->device_id;
        if ($deviceId) {
            $device = UserDevice::where('user_id', $user->id)
                ->where('device_id', $deviceId)
                ->first();

            $isNewDevice = ! $device;
            $isLongInactive = $device && $device->last_login_at && $device->last_login_at->diffInDays(now()) >= 2;

            // Per-channel OTP toggles
            $globalOtpEnabled = SystemSetting::getVal('otp_enabled', '1') === '1';
            $waOtpEnabled = $globalOtpEnabled;
            $emailOtpEnabled = $globalOtpEnabled && (SystemSetting::getVal('otp_email_enabled', '1') === '1');
            $anyOtpEnabled = $globalOtpEnabled && ($waOtpEnabled || $emailOtpEnabled);

            if ($anyOtpEnabled && ($isNewDevice || $isLongInactive)) {
                // Auto-send OTP for security verification
                $otpService = app(OtpService::class);

                // Prefer WA channel if phone exists AND WA OTP is enabled,
                // otherwise fall back to email OTP.
                if ($user->phone && $waOtpEnabled) {
                    $identifier = $user->phone;
                    $channel = 'whatsapp';
                } else {
                    $identifier = $user->email;
                    $channel = 'email';
                }

                // Track this as a login type OTP
                $otpService->sendOtp($identifier, 'login', $channel);

                return response()->json([
                    'success' => false,
                    'otp_required' => true,
                    'message' => 'Login dari perangkat baru atau sudah lama tidak login. Verifikasi OTP diperlukan.',
                    'identifier' => $identifier,
                    'channel' => $channel,
                ], 202);
            }

            // Update device log
            if ($device) {
                $device->update(['last_login_at' => now(), 'device_name' => $request->device_name]);
            } else {
                UserDevice::create([
                    'user_id' => $user->id,
                    'device_id' => $deviceId,
                    'device_name' => $request->device_name,
                    'last_login_at' => now(),
                    'is_trusted' => ! $anyOtpEnabled,
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
                'avatar' => $user->avatar ? config('filesystems.disks.minio.url').'/'.$user->avatar : null,
                'avatar_url' => $user->avatar_url ?? ($user->avatar ? config('filesystems.disks.minio.url').'/'.$user->avatar : null),
            ],
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
    public function getOutlets(Request $request)
    {
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');

        // If coordinates are provided, do not use the cache for sorting
        if ($latitude && $longitude) {
            $outlets = Branch::where('is_active', true)->get();
            $lat = (float) $latitude;
            $lng = (float) $longitude;

            $outlets = $outlets->map(function ($branch) use ($lat, $lng) {
                if ($branch->lat && $branch->lng) {
                    $branchLat = (float) $branch->lat;
                    $branchLng = (float) $branch->lng;

                    // Haversine formula
                    $earthRadius = 6371; // km
                    $dLat = deg2rad($branchLat - $lat);
                    $dLng = deg2rad($branchLng - $lng);

                    $a = sin($dLat / 2) * sin($dLat / 2) +
                         cos(deg2rad($lat)) * cos(deg2rad($branchLat)) *
                         sin($dLng / 2) * sin($dLng / 2);
                    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
                    $distance = $earthRadius * $c;

                    $branch->distance = round($distance, 2); // distance in km
                } else {
                    $branch->distance = null;
                }
                return $branch;
            })->sortBy(function ($branch) {
                return $branch->distance ?? 999999;
            })->values();
        } else {
            $outlets = Cache::remember('outlets_active', 3600, function () {
                return Branch::where('is_active', true)->get();
            });
        }

        return response()->json([
            'success' => true,
            'data' => $outlets,
        ]);
    }

    public function getCategories()
    {
        $categories = Cache::remember('product_categories', 3600, function () {
            return ProductCategory::all();
        });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function getProducts(Request $request, $branchId)
    {
        // Ambil produk yang spesifik untuk cabang ini ATAU yang bersifat global (branch_id null)
        $products = Product::with(['category', 'customizations.options'])
            ->where(function ($query) use ($branchId) {
                $query->where('branch_id', $branchId)
                    ->orWhereNull('branch_id');
            })
            ->where('is_available', true)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
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
            'items.*.customizations' => 'nullable|array',
            'items.*.customizations.*.name' => 'required|string',
            'items.*.customizations.*.price' => 'required|numeric|min:0',
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
        $merchantId = $branch->merchant_id ?? 1;

        // Fetch active BOGO promotions for this merchant
        $bogoPromosCollection = Promotion::active()
            ->where('merchant_id', $merchantId)
            ->where('type', 'bogo')
            ->get();

        // Specific BOGOs (linked to a product)
        $specificBogoPromos = $bogoPromosCollection->whereNotNull('buy_product_id')->keyBy('buy_product_id');

        // Global BOGO (applies to "all menus")
        $globalBogoPromo = $bogoPromosCollection->whereNull('buy_product_id')->first();

        try {
            DB::beginTransaction();

            $orderNumber = 'ORD-'.now()->format('ymdHi').'-'.strtoupper(substr(uniqid(), -4));

            $order = Order::create([
                'customer_id' => $user?->id,
                'merchant_id' => $merchantId,
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
                $productId = $item['product_id'];
                $qty = $item['quantity'];
                $unitPrice = $item['unit_price'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $productId,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $qty * $unitPrice,
                    'notes' => $item['notes'] ?? null,
                    'customizations' => $item['customizations'] ?? null,
                ]);

                // Apply BOGO Promo
                $promo = null;
                $freeProductId = null;

                if (isset($specificBogoPromos[$productId])) {
                    $promo = $specificBogoPromos[$productId];
                    $freeProductId = $promo->get_product_id;
                } elseif ($globalBogoPromo) {
                    $promo = $globalBogoPromo;
                    $freeProductId = $globalBogoPromo->get_product_id ?: $productId; // Specific free product or same product
                }

                if ($promo && $freeProductId) {
                    $buyQty = $promo->buy_quantity ?: 1;
                    $getQty = $promo->get_quantity ?: 1;

                    $multiplier = floor($qty / $buyQty);
                    $freeQty = $multiplier * $getQty;

                    if ($freeQty > 0) {
                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $freeProductId,
                            'quantity' => $freeQty,
                            'unit_price' => 0,
                            'subtotal' => 0,
                            'notes' => 'PROMO BOGO: '.$promo->name,
                        ]);
                    }
                }
            }

            // 3. Handle Auto Point Redemption
            if ($request->boolean('use_points', true)) {
                PointsService::redeemPoints($user->id, $order->id);
                $order->refresh(); // Refresh to get updated total/discount
            }

            // 4. Handle Voucher
            if ($request->filled('voucher_code')) {
                VoucherService::applyToOrder($order->id, $request->voucher_code);
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

            $traceId = (string) Str::uuid();
            Log::error('Order creation failed: '.$e->getMessage(), [
                'trace_id' => $traceId,
                'exception' => $e,
                'user_id' => $request->user()?->id,
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pesanan. Silakan coba beberapa saat lagi.',
                'trace_id' => $traceId,
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
            'phone' => 'nullable|string|max:20|unique:users,phone',
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
        $promos = Cache::remember('promotions_active', 300, function () {
            return Promotion::active()
                ->whereIn('applicable_on', ['online', 'all'])
                ->with(['buyProduct', 'getProduct'])
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $promos,
        ]);
    }

    /**
     * Get mobile app dynamic settings
     */
    public function getSettings()
    {
        $heroImagesRaw = AppSetting::getVal('app_landing_hero_image');
        $heroImages = [];

        if ($heroImagesRaw) {
            if (is_array($heroImagesRaw)) {
                $heroImages = $heroImagesRaw;
            } else {
                $heroImages[] = $heroImagesRaw;
            }
        }

        // Get merchant payment info (first active merchant)
        $merchant = Merchant::where('is_active', true)->first();

        // Build QRIS image public URL
        $qrisImageUrl = null;
        if ($merchant && $merchant->qris_image_url) {
            if (str_starts_with($merchant->qris_image_url, 'http')) {
                $qrisImageUrl = $merchant->qris_image_url;
            } else {
                $qrisImageUrl = Storage::disk('public')->url($merchant->qris_image_url);
            }
        }

        $settings = [
            'hero_images' => $heroImages,
            'hero_image' => ! empty($heroImages) ? $heroImages[0] : null,
            'promo_text' => AppSetting::getVal('app_landing_promo_text'),
            'support_whatsapp' => AppSetting::getVal('app_support_whatsapp'),
            // Payment info
            'qris_image_url' => $qrisImageUrl,
            'bank_name' => $merchant?->bank_name,
            'bank_account_number' => $merchant?->bank_account_number,
            'bank_account_name' => $merchant?->bank_account_name,
            // OTP Toggles
            'otp_enabled' => SystemSetting::getVal('otp_enabled', '1') === '1',
            'otp_email_enabled' => SystemSetting::getVal('otp_email_enabled', '1') === '1',
        ];

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update app connectivity status
     */
    public function health()
    {
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'unhealthy',
                'error' => 'Database connection failed',
            ], 500);
        }

        // Update app last connected at status
        AppSetting::updateOrCreate(
            ['key' => 'app_last_connected_at'],
            ['value' => now()->toIso8601String(), 'type' => 'text', 'group' => 'system']
        );

        return response()->json([
            'success' => true,
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
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

            if (! in_array($hex, $validSignatures)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Format file tidak valid atau berbahaya.',
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
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    // ─── Chat Endpoints ───

    /**
     * Get user chat rooms
     */
    public function getChatRooms(Request $request)
    {
        $rooms = ChatRoom::with(['merchant'])
            ->where('customer_id', $request->user()->id)
            ->orderBy('last_message_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rooms,
        ]);
    }

    /**
     * Open or create chat room with merchant
     */
    public function openChatRoom(Request $request, $merchantId)
    {
        $room = ChatRoom::firstOrCreate([
            'customer_id' => $request->user()->id,
            'merchant_id' => $merchantId,
        ]);

        return response()->json([
            'success' => true,
            'data' => $room->load('merchant'),
        ]);
    }

    /**
     * Get chat messages
     */
    public function getChatMessages(Request $request, $roomId)
    {
        $room = ChatRoom::findOrFail($roomId);
        if ($room->customer_id !== $request->user()->id) {
            abort(403);
        }

        $messages = ChatMessage::with('sender:id,name,avatar_url')
            ->where('chat_room_id', $roomId)
            ->oldest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    /**
     * Send chat message
     */
    public function sendChatMessage(Request $request, $roomId)
    {
        $request->validate(['message' => 'required|string']);

        $room = ChatRoom::findOrFail($roomId);
        if ($room->customer_id !== $request->user()->id) {
            abort(403);
        }

        $message = ChatMessage::create([
            'chat_room_id' => $roomId,
            'sender_id' => $request->user()->id,
            'message' => $request->message,
        ]);

        $room->update(['last_message_at' => now()]);

        // Broadcast to Pusher
        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'success' => true,
            'data' => $message->load('sender:id,name,avatar_url'),
        ]);
    }

    /**
     * Validate voucher code
     */
    public function validateVoucher(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric',
        ]);

        $result = VoucherService::validate(
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
            'phone' => 'nullable|string|max:20|unique:users,phone,'.$user->id,
            'gender' => 'nullable|in:male,female,other',
            'birth_date' => 'nullable|date',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user,
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

        if (! isset($allowedMagicBytes[$magicBytes])) {
            return response()->json([
                'success' => false,
                'message' => 'Format file tidak valid atau berbahaya.',
            ], 422);
        }

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $path = $file->store('avatars');
            $user->update(['avatar_url' => Storage::url($path)]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil diperbarui.',
            'avatar_url' => $user->avatar_url,
        ]);
    }

    // ─── Favorites ───
    public function getFavorites(Request $request)
    {
        $favorites = Favorite::with('product')
            ->where('user_id', $request->user()->id)
            ->whereHas('product')
            ->get();

        return response()->json(['success' => true, 'data' => $favorites]);
    }

    public function toggleFavorite(Request $request, $productId)
    {
        $userId = $request->user()->id;
        $fav = Favorite::where('user_id', $userId)->where('product_id', $productId)->first();

        if ($fav) {
            $fav->delete();

            return response()->json(['success' => true, 'is_favorite' => false]);
        } else {
            Favorite::create(['user_id' => $userId, 'product_id' => $productId]);

            return response()->json(['success' => true, 'is_favorite' => true]);
        }
    }

    // ─── Addresses ───
    public function getAddresses(Request $request)
    {
        $addresses = Address::where('user_id', $request->user()->id)->get();

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
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address = Address::create(array_merge($validated, ['user_id' => $request->user()->id]));

        return response()->json(['success' => true, 'data' => $address]);
    }

    public function deleteAddress(Request $request, $id)
    {
        Address::where('user_id', $request->user()->id)->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    // ─── AI Recommendations ───
    public function getRecommendations(Request $request)
    {
        $userId = $request->user()->id;
        $recommendations = RecommendationService::getForUser($userId);

        return response()->json([
            'success' => true,
            'data' => $recommendations,
        ]);
    }

    public function getRelatedProducts($productId)
    {
        $related = RecommendationService::getFrequentlyBoughtTogether($productId);

        return response()->json([
            'success' => true,
            'data' => $related,
        ]);
    }

    /**
     * Send OTP to Email or WhatsApp
     */
    public function sendOtp(Request $request, OtpService $otpService)
    {
        $validator = Validator::make($request->all(), [
            'identifier' => 'required', // email or phone
            'type' => 'required|in:register,login,reset_password',
            'channel' => 'required|in:email,whatsapp',
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
                'message' => 'Kode OTP berhasil dikirim ke '.$request->identifier,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal mengirim OTP. Silakan coba lagi.',
        ], 500);
    }

    /**
     * Verify OTP Code
     */
    public function verifyOtp(Request $request, OtpService $otpService)
    {
        $validator = Validator::make($request->all(), [
            'identifier' => 'required',
            'code' => 'required|string|size:6',
            'type' => 'required|in:register,login,reset_password',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $isValid = $otpService->verifyOtp($request->identifier, $request->code, $request->type);

        if ($isValid) {
            $data = [
                'success' => true,
                'message' => 'Verifikasi berhasil.',
            ];

            // If login/register verification, trust the device and provide session info
            if ($request->type === 'login' || $request->type === 'register') {
                $user = User::where('email', $request->identifier)
                    ->orWhere('phone', $request->identifier)
                    ->first();

                if ($user) {
                    // Mark device as trusted if device_id provided
                    if ($request->filled('device_id')) {
                        UserDevice::updateOrCreate(
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
            'message' => 'Kode OTP tidak valid atau sudah kadaluarsa.',
        ], 400);
    }

    /**
     * Get available standard public vouchers and point-redeemable templates
     */
    public function getVouchers(Request $request)
    {
        $vouchers = Voucher::where('is_active', true)
            ->whereNull('user_id')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereColumn('used_count', '<', 'usage_limit');
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $vouchers,
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
        $result = VoucherService::redeemVoucher($request->voucher_id, $userId);

        if (! $result['success']) {
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
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereColumn('used_count', '<', 'usage_limit');
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $vouchers,
        ]);
    }

    /**
     * Get Admin Dashboard stats and monitoring data for mobile native UI
     */
    public function getAdminDashboard(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $merchant = $user->merchant;
        if (! $merchant) {
            return response()->json(['success' => false, 'message' => 'Merchant not found'], 404);
        }

        $merchantId = $merchant->id;

        // Statistics for current merchant
        $stats = [
            'total_revenue' => Order::where('merchant_id', $merchantId)->where('payment_status', 'confirmed')->sum('total') +
                              \App\Models\PosTransaction::where('merchant_id', $merchantId)->sum('total'),
            'total_orders' => Order::where('merchant_id', $merchantId)->count() +
                             \App\Models\PosTransaction::where('merchant_id', $merchantId)->count(),
            'pending_orders' => Order::where('merchant_id', $merchantId)->where('status', 'pending')->count(),
            'total_products' => Product::where('merchant_id', $merchantId)->count(),
        ];

        // Today's specific stats (Resets every day)
        $todayStats = [
            'revenue' => Order::where('merchant_id', $merchantId)->where('payment_status', 'confirmed')->whereDate('created_at', now())->sum('total') +
                         \App\Models\PosTransaction::where('merchant_id', $merchantId)->whereDate('transaction_at', now())->sum('total'),
            'orders' => Order::where('merchant_id', $merchantId)->whereDate('created_at', now())->count() +
                        \App\Models\PosTransaction::where('merchant_id', $merchantId)->whereDate('transaction_at', now())->count(),
            'voids' => \App\Models\PosShift::whereHas('branch', function ($q) use ($merchantId) {
                $q->where('merchant_id', $merchantId);
            })->whereDate('opened_at', now())->sum('void_count'),
        ];

        // Chart Data: Last 7 Days
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $label = now()->subDays($i)->isoFormat('ddd');

            $onlineSales = Order::where('merchant_id', $merchantId)
                ->where('payment_status', 'confirmed')
                ->whereDate('created_at', $date)
                ->sum('total');

            $posSales = \App\Models\PosTransaction::where('merchant_id', $merchantId)
                ->whereDate('transaction_at', $date)
                ->sum('total');

            $chartData[] = [
                'name' => $label,
                'sales' => (float) ($onlineSales + $posSales),
                'orders' => Order::where('merchant_id', $merchantId)->whereDate('created_at', $date)->count() +
                           \App\Models\PosTransaction::where('merchant_id', $merchantId)->whereDate('transaction_at', $date)->count(),
            ];
        }

        // Branch Status
        $branches = Branch::where('merchant_id', $merchantId)
            ->withCount(['orders as orders' => function ($q) {
                $q->whereIn('status', ['pending', 'confirmed', 'preparing']);
            }])
            ->get()
            ->map(function ($branch) {
                return [
                    'name' => $branch->name,
                    'status' => 'Online', // Simplified
                    'orders' => $branch->orders,
                ];
            });

        // Active Shifts for Monitoring
        $activeShifts = \App\Models\PosShift::whereHas('branch', function ($q) use ($merchantId) {
            $q->where('merchant_id', $merchantId);
        })
            ->whereNull('closed_at')
            ->with(['cashier', 'branch'])
            ->latest()
            ->get();

        $insights = \App\Services\InsightService::generateAdminInsights($stats, $todayStats, $chartData, $merchantId);

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'today_stats' => $todayStats,
                'chart_data' => $chartData,
                'branches' => $branches,
                'active_shifts' => $activeShifts,
                'insights' => $insights,
            ]
        ]);
    }

    /**
     * Get Super Admin Dashboard stats for mobile native UI
     */
    public function getSuperAdminDashboard(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'super_admin') {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $stats = [
            'total_users' => User::count(),
            'total_merchants' => Merchant::count(),
            'total_orders' => Order::count(),
            'total_pos' => \App\Models\PosTransaction::count(),
            'total_revenue' => Order::where('payment_status', 'confirmed')->sum('total') + \App\Models\PosTransaction::sum('total'),
            'today_orders' => Order::whereDate('created_at', now()->today())->count(),
            'today_revenue' => Order::whereDate('created_at', now()->today())->where('payment_status', 'confirmed')->sum('total') +
                               \App\Models\PosTransaction::whereDate('transaction_at', now()->today())->sum('total'),
        ];

        // Chart data (7 days)
        $chartData = collect(range(6, 0))->map(function ($days) {
            $date = now()->subDays($days)->format('Y-m-d');

            return [
                'name' => now()->subDays($days)->format('D'),
                'revenue' => Order::whereDate('created_at', $date)->where('payment_status', 'confirmed')->sum('total') +
                             \App\Models\PosTransaction::whereDate('transaction_at', $date)->sum('total'),
            ];
        });

        $insights = \App\Services\InsightService::generateSuperAdminInsights($stats);

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'chart_data' => $chartData,
                'insights' => $insights,
            ]
        ]);
    }
}
