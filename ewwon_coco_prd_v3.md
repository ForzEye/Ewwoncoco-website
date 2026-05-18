# EWWON COCO — PRD (Project Requirements Document)

**Digital Commerce Ecosystem**
*Satu Platform. Kelola Semua Operasional.*

**Versi 3.1 — Shared Hosting Edition**
Stack: Laravel 11 · PHP 8.3 · React · Inertia.js · MySQL 8

---

## 1. Overview

EWWON COCO adalah sistem digital commerce yang dibangun dan digunakan secara internal untuk operasional bisnis sendiri — bukan produk SaaS yang diperjualbelikan ke pihak lain. Platform ini menggabungkan pengalaman pemesanan online dan transaksi POS berbasis web dalam satu ekosistem terintegrasi yang sepenuhnya dikelola oleh tim internal.

Masalah utama yang ingin diselesaikan adalah fragmentasi antara sistem penjualan online dengan sistem kasir (POS), yang membuat pengelolaan operasional bisnis menjadi tidak terpusat dan tidak efisien.

Tujuan utama platform ini adalah menyediakan Super App berbasis web yang memungkinkan tim internal mengelola penjualan online, transaksi POS, manajemen inventaris, pengiriman, dan analitik bisnis dalam satu dasbor terpadu — sekaligus memberikan pengalaman pemesanan yang mulus bagi pelanggan.

> ℹ️ Platform ini dikembangkan untuk keperluan internal bisnis sendiri. Tidak ada model berlangganan, tidak ada penjualan lisensi ke pihak luar, dan tidak ada onboarding merchant eksternal. Seluruh akses dan pengelolaan dilakukan oleh tim internal. Platform berjalan full online melalui web browser.

### Pengguna Sistem

- **Owner/Admin Bisnis** — mengelola seluruh operasional, produk, cabang, dan laporan
- **Admin Sistem** — mengelola konfigurasi teknis dan akses pengguna
- **Pelanggan (Customer)** — memesan produk secara online
- **Kasir (Staff POS)** — memproses transaksi di toko via web browser

> ℹ️ Pengiriman tidak menggunakan driver internal. Pengiriman sepenuhnya dilakukan melalui integrasi dengan GoSend (Gojek) dan GrabExpress (Grab).

---

## 2. Requirements

