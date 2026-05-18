# EWWON COCO — Copilot Instructions
# Simpan file ini di: .github/copilot-instructions.md (root project)
# File ini dibaca otomatis oleh GitHub Copilot Chat di VS Code setiap sesi.
# Kompatibel dengan: GitHub Copilot (VS Code), Claude AI, Cursor

---

## 🎯 KONTEKS PROJECT

Kamu adalah senior full-stack developer yang membangun **EWWON COCO**, sebuah platform
digital commerce internal (bukan SaaS) untuk mengelola penjualan online, kasir POS berbasis
web, inventaris, pengiriman, dan analitik bisnis dalam satu ekosistem terpadu.

**Nama Platform:** EWWON COCO
**Tagline:** Satu Platform. Kelola Semua Operasional.
**Jenis:** Internal business tool — bukan produk dijual ke pihak luar
**Target:** Tim internal bisnis (owner, admin, kasir, customer)
**Bahasa UI:** Bahasa Indonesia + Inggris (multi-language via Laravel Localization)
**Stack:** Laravel 11 · PHP 8.3 · React · Inertia.js · MySQL 8
**Deployment:** Shared Hosting PHP (Niagahoster / Hostinger) via FTP/SSH + cPanel — **TANPA VPS atau Docker**
**Payment:** QRIS Statis (upload gambar QR oleh merchant) + Tunai — TANPA payment gateway
**Delivery:** GoSend API (Gojek) + GrabExpress API (Grab)
**Maps:** Google Maps JavaScript API
**Push Notification:** Firebase Cloud Messaging (FCM) via HTTP v1 API
**Auth:** Laravel Sanctum (session) + OTP via Email + Google OAuth (Socialite)
**Realtime:** Laravel Reverb (WebSocket) — fallback: Pusher Free Tier
**Queue:** Laravel Queue — Database driver + Cron Job cPanel
**Database GUI:** phpMyAdmin (bawaan cPanel)

> ℹ️ Platform ini dikembangkan untuk keperluan internal bisnis sendiri. Tidak ada model
> berlangganan, tidak ada penjualan lisensi ke pihak luar, dan tidak ada onboarding
> merchant eksternal. Platform berjalan **full online** melalui web browser — **tidak ada mode offline**.

---

## 🛠️ STACK TEKNOLOGI (SHARED HOSTING EDITION)

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 11 · PHP 8.3 |
| Frontend | React + Inertia.js |
| UI Components | shadcn/ui + Radix UI Primitives + Lucide React |
| Styling | Tailwind CSS v4 |
| ORM | Eloquent ORM (bawaan Laravel) |
| Database | MySQL 8 (managed via phpMyAdmin) |
| Auth | Laravel Sanctum (session) + OTP via Email + Google OAuth (Socialite) |
| Realtime | Laravel Reverb (WebSocket) — fallback: Pusher Free Tier |
| Queue | Laravel Queue — Database driver + Cron Job cPanel |
| Build Tool | Vite (bawaan Laravel) |
| Deployment | Shared Hosting PHP (Niagahoster / Hostinger) via FTP/SSH + cPanel |
| Payment | Cash dan QRIS Statis (tanpa payment gateway) |
| Delivery | GoSend API (Gojek) + GrabExpress API (Grab) |
| Maps | Google Maps JavaScript API |
| Push Notif | Firebase Cloud Messaging (FCM) via HTTP v1 API |
| Email/OTP | SMTP (Gmail / Mailgun / Mailtrap) |
| Storage | cPanel File Manager lokal / Cloudflare R2 (opsional CDN) |

> ⚠️ **JANGAN** menyarankan VPS, Docker, Node.js persistent process, atau CI/CD kompleks.
> Stack ini dipilih khusus agar berjalan di **shared hosting PHP biasa**.

---

## 🎨 DESIGN SYSTEM

### Brand Colors
```css
--color-primary:     #00C48C;   /* Green — warna utama, CTA, tombol aktif */
--color-secondary:   #FF8A00;   /* Orange — aksen, badge, highlight */
--color-white:       #FFFFFF;   /* Background utama */
--color-light-green: #F0FAF6;   /* Background section, card alt */
--color-charcoal:    #1A1A1A;   /* Teks utama, heading, dark section */
--color-gray:        #6B7280;   /* Teks sekunder, placeholder */
--color-border:      #E5E7EB;   /* Border default komponen */
--color-gray-light:  #F5F5F5;   /* Background abu, hover state */
```

### Aturan Visual (WAJIB)
- **TIDAK ADA gradient** — semua warna solid flat
- **TIDAK ADA glassmorphism** — background harus solid
- **TIDAK ADA offline mode** — platform full online, termasuk POS
- Style: Modern minimalis, clean, sharp edges
- Rounded corners: `rounded-lg` (12px) untuk card, `rounded-md` (8px) untuk input/button
- Font: `Poppins` (heading/label) + `Inter` (body/content)
- Icon library: **Lucide React** — konsisten dengan shadcn/ui. **JANGAN mix icon library.**
- Shadow: hanya `shadow-sm` / `shadow-md` untuk elevasi card — bukan dekoratif
- Ukuran font minimum: 12px

### Typography Scale
```
H1: Poppins 700 · 3rem (48px)      — Heading utama halaman
H2: Poppins 700 · 2.25rem (36px)   — Heading section
H3: Poppins 600 · 1.5rem (24px)    — Sub-section heading
H4: Poppins 600 · 1.125rem (18px)  — Card title, label besar
Body: Inter 400 · 1rem (16px) · line-height 1.7
Small: Inter 400 · 0.875rem (14px)
Caption: Inter 500 · 0.75rem (12px)
```

### Format Harga (PHP — selalu gunakan helper ini)
```php
// app/Helpers/Format.php
Format::rupiah($amount)
// Output: Rp 85.000
```

### Format Harga (TypeScript — selalu gunakan helper ini)
```typescript
// resources/js/lib/format.ts
export function rupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}
// Output: Rp 85.000
```

### Format Tanggal (Indonesia)
```typescript
// resources/js/lib/format.ts
export function tanggal(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}
// Output: 15 Januari 2025
```

> ⚠️ **JANGAN** format harga atau tanggal secara manual. Selalu gunakan helper di atas.

---

## 🔑 ENVIRONMENT VARIABLES (DEVELOPMENT REFERENCE)

```env
# App
APP_NAME="EWWON COCO"
APP_URL=http://localhost:8000
APP_ENV=local
APP_DEBUG=true
APP_KEY=

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_ewwon_coco
DB_USERNAME=ewwon_user
DB_PASSWORD=

# Auth / Session
SESSION_DRIVER=database
SESSION_LIFETIME=120

# OTP
OTP_EXPIRES_MINUTES=5

# Google OAuth (Socialite)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Firebase FCM
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Google Maps
GOOGLE_MAPS_API_KEY=

# GoSend (Gojek)
GOSEND_CLIENT_ID=
GOSEND_CLIENT_SECRET=
GOSEND_API_URL=https://api.gojek.com/gosend

# GrabExpress
GRAB_CLIENT_ID=
GRAB_CLIENT_SECRET=
GRAB_API_URL=https://partner-api.grab.com

# Realtime (WebSocket)
REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
# Fallback ke Pusher jika Reverb tidak tersedia di hosting
BROADCAST_CONNECTION=reverb
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=ap1

# Queue
QUEUE_CONNECTION=database

# Email / OTP
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@ewwoncoco.id
MAIL_FROM_NAME="EWWON COCO"

# Storage CDN (opsional)
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_ENDPOINT=
```

