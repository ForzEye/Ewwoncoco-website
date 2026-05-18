# Handoff Dokumentasi: Ewwon Coco Super App

Dokumen ini merangkum seluruh pekerjaan pembangunan platform **Ewwon Coco** dari tahap awal hingga finalisasi fitur premium per **14 Mei 2026**.

## 🥥 Ringkasan Platform
Ewwon Coco adalah platform "Super App" untuk bisnis kelapa muda dan dessert yang menggabungkan:
1. **Online Ordering**: Pengalaman belanja ala Grab/Gojek bagi pelanggan.
2. **Internal POS**: Sistem kasir offline untuk outlet fisik.
3. **Merchant Management**: Dashboard lengkap untuk stok, pesanan, dan laporan.
4. **Marketing Tools**: Ekosistem loyalitas pelanggan (Referral, Poin, Cashback).
5. **Super Admin Control**: Kendali pusat untuk seluruh ekosistem dan branding sistem.

---

## 📝 Update Terbaru (16 Mei 2026)

Berikut adalah detail teknis pengerjaan yang baru saja diselesaikan untuk memperkuat keamanan dan transparansi sistem:

### 1. Spark AI Insights Engine (Gratis & Lokal)
- **Automated Business Intelligence**: Implementasi `InsightService` yang menganalisis tren penjualan, performa stok, dan efisiensi operasional secara otomatis tanpa biaya API eksternal.
- **Premium Insight UI**: Komponen `AIInsights.tsx` dengan desain *glassmorphism* dan animasi premium yang memberikan rekomendasi strategis bagi Merchant dan Super Admin.

### 2. Global Order Management (Super Admin)
- **Centralized Transaction Tracking**: Halaman baru `/super-admin/orders` yang memungkinkan Super Admin memantau seluruh transaksi online dari semua merchant dalam satu tampilan terpusat.
- **Real-time Stats**: Penambahan metrik "Pesanan Hari Ini" dan "Omzet Hari Ini" pada dashboard Super Admin untuk monitoring performa ekosistem secara instan.

### 3. Infrastruktur & Stabilitas Build
- **Vite Path Correction**: Migrasi dari alias `@/` ke path relatif (`../../`) pada seluruh modul Super Admin untuk menjamin stabilitas *production build* di lingkungan Windows/XAMPP.
- **Robust Auto-Login (Mobile)**: Perbaikan mekanisme `tryAutoLogin` pada aplikasi Flutter dengan implementasi *error handling* JSON yang mencegah aplikasi stuck di layar splash akibat data korup.
- **Dynamic App Branding API**: Perbaikan API `v1/settings` untuk mendukung pengiriman array gambar banner (Multiple Hero Images) langsung dari S3 ke aplikasi mobile secara dinamis.

---

## 📝 Update Terbaru (14 Mei 2026)

Berikut adalah detail teknis pengerjaan yang baru saja diselesaikan untuk memantapkan fungsionalitas sistem:

### 1. Optimasi & Otomasi POS (Point of Sale)
- **Otomasi Laporan Tutup Shift**: Sebelumnya kasir harus menginput semua total secara manual. Sekarang, sistem secara otomatis menghitung *Expected Sales* berdasarkan metode pembayaran (**Cash, QRIS, Online**) untuk akurasi data.
- **Support Multi-Channel Sales**: Penambahan field khusus untuk mencatat penjualan dari pihak ketiga (**Grab Food & Gojek Food**) pada proses tutup shift.
- **Enhanced Numeric Input**: Perbaikan UX pada input angka (Nominal Shift), di mana angka akan terpilih otomatis saat diklik dan memudahkan kasir untuk menghapus/mengedit tanpa terhambat nilai default "0".
- **Real-time Void Tracking**: Setiap pembatalan transaksi (Void) kini dihitung dan ditampilkan pada modal tutup shift untuk meningkatkan transparansi kerja kasir.
- **UI Cleaning**: Menghapus tampilan Pajak dan input Promo pada layar POS fisik untuk mempercepat alur kerja kasir (fitur promo dipusatkan pada pemesanan online).

### 2. Dashboard Super Admin (Pusat Kendali)
- **Dynamic CMS Branding**: Implementasi fitur untuk mengubah **Logo Situs, Favicon, Nama Situs, dan Meta SEO** secara langsung dari dashboard tanpa menyentuh kode file.
- **Manual User Creation**: Penambahan modul untuk membuat akun user baru (Super Admin, Admin Merchant, atau Kasir) secara manual, lengkap dengan validasi peran dan penugasan ke merchant tertentu.
- **Synchronized Global Analytics**: 
    - **Revenue AreaChart**: Visualisasi tren pendapatan 6 bulan terakhir yang sinkron antara POS dan Online.
    - **Payment PieChart**: Analisis perbandingan penggunaan metode pembayaran (Cash vs QRIS vs Transfer).
    - **Top Rankings**: List otomatis Merchant dengan omzet tertinggi dan Produk paling laris di seluruh ekosistem secara global.