- **Aksesibilitas** — Platform dapat diakses melalui web browser (desktop & mobile). Full online — tidak ada mode offline.
- **Desain** — Antarmuka menggunakan style modern minimalis dan clean. Warna utama: Putih, Hijau (#00C48C), Orange (#FF8A00) — tanpa gradient. Tidak ada glassmorphism.
- **Performa** — Mendukung real-time order updates, live tracking, dan notifikasi push via Laravel Reverb (WebSocket).
- **Skalabilitas** — Mampu menangani multi-cabang dan volume transaksi tinggi.
- **Keamanan** — Autentikasi aman dengan OTP via Email (Laravel Mail), enkripsi data, dan manajemen role/akses via Laravel Sanctum.
- **Bahasa UI** — Mendukung multi-bahasa (Bahasa Indonesia & Inggris) via Laravel Localization.
- **Mode Tampilan** — Mendukung Dark Mode dan Light Mode.
- **Deployment** — Berjalan penuh di shared hosting PHP (Niagahoster / Hostinger) tanpa VPS atau Docker.

---

## 3. Stack Teknologi (Shared Hosting Edition)

Stack dipilih secara khusus agar dapat berjalan di shared hosting PHP biasa tanpa memerlukan VPS, Docker, atau Node.js persistent process.

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

### Mengapa Stack Ini?

- Berjalan penuh di shared hosting PHP biasa (tanpa VPS/Docker)
- MySQL sudah termasuk di semua paket shared hosting
- Deploy via FTP + composer install + npm build — tidak perlu CI/CD kompleks
- Biaya infra Rp 50–150 rb/bulan vs Rp 300–700 rb/bulan (VPS)
- Laravel Reverb = WebSocket realtime tanpa Node.js server terpisah

---

## 4. Core Features

- **Online Ordering System** — Pemesanan produk online lengkap dengan listing toko, filter kategori, dan keranjang belanja.
- **Web-based POS Cashier** — Sistem kasir digital berbasis web dengan barcode scanning, manajemen meja, integrasi QRIS statis (upload gambar QR), dan cetak struk. Berjalan full online.
- **Real-time Order Tracking** — Pelacakan status pesanan dan posisi driver secara langsung di peta via Laravel Reverb WebSocket.
- **Multi-Branch Management** — Pengelolaan beberapa cabang bisnis dalam satu akun admin internal.
- **QRIS Static Payment** — Pembayaran via QRIS statis (merchant upload gambar QR code) atau tunai. Tidak menggunakan payment gateway.
- **Third-Party Delivery Integration** — Integrasi langsung dengan GoSend (Gojek) dan GrabExpress (Grab).
- **Sales Analytics** — Dasbor analitik penjualan, produk terlaris, dan performa merchant.
- **Inventory Management** — Pencatatan stok produk dan notifikasi stok menipis.
- **Customer Loyalty System** — Program poin reward dan membership pelanggan.
- **Promo & Voucher Engine** — Pembuatan dan pengelolaan kode promo, diskon, dan banner iklan.

---

## 5. User Flow

### 5.1 Alur Pelanggan (Customer)

- **Registrasi/Login** — Pelanggan mendaftar menggunakan email, nomor HP, atau akun Google (via Laravel Socialite).
- **Jelajahi Toko** — Pelanggan mencari toko/produk melalui filter kategori atau search bar.
- **Tambah ke Keranjang** — Pelanggan memilih produk dan menyesuaikan jumlah/opsi.
- **Checkout** — Pelanggan memilih metode pembayaran (QRIS statis atau Tunai), memilih layanan pengiriman (GoSend atau GrabExpress), lalu konfirmasi pesanan.
- **Tracking Pesanan** — Sistem otomatis request driver ke Gojek/Grab. Pelanggan memantau status pesanan real-time via Laravel Reverb WebSocket.
- **Ulasan & Reward** — Setelah pesanan selesai, pelanggan memberikan ulasan dan mendapatkan poin reward.

### 5.2 Alur Pengelola/Admin Internal

- **Login** — Pengelola masuk ke dasbor menggunakan akun internal (Laravel Sanctum session).
- **Setup Toko/Cabang** — Pengelola mengatur profil toko, jam operasional, zona pengiriman, dan upload gambar QRIS.
- **Manajemen Produk** — Pengelola menambah, mengedit, atau menonaktifkan produk beserta harga dan stok.
- **Terima Pesanan** — Pengelola menerima notifikasi pesanan masuk (FCM + WebSocket) dan mengkonfirmasi atau menolak.
- **Proses & Request Kurir** — Sistem request driver pickup melalui GoSend atau GrabExpress via DeliveryService.
- **Konfirmasi Pembayaran** — Untuk pesanan QRIS, pengelola mengkonfirmasi pembayaran secara manual.
- **Laporan** — Pengelola memantau penjualan melalui dasbor analitik.

### 5.3 Alur Transaksi POS (Web-based)

- **Login Kasir** — Staff masuk ke sistem POS via web browser menggunakan akun kasir (role: kasir).
- **Input Produk** — Kasir scan barcode atau cari produk secara manual.
- **Pilih Pembayaran** — Kasir memilih metode pembayaran: Tunai atau QRIS (tampilkan gambar QR statis merchant).
- **Proses Transaksi** — Sistem memproses pembayaran dan cetak struk.
- **Sinkronisasi Real-time** — Data transaksi langsung tersinkronisasi ke MySQL karena berjalan full online.

---

## 6. Database Schema

Database utama: MySQL 8 (dikelola via phpMyAdmin — bawaan cPanel).

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Data semua pengguna platform (role: super_admin, admin, kasir, customer) |
| `otp_codes` | Kode OTP login/register via email (expires 5 menit) |
| `merchants` | Profil dan konfigurasi toko beserta gambar QRIS statis |
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

---

## 7. Pages & UI Structure

Semua halaman dirender via Inertia.js (SSR-ready) menggunakan React + shadcn/ui. Route dikelola oleh Laravel (`routes/web.php`) dengan middleware `auth` dan `role`.

| No | Halaman | Deskripsi | Role Akses |
|----|---------|-----------|------------|
| 1 | Home / Landing Page | Halaman utama publik — Navbar transparan, Hero full-width, Stats, Features, Produk Terlaris, How It Works, Testimonial, FAQ, Footer lengkap | Public |
| 2 | Login / Register | Autentikasi via email/OTP/Google OAuth (Socialite) | Public |
| 3 | Customer App | Pemesanan online, keranjang, checkout, tracking real-time, riwayat, loyalty | Customer |
| 4 | Admin Dashboard | Dasbor utama pengelola — analitik, pesanan, produk, upload QRIS, cabang | Admin |
| 5 | POS Screen | Layar kasir digital — input produk, pembayaran, cetak struk, shift | Kasir |
| 6 | Super Admin | Dasbor super admin — manajemen seluruh sistem, merchant, user | Super Admin |

### 7.1 Landing Page — Struktur Lengkap

Landing page adalah wajah publik EWWON COCO. Satu halaman panjang (single-page scroll) bergaya immersive seperti Ballerina Farm — full-width imagery, storytelling lewat scroll, section yang mengalir natural. Menggunakan warna brand solid (White, Green, Orange), tanpa gradient, tanpa glassmorphism.

#### Urutan Section (Scroll dari atas ke bawah)

| Urutan | Section | Background | Keterangan Singkat |
|--------|---------|-----------|-------------------|
| — | Navbar | Transparan → Putih | Berubah saat scroll |
| 1 | Hero | Putih (#FFFFFF) | Full-width, headline besar, CTA, visual kanan |
| 2 | Stats / Social Proof | Light Green (#F0FAF6) | Angka kunci bisnis |
| 3 | Features | Putih (#FFFFFF) | Grid 10 kartu fitur, alternating layout |
| 4 | Produk Terlaris | Light Green (#F0FAF6) | Showcase produk dengan card + CTA pesan |
| 5 | How It Works | Putih (#FFFFFF) | Langkah-langkah bernomor, dua tab user |
| 6 | Testimonial | Charcoal (#1A1A1A) | Gelap dramatis, carousel ulasan, bintang orange |
| 7 | FAQ | Putih (#FFFFFF) | Accordion shadcn/ui, 6–8 pertanyaan |
| 8 | Footer | Charcoal (#1A1A1A) | 3–4 kolom, link navigasi, sosial media, copyright |

#### Navbar — Transparent to Solid

- Default: background transparan, teks putih — menyatu dengan hero section
- Setelah scroll > 80px: background putih solid + shadow-sm + teks charcoal
- Transisi smooth 300ms dengan CSS transition
- Kiri: Logo EWWON COCO (Poppins 700, warna adaptif: putih di atas hero, hijau setelah scroll)
- Tengah: Menu anchor — Fitur, Produk, Cara Kerja, Testimoni, FAQ
- Kanan: Tombol "Login" (outline adaptif) + "Mulai Sekarang" (solid green, selalu)
- Mobile: Hamburger icon → full-screen drawer (shadcn/ui Sheet) dengan menu vertikal

#### Section 1 — Hero

- Layout split-screen: teks di kiri (60%) + visual di kanan (40%)
- Background: putih bersih dengan sedikit blob dekoratif berbentuk organik warna light green (no gradient — solid shape)
- Headline: Poppins 700, 52px — contoh: "Satu Platform.\nKelola Semua Operasional Bisnis."
- Subheadline: Inter 400, 18px, gray — deskripsi 2 baris, max 120 karakter
- Dua CTA: "Mulai Sekarang" (solid green, rounded-md) + "Lihat Cara Kerja" (ghost/outline)
- Visual kanan: ilustrasi flat dashboard mockup atau isometrik produk — SVG, BUKAN foto
- Animasi: teks fade-in + slide-up (delay 0.1s) saat load — via CSS animation atau Framer Motion
- Di bawah CTA: badge kecil social proof — "Digunakan oleh 10+ cabang bisnis" dengan ikon Lucide CheckCircle

#### Section 2 — Stats / Social Proof

- Background: Light Green (#F0FAF6) — jeda visual dari hero putih
- 4 kolom horizontal: angka besar Poppins 700 warna green + label Inter abu di bawahnya
- Contoh data: "10+ Cabang", "500+ Produk Aktif", "1.200+ Transaksi/Hari", "99.9% Uptime"
- Separator vertikal tipis (#E5E7EB) antar kolom di desktop — hilang di mobile jadi 2x2 grid

#### Section 3 — Features

- Heading centered: "Semua yang Kamu Butuhkan, dalam Satu Platform"
- Sub-heading: Inter, gray, max 80 karakter
- Layout: grid 3 kolom (desktop) / 2 kolom (tablet) / 1 kolom (mobile)
- 10 kartu fitur — setiap kartu: ikon Lucide (green, 32px) + judul Poppins 600 + deskripsi Inter 2 baris
- Kartu: background putih, border #E5E7EB, rounded-lg, shadow-sm, hover: shadow-md + border green
- Urutan fitur: Online Ordering, POS, Real-time Tracking, Multi-Cabang, QRIS Payment, Delivery Integration, Analytics, Inventory, Loyalty, Promo & Voucher

#### Section 4 — Produk Terlaris (Ballerina Farm-style Showcase)

- Heading: "Produk Pilihan Terlaris"
- Sub-heading: Inter gray — "Pesan langsung dari platform kami"
- Background: Light Green (#F0FAF6)
- Layout: horizontal scroll carousel di mobile / grid 4 kolom di desktop
- Setiap product card: foto produk (aspect-ratio square, rounded-lg) + nama produk + harga (format Rp) + badge kategori (orange) + tombol "Pesan" (solid green, ukuran sm)
- Maksimal 8 produk ditampilkan — diambil dinamis dari API berdasarkan sales count
- Di bawah grid: tombol "Lihat Semua Produk" (outline green, centered) → redirect ke halaman ordering
- Kartu hover: scale-105 + shadow-md (transition 200ms)

#### Section 5 — How It Works

- Background: putih — kontras bersih setelah hijau muda
- Heading centered: "Cara Kerja EWWON COCO"
- Dua tab toggle: "Untuk Pelanggan" | "Untuk Admin & Kasir" — tab pill style, active: green solid
- Konten per tab: langkah vertikal bernomor (1–5) dengan ikon Lucide, judul bold, deskripsi pendek
- Connector antar step: garis vertikal putus-putus warna green, left-aligned dengan nomor
- Tab Pelanggan: Daftar → Pilih Produk → Checkout → Bayar QRIS/Tunai → Terima Pesanan
- Tab Admin: Login → Setup Toko → Tambah Produk → Terima Pesanan → Pantau Laporan

#### Section 6 — Testimonial

- Background: Charcoal (#1A1A1A) — gelap dramatis, berbeda dari section lain
- Teks heading dan konten: putih (#FFFFFF)
- Heading: "Apa Kata Pengguna Kami"
- Layout: carousel auto-scroll dengan Embla Carousel — 3 kartu terlihat di desktop, 1 di mobile
- Setiap kartu: background #2A2A2A (charcoal lebih terang), rounded-lg, padding besar
- Isi kartu: bintang rating (Lucide Star, orange #FF8A00) + kutipan teks + avatar initial + nama + peran
- Navigasi carousel: tombol panah kiri/kanan + dot indicator di bawah

#### Section 7 — FAQ

- Background: putih — kembali terang setelah testimonial gelap
- Layout: dua kolom di desktop (heading kiri sticky, accordion kanan) / satu kolom di mobile
- Komponen: shadcn/ui Accordion — satu item terbuka sekaligus
- 6–8 pertanyaan: seputar cara daftar, metode bayar, pengiriman, jangkauan, keamanan data, POS
- Teks pertanyaan: Poppins 600, 16px. Jawaban: Inter 400, 15px, gray

#### Footer — 4 Kolom

- Background: Charcoal (#1A1A1A), teks abu (#9CA3AF), link putih, hover green
- Kolom 1 (lebar): Logo + tagline + deskripsi platform 2 kalimat + ikon sosial media (Instagram, WhatsApp, TikTok via Lucide)
- Kolom 2: Navigasi — Beranda, Fitur, Produk, Cara Kerja, FAQ
- Kolom 3: Akses — Login, Daftar, Dashboard Admin, POS Kasir
- Kolom 4: Kontak — email, nomor WA, jam operasional
- Baris bawah: garis pemisah + copyright "© 2025 EWWON COCO. Hak cipta dilindungi."

#### Komponen React — Landing Page

| Komponen | File Path | Keterangan |
|----------|-----------|------------|
| LandingLayout | `Layouts/LandingLayout.tsx` | Wrapper: Navbar + {children} + Footer |
| Navbar | `Components/Landing/Navbar.tsx` | Transparan → solid saat scroll, mobile drawer |
| HeroSection | `Components/Landing/HeroSection.tsx` | Split-screen, headline, CTA, ilustrasi SVG |
| StatsSection | `Components/Landing/StatsSection.tsx` | 4 kolom angka kunci, bg light-green |
| FeaturesSection | `Components/Landing/FeaturesSection.tsx` | Grid 10 kartu fitur, hover effect |
| ProductShowcase | `Components/Landing/ProductShowcase.tsx` | Grid produk terlaris dari API, carousel mobile |
| HowItWorksSection | `Components/Landing/HowItWorksSection.tsx` | Tab toggle + step bernomor |
| TestimonialSection | `Components/Landing/TestimonialSection.tsx` | Embla Carousel, bg charcoal |
| FAQSection | `Components/Landing/FAQSection.tsx` | shadcn/ui Accordion, 2-kolom desktop |
| Footer | `Components/Landing/Footer.tsx` | 4 kolom, sosial media, copyright |

> ℹ️ ProductShowcase mengambil data real dari endpoint `GET /api/products/top-selling?limit=8` — tidak hard-coded. Data ini bersifat publik (tanpa auth) agar landing page bisa diakses siapa saja.

---

## 8. Design System

### 8.1 Brand Colors

| Token CSS | Hex | Penggunaan |
|-----------|-----|------------|
| `--color-primary` | #00C48C | Green — warna utama, CTA, tombol aktif |
| `--color-secondary` | #FF8A00 | Orange — aksen, badge, highlight |
| `--color-white` | #FFFFFF | Background utama |
| `--color-light-green` | #F0FAF6 | Background section, card alt |
| `--color-charcoal` | #1A1A1A | Teks utama, heading |
| `--color-gray` | #6B7280 | Teks sekunder, placeholder |
| `--color-border` | #E5E7EB | Border default komponen |
| `--color-gray-light` | #F5F5F5 | Background abu, hover state |

### 8.2 Typography

| Elemen | Font | Weight | Size | Keterangan |
|--------|------|--------|------|------------|
| H1 | Poppins | 700 | 48px (3rem) | Heading utama halaman |
| H2 | Poppins | 700 | 36px (2.25rem) | Heading section |
| H3 | Poppins | 600 | 24px (1.5rem) | Sub-section heading |
| H4 | Poppins | 600 | 18px (1.125rem) | Card title, label besar |
| Body | Inter | 400 | 16px (1rem) | Konten utama, line-height 1.7 |
| Small | Inter | 400 | 14px (0.875rem) | Teks pendukung |
| Caption | Inter | 500 | 12px (0.75rem) | Label kecil, badge |

### 8.3 Aturan Visual (WAJIB)

- **TIDAK ADA gradient** — semua warna solid flat
- **TIDAK ADA glassmorphism** — background harus solid
- **TIDAK ADA offline mode** — platform full online, termasuk POS
- Rounded corners: `rounded-lg` (12px) untuk card, `rounded-md` (8px) untuk input/button
- Icon library: Lucide React — konsisten dengan shadcn/ui. **JANGAN mix icon library.**
- Shadow: hanya `shadow-sm` / `shadow-md` untuk elevasi card — bukan dekoratif
- Ukuran font minimum: 12px — tidak ada teks lebih kecil dari ini

---

## 9. Role & Akses

| Role | Middleware Laravel | Route Prefix | Kemampuan |
|------|--------------------|--------------|-----------|
| `super_admin` | `auth`, `role:super_admin` | `/super-admin` | Akses penuh semua sistem, semua cabang, konfigurasi global |
| `admin` | `auth`, `role:admin` | `/admin` | Kelola produk, pesanan, laporan, upload QRIS, cabang sendiri |
| `kasir` | `auth`, `role:kasir` | `/pos` | Akses POS web, proses transaksi kasir, kelola shift |
| `customer` | `auth` | `/` | Pemesanan online, tracking, riwayat, poin loyalty |

---

## 10. Deployment — Shared Hosting

Platform dideploy ke shared hosting PHP (Niagahoster / Hostinger) melalui FTP/SSH + cPanel tanpa memerlukan VPS, Docker, atau CI/CD kompleks.

### 10.1 Langkah Deploy

```bash
# 1. Upload source code via Git atau FTP ke folder di luar public_html
# 2. Buat symlink: public_html → folder public Laravel
# 3. Install PHP dependencies
composer install --no-dev --optimize-autoloader

# 4. Setup environment
cp .env.example .env
php artisan key:generate

# 5. Jalankan migrasi
php artisan migrate --force

# 6. Build frontend via cPanel Node.js Selector atau SSH
npm install && npm run build

# 7. Storage symlink
php artisan storage:link

# 8. Cache untuk production
php artisan config:cache && php artisan route:cache && php artisan view:cache

# 9. Tambahkan Cron Job di cPanel untuk Laravel Scheduler
# * * * * * php /path/to/artisan schedule:run >> /dev/null 2>&1
```

### 10.2 Integrasi Eksternal

| Layanan | Provider | Keterangan |
|---------|----------|------------|
| Delivery | GoSend API (Gojek) + GrabExpress API (Grab) | Request pickup, tracking driver |
| Maps | Google Maps JavaScript API | Tampilan peta tracking real-time |
| Push Notification | Firebase Cloud Messaging (FCM) | Notifikasi pesanan ke customer & merchant |
| Email/OTP | SMTP (Gmail / Mailgun / Mailtrap) | Kirim kode OTP login/register |
| OAuth | Google OAuth via Laravel Socialite | Login dengan akun Google |
| Storage CDN | Cloudflare R2 (opsional) | CDN foto produk, gambar QRIS |
| WebSocket | Laravel Reverb / Pusher Free Tier (fallback) | Real-time order updates |

### 10.3 Security Checklist Production

- `APP_DEBUG=false` di .env
- `APP_ENV=production` di .env
- File `.env` tidak bisa diakses via browser (ada di luar public_html)
- `php artisan config:cache` sudah dijalankan
- SSL aktif (HTTPS) via cPanel AutoSSL
- Rate limiting aktif di route auth + order (gunakan Laravel RateLimiter)
- File upload divalidasi server-side (MIME type, ukuran max)
- Semua secret di environment variable, tidak hardcode di kode

---

## 11. Struktur Project (Directory)

| Folder/File | Keterangan |
|-------------|------------|
| `app/Http/Controllers/Auth/` | AuthController, OTPController |
| `app/Http/Controllers/Customer/` | OrderController, CartController, TrackingController |
| `app/Http/Controllers/Admin/` | DashboardController, ProductController, OrderMgmtController |
| `app/Http/Controllers/POS/` | POSController, ShiftController, TransactionController |
| `app/Http/Controllers/SuperAdmin/` | MerchantController, UserController |
| `app/Models/` | User, Order, Product, POSTransaction, Branch, dll. |
| `app/Events/` | OrderStatusUpdated, DriverLocationUpdated |
| `app/Jobs/` | SendOTPJob, RequestDeliveryJob, SendFCMJob |
| `app/Services/` | DeliveryService.php, FCMService.php, LoyaltyService.php |
| `app/Helpers/Format.php` | `rupiah()`, `tanggal()` — helper format harga & tanggal |
| `resources/js/Pages/Customer/` | Home, Shop, Cart, Checkout, Orders, Loyalty |
| `resources/js/Pages/Admin/` | Dashboard, Products, Orders, Analytics, Settings |
| `resources/js/Pages/POS/` | Screen, Shifts, Transactions |
| `resources/js/Pages/SuperAdmin/` | Dashboard, Merchants, Users |
| `resources/js/Components/ui/` | shadcn/ui components (button, card, input, dll.) |
| `resources/js/lib/format.ts` | `rupiah()`, `tanggal()` — format helper TypeScript |
| `resources/lang/id/` & `en/` | Terjemahan Bahasa Indonesia & Inggris |
| `routes/web.php` | Semua route Inertia (auth middleware + role) |
| `routes/api.php` | Webhook GoSend/Grab, FCM, integrasi eksternal |
| `routes/channels.php` | Authorization channel WebSocket (Reverb) |
| `public/build/` | Output Vite (js + css tercompile) |
| `.env` | Environment variables — **JANGAN commit ke Git** |

---

## 12. Catatan Teknis & Konvensi Kode

### 12.1 Format Harga & Tanggal

Selalu gunakan helper berikut — **JANGAN format manual**:

```php
// PHP
Format::rupiah($amount)  // → Rp 85.000
Format::tanggal($date)   // → 15 Januari 2025
```

```typescript
// TypeScript
rupiah(amount)   // → Rp 85.000
tanggal(date)    // → 15 Januari 2025
```

### 12.2 Responsive & Aksesibilitas

- Mobile-first design — breakpoint utama: 375px, 768px, 1024px, 1440px
- PWA-ready untuk instalasi di perangkat mobile
- Mendukung keyboard navigation dan screen reader (WCAG 2.1 AA)
- SEO-optimized dengan meta tags dan sitemap (via Inertia Head)

### 12.3 Realtime — Laravel Reverb

- **Primary:** Laravel Reverb (self-hosted WebSocket, berjalan via `php artisan reverb:start`)
- **Fallback:** Pusher Free Tier (jika hosting tidak support persistent process)
- **Client:** Laravel Echo + pusher-js di React (`resources/js/bootstrap.ts`)

### 12.4 Queue & Scheduler

- Queue driver: `database` (jobs disimpan di tabel MySQL `jobs`)
- Worker dijalankan via Cron Job cPanel: `php artisan schedule:run` setiap menit
- Jobs: `SendOTPJob`, `RequestDeliveryJob`, `SendFCMJob`

---

*EWWON COCO — Digital Commerce Ecosystem*
*Shared Hosting Edition — Laravel 11 + React + Inertia.js*
*PRD Versi 3.1*