> ⚠️ JANGAN hardcode nilai di atas. Selalu gunakan `env('VARIABLE_NAME')` atau `config('...')`.
> ⚠️ File `.env` **tidak boleh** di-commit ke Git.

---

## 👥 ROLE & AKSES

| Role | Middleware Laravel | Route Prefix | Kemampuan |
|------|--------------------|--------------|-----------|
| `super_admin` | `auth`, `role:super_admin` | `/super-admin` | Akses penuh semua sistem, semua cabang, konfigurasi global |
| `admin` | `auth`, `role:admin` | `/admin` | Kelola produk, pesanan, laporan, upload QRIS, cabang sendiri |
| `kasir` | `auth`, `role:kasir` | `/pos` | Akses POS web, proses transaksi kasir, kelola shift |
| `customer` | `auth` | `/` | Pemesanan online, tracking, riwayat, poin loyalty |

**Auth flow:** Laravel Sanctum (session-based) + OTP via Email + Google OAuth (Socialite).

---

## 🗂️ DATABASE SCHEMA

Database: **MySQL 8** — dikelola via **phpMyAdmin** (bawaan cPanel).
ORM: **Eloquent** — gunakan migrations untuk semua perubahan schema.

### Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Data semua pengguna (role: super_admin, admin, kasir, customer) |
| `otp_codes` | Kode OTP login/register via email (expires 5 menit) |
| `merchants` | Profil dan konfigurasi toko + gambar QRIS statis |
| `branches` | Data cabang/outlet per merchant |
| `products` | Katalog produk per merchant dengan barcode dan stok |
| `product_categories` | Kategori produk per merchant |
| `orders` | Data pesanan online dengan status dan metode pembayaran |
| `order_items` | Rincian item dalam setiap pesanan |
| `delivery_requests` | Log request pengiriman ke GoSend/GrabExpress |
| `pos_transactions` | Transaksi kasir (sync real-time ke MySQL) |
| `pos_transaction_items` | Rincian item per transaksi POS |
| `pos_shifts` | Data shift kasir (buka/tutup kas) |
| `vouchers` | Kode promo dan voucher diskon |
| `loyalty_points` | Riwayat poin reward pelanggan |
| `reviews` | Ulasan pelanggan per pesanan |
| `notifications` | Notifikasi in-app semua user |
| `jobs` | Laravel Queue jobs (database driver) |
| `sessions` | Session pengguna (database driver) |

### Users & Auth
```sql
users:
  id BIGINT PK AUTO_INCREMENT
  name VARCHAR(100)
  email VARCHAR(100) UNIQUE
  phone VARCHAR(20) UNIQUE NULL
  password VARCHAR(255) NULL          -- NULL jika login via Google OAuth
  role ENUM('super_admin','admin','kasir','customer') DEFAULT 'customer'
  avatar_url VARCHAR(255) NULL
  google_id VARCHAR(100) NULL
  is_active BOOLEAN DEFAULT TRUE
  remember_token VARCHAR(100) NULL
  created_at TIMESTAMP
  updated_at TIMESTAMP

otp_codes:
  id BIGINT PK
  user_id BIGINT FK → users.id
  code VARCHAR(6)
  type ENUM('login','register','reset_password')
  expires_at TIMESTAMP
  is_used BOOLEAN DEFAULT FALSE
  created_at TIMESTAMP
```

### Merchants & Branches
```sql
merchants:
  id BIGINT PK AUTO_INCREMENT
  owner_id BIGINT FK → users.id
  name VARCHAR(100)
  slug VARCHAR(100) UNIQUE
  category VARCHAR(50)
  address TEXT
  phone VARCHAR(20)
  operational_hours JSON    -- {"mon":{"open":"08:00","close":"22:00"}, ...}
  qris_image_url VARCHAR(255) NULL
  is_active BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP
  updated_at TIMESTAMP

branches:
  id BIGINT PK AUTO_INCREMENT
  merchant_id BIGINT FK → merchants.id
  name VARCHAR(100)
  address TEXT
  phone VARCHAR(20)
  lat DECIMAL(10,8) NULL
  lng DECIMAL(11,8) NULL
  is_active BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP
  updated_at TIMESTAMP
```

### Products & Inventory
```sql
products:
  id BIGINT PK AUTO_INCREMENT
  merchant_id BIGINT FK → merchants.id
  branch_id BIGINT FK → branches.id NULL   -- NULL = berlaku semua cabang
  category_id BIGINT FK → product_categories.id NULL
  name VARCHAR(150)
  slug VARCHAR(150)
  description TEXT NULL
  price DECIMAL(12,2)
  image_url VARCHAR(255) NULL
  barcode VARCHAR(50) NULL
  stock INT DEFAULT 0
  min_stock INT DEFAULT 5              -- trigger notif jika stock <= min_stock
  is_available BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP
  updated_at TIMESTAMP

product_categories:
  id BIGINT PK
  merchant_id BIGINT FK → merchants.id
  name VARCHAR(80)
  icon VARCHAR(50) NULL
  order INT DEFAULT 0
```

### Orders (Online)
```sql
orders:
  id BIGINT PK AUTO_INCREMENT
  customer_id BIGINT FK → users.id
  merchant_id BIGINT FK → merchants.id
  branch_id BIGINT FK → branches.id
  order_number VARCHAR(20) UNIQUE      -- format: EC-YYYYMMDD-XXXX
  status ENUM('pending','confirmed','preparing','ready_for_pickup','on_delivery','delivered','cancelled') DEFAULT 'pending'
  payment_method ENUM('qris','cash')
  payment_status ENUM('pending','confirmed','failed') DEFAULT 'pending'
  subtotal DECIMAL(12,2)
  delivery_fee DECIMAL(12,2) DEFAULT 0
  discount DECIMAL(12,2) DEFAULT 0
  total DECIMAL(12,2)
  delivery_address TEXT NULL
  delivery_lat DECIMAL(10,8) NULL
  delivery_lng DECIMAL(11,8) NULL
  notes TEXT NULL
  created_at TIMESTAMP
  updated_at TIMESTAMP

order_items:
  id BIGINT PK AUTO_INCREMENT
  order_id BIGINT FK → orders.id
  product_id BIGINT FK → products.id
  quantity INT
  unit_price DECIMAL(12,2)
  subtotal DECIMAL(12,2)
  notes TEXT NULL
```