### 3. Perbaikan Bug & Stabilitas (Hotfixes)
- **JSX Syntax Fixes**: Perbaikan struktur tag pada `Shifts.tsx` dan `Users.tsx` untuk mencegah error *blank page* akibat tag yang tidak tertutup sempurna.
- **Recursion Prevention**: Perbaikan konflik penamaan ikon dan komponen pada modul Settings yang sebelumnya menyebabkan *browser crash*.
- **API Error Handling**: Memperbaiki variabel `$request` yang hilang pada logika *Void* transaksi di backend.
- **Type Safety**: Menambahkan import type `Branch` pada komponen POS Screen untuk menghilangkan error TypeScript.

---

## 🚀 Fitur Utama & Pengerjaan yang Dilakukan

### 1. Sistem Pemesanan & Logistik
- **Katalog & Checkout**: Landing page modern dengan sistem keranjang belanja yang persisten.
- **Tracking Real-time**: Simulasi pelacakan kurir Gojek/Grab secara langsung di peta menggunakan WebSocket.
- **Automated Delivery**: Penanganan ongkos kirim otomatis dan simulasi pergerakan driver dari toko ke pelanggan.

### 2. Operasional & Kasir (POS)
- **Point of Sale (POS)**: Antarmuka kasir cepat dengan UI premium.
- **Manajemen Shift Otomatis**: 
    - Automasi nominal *Expected Sales* (Cash, QRIS, Online) saat tutup kasir.
    - Input manual untuk *Grab Food* dan *Gojek Food*.
- **Sistem Void & Keamanan**: Pelacakan jumlah void per-shift yang dapat dipantau langsung oleh Super Admin untuk mencegah kecurangan.
- **Penyederhanaan UI**: Penghapusan elemen pajak dan promo di kasir (dialokasikan khusus untuk sistem online) guna mempercepat proses transaksi fisik.

### 3. Super Admin Central Control
- **Dynamic Branding (CMS)**: Pengaturan Nama Situs, Logo, Favicon, dan Konten SEO secara dinamis tanpa menyentuh kode.
- **User Control & Recruitment**: Fitur pembuatan user manual secara langsung dari dashboard Super Admin untuk penambahan staf baru (Kasir/Admin).
- **Global Analytics**: Visualisasi data real-time menggunakan **AreaChart** (Tren Pendapatan POS vs Online), **PieChart** (Metode Pembayaran), serta ranking **Top Merchant** dan **Best Selling Products** secara global.

### 4. Marketing & Loyalitas
- **Program Referral**: Fitur "Undang Teman" yang memberikan poin loyalitas otomatis.
- **Sistem Review**: Ulasan berbasis verifikasi pembelian per-produk.
- **Cashback Engine**: Modul promosi otomatis untuk merchant.

### 5. Komunikasi & Manajemen Stok
- **Chat Real-time**: Fitur obrolan langsung pembeli-penjual via Pusher.
- **Formula Resep (BOM)**: Pemotongan stok bahan baku otomatis saat produk terjual berdasarkan komposisi resep.
- **Advanced BI Reports**: Laporan estimasi HPP (COGS), Laba Kotor, dan Margin Keuntungan.

---

## 🛠 Detail Teknis & Setup
- **Stack**: Laravel 11, React (Vite), Inertia, Tailwind 4.
- **Real-time**: Pusher & Laravel Echo.
- **Icon Library**: Lucide React.
- **Analytics Visualization**: Recharts.

---

## 📋 Instruksi Menjalankan Platform
1. `php artisan migrate --seed`
2. `npm install && npm run build`
3. `php artisan queue:work`

---

## 🔒 Fitur Keamanan Khusus
- **Role Isolation**: Super Admin memiliki akses penuh, sedangkan Admin Merchant dan Kasir terisolasi hanya pada data cabang mereka sendiri.
- **Void Monitoring**: Setiap transaksi yang dibatalkan terekam di sistem dan muncul di laporan tutup kasir serta dashboard pusat.
- **Infinite Recursion Prevention**: Perbaikan konflik penamaan komponen pada halaman Settings guna menjamin stabilitas runtime.