### Delivery
```sql
delivery_requests:
  id BIGINT PK AUTO_INCREMENT
  order_id BIGINT FK → orders.id
  provider ENUM('gosend','grabexpress')
  provider_order_id VARCHAR(100) NULL
  status ENUM('requesting','finding_driver','on_pickup','on_delivery','delivered','cancelled') DEFAULT 'requesting'
  delivery_fee DECIMAL(12,2)
  driver_name VARCHAR(100) NULL
  driver_phone VARCHAR(20) NULL
  driver_photo VARCHAR(255) NULL
  driver_lat DECIMAL(10,8) NULL
  driver_lng DECIMAL(11,8) NULL
  estimated_arrival TIMESTAMP NULL
  requested_at TIMESTAMP
  delivered_at TIMESTAMP NULL
```

### POS Transactions
```sql
pos_transactions:
  id BIGINT PK AUTO_INCREMENT
  merchant_id BIGINT FK → merchants.id
  branch_id BIGINT FK → branches.id
  cashier_id BIGINT FK → users.id
  shift_id BIGINT FK → pos_shifts.id NULL
  transaction_number VARCHAR(20) UNIQUE   -- format: POS-YYYYMMDD-XXXX
  payment_method ENUM('cash','qris')
  total DECIMAL(12,2)
  cash_received DECIMAL(12,2) NULL
  change_amount DECIMAL(12,2) NULL
  transaction_at TIMESTAMP

pos_transaction_items:
  id BIGINT PK AUTO_INCREMENT
  transaction_id BIGINT FK → pos_transactions.id
  product_id BIGINT FK → products.id
  quantity INT
  unit_price DECIMAL(12,2)
  subtotal DECIMAL(12,2)

pos_shifts:
  id BIGINT PK AUTO_INCREMENT
  cashier_id BIGINT FK → users.id
  branch_id BIGINT FK → branches.id
  opened_at TIMESTAMP
  closed_at TIMESTAMP NULL
  opening_cash DECIMAL(12,2)
  closing_cash DECIMAL(12,2) NULL
  notes TEXT NULL
```

### Vouchers & Loyalty
```sql
vouchers:
  id BIGINT PK AUTO_INCREMENT
  merchant_id BIGINT FK → merchants.id
  code VARCHAR(30) UNIQUE
  discount_type ENUM('percent','fixed')
  discount_value DECIMAL(10,2)
  min_purchase DECIMAL(12,2) DEFAULT 0
  max_discount DECIMAL(12,2) NULL
  usage_limit INT NULL
  used_count INT DEFAULT 0
  expires_at TIMESTAMP NULL
  is_active BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP

loyalty_points:
  id BIGINT PK AUTO_INCREMENT
  customer_id BIGINT FK → users.id
  merchant_id BIGINT FK → merchants.id
  points INT
  transaction_type ENUM('earn','redeem','expired')
  reference_type VARCHAR(30) NULL   -- 'order', 'pos_transaction'
  reference_id BIGINT NULL
  description VARCHAR(150) NULL
  created_at TIMESTAMP

reviews:
  id BIGINT PK AUTO_INCREMENT
  customer_id BIGINT FK → users.id
  order_id BIGINT FK → orders.id
  merchant_id BIGINT FK → merchants.id
  rating TINYINT        -- 1-5
  comment TEXT NULL
  created_at TIMESTAMP
```

---

## 📁 STRUKTUR FOLDER PROJECT

```
ewwon-coco/                              ← Root Laravel project
├── .github/
│   └── copilot-instructions.md          ← FILE INI
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                    ← AuthController, OTPController
│   │   │   ├── Customer/                ← OrderController, CartController, TrackingController
│   │   │   ├── Admin/                   ← DashboardController, ProductController, OrderMgmtController
│   │   │   ├── POS/                     ← POSController, ShiftController, TransactionController
│   │   │   └── SuperAdmin/              ← MerchantController, UserController
│   │   └── Middleware/                  ← RoleMiddleware
│   ├── Models/                          ← User, Order, Product, POSTransaction, Branch, dll.
│   ├── Events/                          ← OrderStatusUpdated, DriverLocationUpdated
│   ├── Jobs/                            ← SendOTPJob, RequestDeliveryJob, SendFCMJob
│   ├── Services/                        ← DeliveryService.php, FCMService.php, LoyaltyService.php
│   └── Helpers/
│       └── Format.php                   ← rupiah(), tanggal() — helper format harga & tanggal
├── resources/
│   ├── js/
│   │   ├── Pages/
│   │   │   ├── Landing/                 ← Home.tsx (single-page scroll landing)
│   │   │   ├── Auth/                    ← Login.tsx, Register.tsx
│   │   │   ├── Customer/                ← Home, Shop, Cart, Checkout, Orders, Loyalty
│   │   │   ├── Admin/                   ← Dashboard, Products, Orders, Analytics, Settings
│   │   │   ├── POS/                     ← Screen, Shifts, Transactions
│   │   │   └── SuperAdmin/              ← Dashboard, Merchants, Users
│   │   ├── Components/
│   │   │   ├── Landing/                 ← Navbar, HeroSection, StatsSection, FeaturesSection,
│   │   │   │                               ProductShowcase, HowItWorksSection,
│   │   │   │                               TestimonialSection, FAQSection, Footer
│   │   │   ├── ui/                      ← shadcn/ui components (button, card, input, dll.)
│   │   │   ├── Customer/                ← ProductCard, OrderCard, CartDrawer
│   │   │   ├── Admin/                   ← DashboardStat, OrderTable, ProductForm
│   │   │   ├── POS/                     ← POSLayout, ProductGrid, PaymentPanel, ReceiptModal
│   │   │   └── Shared/                  ← QRISModal, TrackingMap, NotifBell
│   │   ├── Layouts/
│   │   │   ├── LandingLayout.tsx        ← Navbar + {children} + Footer
│   │   │   ├── CustomerLayout.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   └── POSLayout.tsx
│   │   ├── lib/
│   │   │   └── format.ts                ← rupiah(), tanggal()
│   │   └── types/                       ← TypeScript interfaces global
│   └── lang/
│       ├── id/                          ← Terjemahan Bahasa Indonesia
│       └── en/                          ← Terjemahan Bahasa Inggris
├── routes/
│   ├── web.php                          ← Semua route Inertia (auth middleware + role)
│   ├── api.php                          ← Webhook GoSend/Grab, FCM, integrasi eksternal
│   └── channels.php                     ← Authorization channel WebSocket (Reverb)
├── database/
│   ├── migrations/
│   └── seeders/
├── public/
│   └── build/                           ← Output Vite (js + css tercompile)
└── .env                                 ← Environment variables — JANGAN commit ke Git
```

---

## 📄 HALAMAN & STRUKTUR UI

Semua halaman dirender via **Inertia.js** menggunakan React + shadcn/ui.
Route dikelola oleh Laravel (`routes/web.php`) dengan middleware `auth` dan `role`.

### Landing Page (Public)
| Route | Komponen | Deskripsi |
|-------|----------|-----------|
| `/` | `Pages/Landing/Home.tsx` | Single-page scroll: Navbar, Hero, Stats, Features, Produk Terlaris, How It Works, Testimonial, FAQ, Footer |

**Struktur Landing Page (urutan section):**

| Urutan | Section | Background | Keterangan |
|--------|---------|-----------|------------|
| — | Navbar | Transparan → Putih | Berubah setelah scroll > 80px |
| 1 | Hero | `#FFFFFF` | Split-screen, headline Poppins 700 52px, 2 CTA, ilustrasi SVG flat |
| 2 | Stats | `#F0FAF6` | 4 kolom angka kunci bisnis |
| 3 | Features | `#FFFFFF` | Grid 3 kolom, 10 kartu fitur (icon Lucide + judul + deskripsi) |
| 4 | Produk Terlaris | `#F0FAF6` | Grid 4 kolom desktop / carousel mobile, data dari API |
| 5 | How It Works | `#FFFFFF` | 2 tab toggle (Pelanggan / Admin & Kasir), langkah bernomor |
| 6 | Testimonial | `#1A1A1A` | Embla Carousel, bg charcoal, bintang orange |
| 7 | FAQ | `#FFFFFF` | shadcn/ui Accordion, 6–8 pertanyaan |
| 8 | Footer | `#1A1A1A` | 4 kolom, sosial media, copyright |

**Komponen Landing Page:**
| Komponen | File Path |
|----------|-----------|
| LandingLayout | `Layouts/LandingLayout.tsx` |
| Navbar | `Components/Landing/Navbar.tsx` |
| HeroSection | `Components/Landing/HeroSection.tsx` |
| StatsSection | `Components/Landing/StatsSection.tsx` |
| FeaturesSection | `Components/Landing/FeaturesSection.tsx` |
| ProductShowcase | `Components/Landing/ProductShowcase.tsx` |
| HowItWorksSection | `Components/Landing/HowItWorksSection.tsx` |
| TestimonialSection | `Components/Landing/TestimonialSection.tsx` |
| FAQSection | `Components/Landing/FAQSection.tsx` |
| Footer | `Components/Landing/Footer.tsx` |

### Auth
| Route | Deskripsi |
|-------|-----------|
| `/login` | Login via email/OTP atau Google OAuth |
| `/register` | Registrasi customer baru |

### Customer App
| Route | Deskripsi |
|-------|-----------|
| `/shop` | Browse produk & toko |
| `/shop/{merchantSlug}` | Halaman toko merchant |
| `/cart` | Keranjang belanja |
| `/checkout` | Checkout (pilih kurir + payment) |
| `/orders` | Riwayat pesanan |
| `/orders/{orderId}` | Detail + tracking pesanan |
| `/profile` | Profil customer |
| `/loyalty` | Poin reward & membership |

### Admin/Owner Dashboard
| Route | Deskripsi |
|-------|-----------|
| `/admin` | Dashboard utama (stat, pesanan masuk, grafik) |
| `/admin/orders` | Manajemen pesanan online |
| `/admin/products` | CRUD produk |
| `/admin/inventory` | Monitoring stok |
| `/admin/pos-history` | Riwayat transaksi POS |
| `/admin/analytics` | Grafik penjualan & performa |
| `/admin/vouchers` | Kelola kode promo |
| `/admin/settings` | Upload QRIS, jam operasional, profil toko |

### POS Kasir
| Route | Deskripsi |
|-------|-----------|
| `/pos` | POS utama (grid produk + keranjang + payment) |
| `/pos/history` | Riwayat transaksi kasir |
| `/pos/shifts` | Manajemen shift kasir |

### Super Admin
| Route | Deskripsi |
|-------|-----------|
| `/super-admin` | Dashboard global semua cabang |
| `/super-admin/users` | Manajemen semua user & role |
| `/super-admin/merchants` | Manajemen semua merchant/toko |
| `/super-admin/branches` | Manajemen cabang |
| `/super-admin/analytics` | Analitik global multi-cabang |
| `/super-admin/settings` | Konfigurasi sistem global |

---

## 🔒 KEAMANAN (WAJIB DITERAPKAN)

```php
// routes/web.php — proteksi route berdasarkan role
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    // admin routes
});

// RoleMiddleware — cek role dari users.role
// Gunakan Laravel Sanctum session, bukan JWT

// Wajib di semua route yang menerima input:
// 1. Form Request validation (bukan manual validate di controller)
// 2. Gate / Policy untuk otorisasi resource
// 3. Rate limiting via Laravel RateLimiter di endpoint auth + order
```

### Aturan Wajib
- `APP_DEBUG=false` dan `APP_ENV=production` di server production
- File `.env` di luar `public_html` — tidak bisa diakses via browser
- SELALU validasi file upload: MIME type server-side, maks 2MB, rename dengan UUID
- QRIS image upload: hanya PNG/JPG, simpan di `storage/app/public/qris/`
- SSL aktif (HTTPS) via cPanel AutoSSL
- Semua secret di `.env` — **TIDAK boleh hardcode** di source code

---

## ⚡ REALTIME — LARAVEL REVERB

```php
// Primary: Laravel Reverb (self-hosted WebSocket)
// Jalankan di server: php artisan reverb:start
// Di shared hosting: gunakan Cron Job atau Pusher fallback

// config/broadcasting.php — sudah dikonfigurasi via .env
// BROADCAST_CONNECTION=reverb

// Event contoh:
class OrderStatusUpdated implements ShouldBroadcast {
    public function broadcastOn() {
        return new PrivateChannel('order.' . $this->order->id);
    }
}

// Client (React via Laravel Echo):
// resources/js/bootstrap.ts — setup Echo + pusher-js
window.Echo.private(`order.${orderId}`)
    .listen('OrderStatusUpdated', (e) => {
        // update state
    });
```

**Fallback:** Pusher Free Tier — atur `BROADCAST_CONNECTION=pusher` jika hosting tidak support persistent process.

---

## 📦 QUEUE & SCHEDULER

```php
// Queue driver: database (jobs tersimpan di tabel MySQL `jobs`)
// Jalankan worker via Cron Job cPanel:
// * * * * * php /path/to/artisan schedule:run >> /dev/null 2>&1

// Jobs yang ada:
// - SendOTPJob         → kirim kode OTP via email
// - RequestDeliveryJob → request driver ke GoSend/Grab
// - SendFCMJob         → kirim push notification via FCM

// Dispatch contoh:
SendOTPJob::dispatch($user, $otpCode);
RequestDeliveryJob::dispatch($order)->delay(now()->addSeconds(5));
```

---

## 🚀 DEPLOYMENT — SHARED HOSTING

```bash
# 1. Upload source code via Git atau FTP ke folder di luar public_html
# 2. Buat symlink: public_html → folder public Laravel
# 3. Install dependencies
composer install --no-dev --optimize-autoloader

# 4. Setup environment
cp .env.example .env
php artisan key:generate

# 5. Jalankan migrasi
php artisan migrate --force

# 6. Build frontend (via cPanel Node.js Selector atau SSH)
npm install && npm run build

# 7. Storage symlink
php artisan storage:link

# 8. Cache untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 9. Tambahkan Cron Job di cPanel untuk Laravel Scheduler
```

### Integrasi Eksternal

| Layanan | Provider | Keterangan |
|---------|----------|------------|
| Delivery | GoSend API (Gojek) + GrabExpress API (Grab) | Request pickup, tracking driver |
| Maps | Google Maps JavaScript API | Tampilan peta tracking real-time |
| Push Notification | Firebase Cloud Messaging (FCM) | Notifikasi pesanan ke customer & merchant |
| Email/OTP | SMTP (Gmail / Mailgun / Mailtrap) | Kirim kode OTP login/register |
| OAuth | Google OAuth via Laravel Socialite | Login dengan akun Google |
| Storage CDN | Cloudflare R2 (opsional) | CDN foto produk, gambar QRIS |
| WebSocket | Laravel Reverb / Pusher Free Tier (fallback) | Real-time order updates |

---

## 🌱 SEED DATA REFERENSI

### Akun Default (development/testing)
| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@ewwoncoco.id | SuperAdmin@123 |
| Admin/Owner | admin@ewwoncoco.id | Admin@123456 |
| Kasir | kasir@ewwoncoco.id | Kasir@123456 |
| Customer 1 | budi@customer.com | Customer@123 |
| Customer 2 | sari@customer.com | Customer@123 |

### Voucher Default
| Kode | Tipe | Nilai | Min. Beli |
|------|------|-------|-----------|
| COCO10 | percent | 10% | Rp 50.000 |
| COCOGRATIS | fixed | Rp 25.000 | Rp 150.000 |
| NEWCUSTOMER | percent | 15% | — |

---

---
---

# ═══════════════════════════════════════════════════════════════
# 🚀 ROADMAP PENGERJAAN — SECTION BY SECTION
# Kerjakan satu section sampai selesai sebelum lanjut ke section berikutnya.
# ═══════════════════════════════════════════════════════════════

---

## ✅ SECTION 1 — PROJECT SETUP & STRUKTUR AWAL

**Tujuan:** Inisialisasi project Laravel + React + Inertia.js, install dependencies, konfigurasi environment.

**Yang harus dikerjakan:**
1. Install Laravel 11 dengan PHP 8.3
2. Install dan konfigurasi Inertia.js (server-side: `inertiajs/inertia-laravel`, client: `@inertiajs/react`)
3. Setup React + TypeScript di `resources/js/`
4. Setup Tailwind CSS v4 dengan custom config (warna brand, font Poppins + Inter dari Google Fonts)
5. Install shadcn/ui, Radix UI, Lucide React
6. Setup Laravel Sanctum untuk session auth
7. Buat `.env` dan `.env.example` dengan semua variabel yang dibutuhkan
8. Buat `app/Helpers/Format.php` (rupiah, tanggal)
9. Buat `resources/js/lib/format.ts` (rupiah, tanggal)
10. Buat `resources/js/types/index.ts` dengan semua TypeScript interface global

**Prompt untuk AI:**
```
@workspace Kerjakan Section 1: Setup project Laravel 11 + React + Inertia.js untuk
EWWON COCO. Install Inertia.js (server + client), setup TypeScript, Tailwind CSS v4
dengan custom colors (#00C48C primary, #FF8A00 secondary, dll), font Poppins + Inter,
shadcn/ui, dan Lucide React. Setup Laravel Sanctum. Buat app/Helpers/Format.php,
resources/js/lib/format.ts, dan resources/js/types/index.ts sesuai instruksi project ini.
```

**Selesai jika:**
- [ ] `php artisan serve` + `npm run dev` berjalan tanpa error
- [ ] Inertia.js rendering React component dari Laravel route
- [ ] Tailwind custom colors teraplikasi
- [ ] shadcn/ui component bisa diimport dan digunakan
- [ ] Format::rupiah(85000) → "Rp 85.000"

---

## ✅ SECTION 2 — DATABASE & SCHEMA

**Tujuan:** Buat seluruh migration Eloquent, dan seed data awal.

**Yang harus dikerjakan:**
1. Buat migrations untuk semua tabel (lihat Database Schema di atas)
2. Buat Eloquent Models dengan relasi yang benar:
   - `User`, `OtpCode`
   - `Merchant`, `Branch`
   - `Product`, `ProductCategory`
   - `Order`, `OrderItem`
   - `DeliveryRequest`
   - `PosTransaction`, `PosTransactionItem`, `PosShift`
   - `Voucher`, `LoyaltyPoint`
   - `Review`
3. Jalankan `php artisan migrate`
4. Buat Seeders untuk semua tabel (lihat Seed Data Referensi)
5. Setup `DatabaseSeeder.php` dengan urutan seeder yang benar

**Prompt untuk AI:**
```
@workspace Kerjakan Section 2: Database migrations dan Eloquent Models untuk EWWON COCO
sesuai schema di copilot-instructions.md. Buat semua migration, Models dengan relasi
hasMany/belongsTo yang benar, dan Seeders (UserSeeder, MerchantSeeder, ProductSeeder,
VoucherSeeder). Gunakan BIGINT untuk semua primary key. Tambahkan softDeletes di
model yang relevan (Product, Order).
```

**Selesai jika:**
- [ ] `php artisan migrate` berjalan tanpa error
- [ ] `php artisan db:seed` berhasil insert data awal
- [ ] Semua relasi Eloquent bekerja dengan benar
- [ ] Bisa lihat semua tabel di phpMyAdmin

---

## ✅ SECTION 3 — AUTH SYSTEM (SANCTUM + OTP + GOOGLE OAUTH)

**Tujuan:** Sistem autentikasi lengkap dengan Laravel Sanctum, OTP via Email, dan Google OAuth.

**Yang harus dikerjakan:**
1. Buat `AuthController` dengan methods:
   - `showLogin()`, `showRegister()`
   - `register()` — registrasi customer baru
   - `requestOtp()` — generate & kirim OTP via email (SendOTPJob)
   - `verifyOtp()` — verifikasi OTP → login dengan Sanctum session
   - `logout()`
2. Buat `OTPController` untuk handle OTP flow
3. Setup Laravel Socialite untuk Google OAuth:
   - `redirectToGoogle()`, `handleGoogleCallback()`
4. Buat `RoleMiddleware` untuk proteksi route berdasarkan role
5. Buat Inertia pages: `Pages/Auth/Login.tsx` dan `Pages/Auth/Register.tsx`
6. Buat komponen `Components/Auth/OTPInput.tsx` — 6 kotak OTP input

**Prompt untuk AI:**
```
@workspace Kerjakan Section 3: Sistem auth EWWON COCO dengan Laravel Sanctum + OTP email
+ Google OAuth (Socialite). Buat AuthController, OTPController, RoleMiddleware, dan
SendOTPJob (kirim email OTP via Laravel Mail). Buat halaman Login.tsx dan Register.tsx
dengan Inertia.js + design system: putih/hijau/orange, Poppins+Inter, no gradient,
split-screen layout. Buat OTPInput.tsx dengan 6 kotak input yang auto-focus.
```

**Selesai jika:**
- [ ] Register bisa buat akun customer baru
- [ ] Login request OTP berhasil kirim kode ke email
- [ ] Verify OTP berhasil login dan set Sanctum session
- [ ] Route `/admin` diredirect ke `/login` jika belum login
- [ ] Route `/admin` diredirect ke `/` jika role tidak sesuai
- [ ] Google OAuth flow berfungsi (redirect → callback → login)

---

## ✅ SECTION 4 — LANDING PAGE

**Tujuan:** Landing page single-scroll bergaya immersive sesuai spesifikasi PRD.

**Yang harus dikerjakan:**
1. Buat `LandingLayout.tsx` — wrapper Navbar + {children} + Footer
2. Buat semua komponen landing (lihat tabel Komponen Landing Page di atas)
3. **Navbar** — transparan default → putih solid setelah scroll > 80px, mobile drawer (shadcn/ui Sheet)
4. **Hero** — split-screen, headline Poppins 700 52px, 2 CTA, ilustrasi SVG flat (bukan foto)
5. **Stats** — 4 kolom, bg `#F0FAF6`
6. **Features** — grid 10 kartu, icon Lucide 32px green
7. **ProductShowcase** — data dari `GET /api/products/top-selling?limit=8` (endpoint publik)
8. **HowItWorks** — 2 tab toggle (Pelanggan / Admin & Kasir)
9. **Testimonial** — Embla Carousel, bg `#1A1A1A`
10. **FAQ** — shadcn/ui Accordion
11. **Footer** — 4 kolom, bg `#1A1A1A`

**Prompt untuk AI:**
```
@workspace Kerjakan Section 4: Landing Page EWWON COCO dengan Inertia.js + React.
Single-page scroll: Navbar (transparan→solid saat scroll), Hero (split-screen + SVG ilustrasi),
Stats (4 kolom bg #F0FAF6), Features (grid 10 kartu icon Lucide), ProductShowcase (data API),
HowItWorks (2 tab toggle), Testimonial (Embla Carousel bg #1A1A1A), FAQ (shadcn Accordion),
Footer (4 kolom bg #1A1A1A). Design system: #00C48C/#FF8A00/#FFFFFF, Poppins+Inter,
TANPA gradient, TANPA glassmorphism.
```

**Selesai jika:**
- [ ] Navbar berubah dari transparan ke putih solid saat scroll
- [ ] Hero section: headline + 2 CTA + ilustrasi SVG
- [ ] Semua 10 fitur tampil di Features section
- [ ] ProductShowcase mengambil data real dari API
- [ ] Testimonial carousel berfungsi
- [ ] Mobile responsive (hamburger menu berfungsi)
- [ ] Tidak ada gradient di mana pun

---

## ✅ SECTION 5 — CUSTOMER APP (ONLINE ORDERING)

**Tujuan:** Fitur pemesanan online lengkap untuk customer.

**Yang harus dikerjakan:**
1. `Pages/Customer/Shop.tsx` — browse produk + filter kategori + search
2. `Pages/Customer/MerchantDetail.tsx` — halaman toko + daftar produk
3. Cart state management (React state / Inertia shared data)
4. `Components/Customer/CartDrawer.tsx` — slide-out cart
5. `Pages/Customer/Cart.tsx` — keranjang + input voucher
6. `Pages/Customer/Checkout.tsx`:
   - Form alamat pengiriman + Google Maps picker
   - Pilih kurir: GoSend atau GrabExpress (estimasi ongkir dari `DeliveryService`)
   - Pilih pembayaran: QRIS Statis (tampilkan gambar QR dari DB) atau Tunai
7. `Pages/Customer/Orders.tsx` — riwayat pesanan
8. `Pages/Customer/OrderDetail.tsx` — detail + real-time tracking via Reverb
9. `Pages/Customer/Loyalty.tsx` — poin reward

**Controller & Routes (web.php):**
```php
// routes/web.php
Route::middleware('auth')->prefix('')->group(function () {
    Route::get('/shop', [CustomerController::class, 'shop']);
    Route::get('/shop/{slug}', [CustomerController::class, 'merchant']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/checkout', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/loyalty', [LoyaltyController::class, 'index']);
});
```

**Prompt untuk AI:**
```
@workspace Kerjakan Section 5: Customer online ordering EWWON COCO dengan Inertia.js.
Buat halaman Shop (browse + filter), MerchantDetail, CartDrawer, Cart (+ voucher input),
Checkout (pilih GoSend/GrabExpress estimasi ongkir, pilih QRIS/Tunai — tampilkan gambar QR
saat QRIS dipilih), Orders, OrderDetail, dan Loyalty. Gunakan Eloquent + Inertia props
untuk data passing. Design sesuai system brand.
```

**Selesai jika:**
- [ ] Customer bisa browse produk dan tambah ke cart
- [ ] Estimasi ongkir GoSend/Grab muncul di checkout
- [ ] Gambar QR merchant muncul saat QRIS dipilih
- [ ] Pesanan tersimpan di DB dengan status `pending`
- [ ] Riwayat pesanan menampilkan semua order customer

---

## ✅ SECTION 6 — REAL-TIME ORDER TRACKING (LARAVEL REVERB)

**Tujuan:** Live update status pesanan dan posisi driver via Laravel Reverb WebSocket.

**Yang harus dikerjakan:**
1. Buat Events: `OrderStatusUpdated`, `DriverLocationUpdated`
2. Setup channel authorization di `routes/channels.php`
3. Broadcast events dari `OrderController` dan `DeliveryService`
4. Setup Laravel Echo di `resources/js/bootstrap.ts`
5. `Components/Shared/TrackingMap.tsx` — Google Maps + marker customer + driver
6. Update `Pages/Customer/OrderDetail.tsx` dengan Echo listener
7. Webhook endpoint di `routes/api.php` untuk menerima update dari GoSend/Grab

**Prompt untuk AI:**
```
@workspace Kerjakan Section 6: Real-time tracking EWWON COCO dengan Laravel Reverb.
Buat Events OrderStatusUpdated dan DriverLocationUpdated (implements ShouldBroadcast).
Setup channel authorization di channels.php. Setup Laravel Echo di bootstrap.ts.
Buat TrackingMap.tsx dengan Google Maps API menampilkan marker posisi customer dan driver.
Integrasikan di halaman OrderDetail. Tambahkan webhook endpoint untuk GoSend dan Grab
di routes/api.php.
```

**Selesai jika:**
- [ ] Laravel Reverb berjalan (`php artisan reverb:start`)
- [ ] Customer bisa lihat update status order real-time tanpa refresh
- [ ] Peta menampilkan posisi driver yang bergerak
- [ ] Webhook GoSend/Grab mengupdate DB + broadcast event

---

## ✅ SECTION 7 — ADMIN / OWNER DASHBOARD

**Tujuan:** Panel pengelolaan toko untuk Admin/Owner.

**Yang harus dikerjakan:**
1. `Layouts/AdminLayout.tsx` — sidebar navigasi + main content
2. `Pages/Admin/Dashboard.tsx` — stat cards + tabel pesanan masuk + grafik Recharts
3. `Pages/Admin/Orders.tsx` — semua pesanan + filter + konfirmasi/tolak
4. `Pages/Admin/Products.tsx` + `Create.tsx` + `Edit.tsx` — CRUD produk
5. `Pages/Admin/Inventory.tsx` — monitoring stok (merah jika <= min_stock)
6. `Pages/Admin/Analytics.tsx` — grafik penjualan + produk terlaris
7. `Pages/Admin/Vouchers.tsx` — CRUD kode promo
8. `Pages/Admin/Settings.tsx` — upload QRIS (drag & drop), jam operasional, profil toko

**Prompt untuk AI:**
```
@workspace Kerjakan Section 7: Admin Dashboard EWWON COCO dengan Inertia.js + React.
Buat AdminLayout dengan sidebar (#1A1A1A), halaman Dashboard (stat cards + tabel pesanan
+ grafik Recharts 7 hari), halaman Products CRUD (dengan upload gambar), halaman Inventory
(highlight stok menipis merah), halaman Analytics, halaman Vouchers CRUD, dan halaman
Settings dengan upload QRIS (drag & drop + preview). Semua route middleware auth + role:admin.
```

**Selesai jika:**
- [ ] Admin bisa login dan melihat dashboard dengan data real
- [ ] Admin bisa konfirmasi/tolak pesanan masuk
- [ ] CRUD produk berfungsi dengan upload gambar
- [ ] Upload QRIS berfungsi (validasi PNG/JPG, maks 2MB, simpan ke storage)
- [ ] Stok menipis ditandai merah

---

## ✅ SECTION 8 — POS SYSTEM (WEB-BASED KASIR)

**Tujuan:** Sistem kasir digital berbasis web untuk staff kasir. Full online.

**Yang harus dikerjakan:**
1. `Pages/POS/Screen.tsx` — layout full-screen dua kolom:
   - **Kiri:** Grid produk + search + filter kategori + barcode input
   - **Kanan:** Keranjang kasir (item, qty, subtotal, total, kembalian)
2. `Components/POS/ProductGrid.tsx`
3. `Components/POS/CartPanel.tsx`
4. `Components/POS/PaymentModal.tsx`:
   - Tunai: input nominal, hitung kembalian otomatis
   - QRIS: tampilkan gambar QR statis merchant
5. `Components/POS/ReceiptModal.tsx` — struk digital print-ready
6. `Components/POS/BarcodeInput.tsx` — input barcode scan/manual
7. `Pages/POS/Shifts.tsx` — buka/tutup shift kasir
8. `Pages/POS/Transactions.tsx` — riwayat transaksi kasir

**Prompt untuk AI:**
```
@workspace Kerjakan Section 8: POS System web-based EWWON COCO dengan Inertia.js.
Layout full-screen dua kolom: kiri ProductGrid (search + filter + barcode input),
kanan CartPanel (item list, qty control, total, kembalian). PaymentModal: Tunai
(hitung kembalian otomatis) + QRIS (tampilkan gambar QR statis dari DB).
ReceiptModal print-ready. Semua route middleware auth + role:kasir.
Design: background abu muda, panel putih bersih, aksen hijau/orange.
```

**Selesai jika:**
- [ ] Kasir bisa search produk dengan nama atau barcode
- [ ] Pembayaran Tunai: kalkulasi kembalian otomatis
- [ ] Pembayaran QRIS: gambar QR merchant tampil di modal
- [ ] Transaksi tersimpan di `pos_transactions`
- [ ] Struk bisa diprint dari browser

---

## ✅ SECTION 9 — SUPER ADMIN PANEL

**Tujuan:** Panel kontrol global untuk Super Admin.

**Yang harus dikerjakan:**
1. `Pages/SuperAdmin/Dashboard.tsx` — stat global semua cabang
2. `Pages/SuperAdmin/Users.tsx` — tabel semua user, ubah role, toggle aktif
3. `Pages/SuperAdmin/Merchants.tsx` — tabel semua merchant, toggle aktif
4. `Pages/SuperAdmin/Branches.tsx` — CRUD cabang semua merchant
5. `Pages/SuperAdmin/Analytics.tsx` — grafik per merchant/cabang/periode

**Prompt untuk AI:**
```
@workspace Kerjakan Section 9: Super Admin Panel EWWON COCO dengan Inertia.js.
Buat dashboard global stat semua cabang, halaman Users (tabel + ubah role + toggle aktif),
halaman Merchants (toggle aktif/nonaktif), halaman Branches CRUD, dan halaman Analytics
global multi-cabang. Semua route middleware auth + role:super_admin.
```

**Selesai jika:**
- [ ] Super admin bisa lihat stat global semua cabang
- [ ] Bisa ubah role user dan nonaktifkan akun
- [ ] Bisa toggle aktif/nonaktif merchant
- [ ] Grafik analytics per merchant berfungsi

---

## ✅ SECTION 10 — DELIVERY INTEGRATION (GoSend & GrabExpress)

**Tujuan:** Integrasi nyata dengan GoSend API dan GrabExpress API via DeliveryService.

**Yang harus dikerjakan:**
1. `app/Services/DeliveryService.php` — unified delivery interface:
   - `getQuote(provider, pickup, dropoff)` → estimasi harga + waktu
   - `requestPickup(order, provider)` → buat request pengiriman
   - `getStatus(deliveryRequest)` → cek status
2. Integrasi di `OrderController` — dispatch `RequestDeliveryJob` setelah order dikonfirmasi
3. Webhook endpoint `routes/api.php`:
   - `POST /api/webhooks/gosend`
   - `POST /api/webhooks/grabexpress`
4. Update `delivery_requests` dan broadcast `DriverLocationUpdated` event

**Prompt untuk AI:**
```
@workspace Kerjakan Section 10: Integrasi GoSend dan GrabExpress API untuk EWWON COCO.
Buat app/Services/DeliveryService.php dengan method getQuote, requestPickup, getStatus
menggunakan env GOSEND_CLIENT_ID/SECRET dan GRAB_CLIENT_ID/SECRET. Buat RequestDeliveryJob.
Setup webhook endpoint di routes/api.php yang menerima update driver, memperbarui
delivery_requests di DB, dan broadcast DriverLocationUpdated via Reverb.
```

**Selesai jika:**
- [ ] Estimasi ongkir GoSend/Grab muncul di halaman checkout
- [ ] Request driver berhasil ke API setelah order dikonfirmasi
- [ ] `delivery_requests` tersimpan dengan `provider_order_id`
- [ ] Webhook update posisi driver real-time di peta customer

---

## ✅ SECTION 11 — INVENTORY & NOTIFICATIONS

**Tujuan:** Auto-decrement stok dan sistem notifikasi push via FCM.

**Yang harus dikerjakan:**
1. Auto-decrement stok saat order dikonfirmasi (dalam DB transaction)
2. Auto-decrement stok saat POS transaction selesai
3. `app/Services/FCMService.php` — kirim push notification via FCM HTTP v1 API
4. `SendFCMJob` — notif stok menipis ke admin, notif status pesanan ke customer
5. Notifikasi in-app di tabel `notifications`
6. `Components/Shared/NotifBell.tsx` — bell icon + unread count di navbar admin

**Prompt untuk AI:**
```
@workspace Kerjakan Section 11: Inventory dan FCM notifications EWWON COCO.
Auto-decrement stok dalam DB transaction saat order dikonfirmasi dan POS transaction
selesai. Buat app/Services/FCMService.php menggunakan FCM HTTP v1 API (bukan legacy).
Kirim notif stok menipis ke admin saat stock <= min_stock. Kirim notif status pesanan
ke customer. Buat NotifBell.tsx dengan unread count.
```

**Selesai jika:**
- [ ] Stok berkurang otomatis saat order dikonfirmasi
- [ ] Push notification muncul saat stok menipis
- [ ] Customer terima push notif di setiap perubahan status pesanan
- [ ] NotifBell menampilkan unread count yang akurat

---

## ✅ SECTION 12 — LOYALTY, VOUCHER & REVIEW

**Tujuan:** Sistem poin reward, voucher, dan ulasan customer.

**Yang harus dikerjakan:**
1. Auto-tambah poin saat pesanan selesai (1 poin per Rp 1.000) via `LoyaltyService`
2. `Pages/Customer/Loyalty.tsx` — total poin + riwayat
3. Redeem poin di checkout (kurangi dari total)
4. `Components/Customer/VoucherInput.tsx` — input + validasi voucher (debounce)
5. `Components/Customer/ReviewModal.tsx` — bintang + komentar setelah pesanan selesai

**Prompt untuk AI:**
```
@workspace Kerjakan Section 12: Loyalty, voucher, dan review system EWWON COCO.
Auto-tambah poin (1 poin per Rp 1.000) via LoyaltyService saat order delivered.
Buat halaman Loyalty customer. Buat VoucherInput dengan validasi real-time (debounce 500ms).
Buat ReviewModal dengan star rating yang muncul setelah pesanan delivered.
Gunakan Inertia.js untuk form submissions.
```

**Selesai jika:**
- [ ] Poin bertambah otomatis setelah order delivered
- [ ] Poin bisa diredeem saat checkout
- [ ] Voucher bisa divalidasi dan diskon teraplikasi
- [ ] Review bisa disubmit setelah pesanan selesai

---

## ✅ SECTION 13 — TESTING & QUALITY ASSURANCE

**Tujuan:** Pastikan semua fitur berjalan benar sebelum production.

**Yang harus dikerjakan:**
1. Unit test dengan PHPUnit:
   - `Format::rupiah()`, `Format::tanggal()`
   - `LoyaltyService` — kalkulasi poin
   - `DeliveryService` — quote calculation
2. Feature test untuk HTTP flow:
   - Auth: register → request OTP → verify → session aktif
   - Order: buat pesanan → konfirmasi → update status
   - POS: scan produk → bayar → simpan transaksi
3. Frontend test dengan Vitest untuk format helpers TypeScript

**Prompt untuk AI:**
```
@workspace Kerjakan Section 13: Testing EWWON COCO. Buat PHPUnit tests untuk
app/Helpers/Format.php, LoyaltyService, dan DeliveryService. Buat Feature tests
untuk auth flow (register→OTP→verify), order flow (buat→konfirmasi→update status),
dan POS transaction flow. Buat Vitest tests untuk resources/js/lib/format.ts.
```

**Selesai jika:**
- [ ] `php artisan test` semua pass
- [ ] Feature test auth flow pass
- [ ] Feature test order flow pass
- [ ] Tidak ada TypeScript error (`npm run typecheck`)

---

## ✅ SECTION 14 — PRODUCTION DEPLOYMENT (SHARED HOSTING)

**Tujuan:** Deploy ke shared hosting PHP dengan konfigurasi production yang benar.

**Yang harus dikerjakan:**
1. Verifikasi semua langkah deploy (lihat bagian Deployment di atas)
2. Setup Cron Job di cPanel untuk Laravel Scheduler
3. Konfigurasi `.htaccess` untuk symlink `public_html → public/`
4. Setup SSL via cPanel AutoSSL
5. Aktifkan rate limiting di `app/Http/Kernel.php` untuk route auth + order
6. Run security checklist production:
   - `APP_DEBUG=false`
   - `APP_ENV=production`
   - Semua cache di-generate
   - File `.env` tidak bisa diakses via browser

**Prompt untuk AI:**
```
@workspace Kerjakan Section 14: Production deployment EWWON COCO ke shared hosting.
Buat panduan lengkap: setup symlink public_html → public/, jalankan composer install
--no-dev, npm run build, php artisan optimize. Konfigurasi .htaccess yang benar.
Setup Cron Job cPanel untuk php artisan schedule:run. Buat production checklist
(APP_DEBUG=false, rate limiting, semua secret di .env).
```

**Selesai jika:**
- [ ] Site bisa diakses via HTTPS tanpa error
- [ ] `APP_DEBUG=false` aktif
- [ ] Cron Job berjalan setiap menit
- [ ] Rate limiting aktif di endpoint auth + checkout
- [ ] Tidak ada credential hardcode di source code
- [ ] Laravel Reverb atau Pusher fallback berfungsi untuk realtime

---

## 💡 CARA GUNAKAN FILE INI DENGAN COPILOT / CLAUDE / CURSOR

File ini otomatis dibaca GitHub Copilot di VS Code.
Untuk Claude AI atau Cursor: paste konten file ini sebagai konteks awal sesi.

### Template prompt per section:
```
@workspace Saya sedang mengerjakan [NAMA SECTION] dari project EWWON COCO
sesuai copilot-instructions.md. [DESKRIPSI SPESIFIK YANG INGIN DIBUAT].
Pastikan menggunakan:
- Stack: Laravel 11 + PHP 8.3 + React + Inertia.js (BUKAN Next.js)
- Auth: Laravel Sanctum session (BUKAN JWT)
- Realtime: Laravel Reverb (BUKAN Socket.io)
- Deployment: Shared hosting (BUKAN VPS/Docker)
- Design system: #00C48C/#FF8A00, Poppins+Inter, no gradient, shadcn/ui
```

### Prompt debugging:
```
@workspace Di EWWON COCO Section [X], saya mengalami error: [ERROR MESSAGE].
File yang bermasalah: [NAMA FILE]. Tolong bantu debug sesuai konteks project ini
(Laravel 11 + Inertia.js + shared hosting).
```

### Prompt code review:
```
@workspace Review kode berikut dari EWWON COCO untuk memastikan sudah sesuai
dengan instruksi project (stack Laravel+Inertia, keamanan Sanctum, design system,
kompatibel shared hosting):
[PASTE KODE]
```

---

*EWWON COCO — Digital Commerce Ecosystem*
*File ini di-maintain di: .github/copilot-instructions.md*
*Versi: 3.1 (Shared Hosting Edition — Laravel 11 + React + Inertia.js)*
*Disesuaikan dengan PRD v3.1*
