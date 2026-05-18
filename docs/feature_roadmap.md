# Feature Roadmap: Ewwon Coco POS & E-Commerce

**Date:** 2026-05-14  
**Status:** Draft / Planning  
**Context:** Based on current Laravel + Inertia.js codebase with roles: `customer`, `kasir`, `admin`, `super_admin`.

---

## Fitur yang Sudah Ada (Existing)
- Autentikasi (Email, OTP, Google OAuth)
- Customer Web (Shop, Cart, Checkout, Orders, Payment Proof)
- Loyalty & Referral System
- Customer-Merchant Chat
- Delivery Request & Quotes
- FCM Push Notifications
- Admin Dashboard (Products, Orders, Reports, Marketing, Vouchers, Settings)
- POS Kasir (Screen, Shift Open/Close, Transactions, Void, Online Orders)
- Super Admin (User Management, Merchant & Branch Management)
- Review & Rating Produk

---

## Fitur Baru yang Direkomendasikan

### 1. Inventory / Stock Management
**Prioritas:** 🔴 High  
**Deskripsi:** Manajemen stok bahan baku dan produk jadi dengan tracking real-time.

**Sub-fitur:**
- **Stock Tracking:** Kurangi stok otomatis saat POS transaksi atau online order diterima.
- **Low Stock Alerts:** Notifikasi ke Admin saat stok di bawah threshold minimum.
- **Stock Adjustment:** Admin dapat menyesuaikan stok manual (rusak, hilang, stok opname).
- **Multi-Unit:** Satuan dasar (e.g., gram) vs satuan jual (e.g., cup).

**Modul Terkait:** `Admin Dashboard`, `POS`

---

### 2. Recipe / BOM (Bill of Materials)
**Prioritas:** 🔴 High  
**Deskripsi:** Setiap produk memiliki resep bahan baku. Stok bahan baku berkurang otomatis berdasarkan resep saat produk terjual.

**Sub-fitur:**
- **Recipe Editor:** Definisikan bahan & takaran per produk.
- **COGS Auto-Calculation:** Harga pokok dihitung otomatis dari harga bahan.
- **Production Plan:** Admin bisa input produksi harian untuk menambah stok jadi.

**Modul Terkait:** `Inventory`, `Reports`

---

### 3. Table / Dine-in Management
**Prioritas:** 🟡 Medium  
**Deskripsi:** Manajemen meja untuk pelanggan dine-in langsung di outlet.

**Sub-fitur:**
- **Floor Plan:** Visualisasi layout meja (available, occupied, reserved).
- **Table QR Ordering:** Pelanggan scan QR di meja untuk order tanpa aplikasi.
- **Merge / Split Bill:** Gabung atau pisah tagihan antar meja.
- **Reservation:** Booking meja untuk tanggal & jam tertentu.

**Modul Terkait:** `POS`, `Customer Web`

---

### 4. Supplier & Purchase Order (PO)
**Prioritas:** 🟡 Medium  
**Deskripsi:** Manajemen pemasok dan pembelian bahan baku.

**Sub-fitur:**
- **Supplier Directory:** Data supplier dengan kontak dan historis harga.
- **Auto-Reorder:** Generate PO otomatis saat stok bahan baku di bawah safety stock.
- **PO Approval Flow:** Admin membuat PO, Super Admin menyetujui (opsional).
- **Goods Receipt:** Pencatatan penerimaan barang & update stok.

**Modul Terkait:** `Inventory`, `Admin Dashboard`

---

### 5. Kitchen Display System (KDS)
**Prioritas:** 🟡 Medium  
**Deskripsi:** Layar khusus di dapur untuk melihat pesanan real-time dari POS dan online.

**Sub-fitur:**
- **Order Queue:** Daftar pesanan dengan status (New → Preparing → Ready).
- **Bump Bar:** Tombol untuk tandai pesanan selesai.
- **Timer:** Tracking waktu per pesanan untuk KPI kecepatan.
- **Auto-Print Integration:** Sinkronisasi dengan printer dapur saat order masuk.

**Modul Terkait:** `POS`, `Online Orders`

---

### 6. Advanced Reports & Business Intelligence
**Prioritas:** 🟡 Medium  
**Deskripsi:** Laporan analitik yang lebih mendalam untuk pengambilan keputusan.

**Sub-fitur:**
- **Sales Forecasting:** Prediksi penjualan minggu depan berdasarkan historis.
- **Peak Hours Analysis:** Grafik jam sibuk untuk optimasi jadwal kasir.
- **Product Mix / Menu Engineering:** BCG Matrix (Stars, Cows, Puzzles, Dogs) per produk.
- **Profit & Loss Statement:** Laporan laba rugi otomatis dari revenue & COGS.
- **Export:** PDF, Excel, CSV untuk semua laporan.

**Modul Terkait:** `Admin Dashboard`, `Super Admin`

---

### 7. Subscription / Membership Tiers
**Prioritas:** 🟢 Low (Nice to Have)  
**Deskripsi:** Membership berbayar dengan benefit eksklusif.

**Sub-fitur:**
- **Tier Levels:** Bronze, Silver, Gold dengan cashback/discount berbeda.
- **Subscription Billing:** Pembayaran berulang (bulanan/tahunan) via Midtrans/Xendit.
- **Exclusive Perks:** Free delivery, early access promo, birthday rewards.

**Modul Terkait:** `Customer Web`, `Loyalty`

---

### 8. Delivery Driver App / Tracking
**Prioritas:** 🟢 Low (Nice to Have)  
**Deskripsi:** Tracking pengemudi untuk pesanan delivery.

**Sub-fitur:**
- **Driver Assignment:** Admin/kasir assign driver ke pesanan.
- **Live Tracking:** Pelanggan bisa lihat lokasi driver real-time (Google Maps).
- **Delivery Proof:** Foto saat pesanan diterima + tanda tangan digital.
- **Driver Performance:** Rating & riwayat pengantaran per driver.

**Modul Terkait:** `Orders`, `Customer Web`

---

### 9. Multi-Payment & Split Bill (POS)
**Prioritas:** 🟡 Medium  
**Deskripsi:** Pembayaran fleksibel di kasir.

**Sub-fitur:**
- **Split Payment:** Bayar dengan kombinasi (e.g., 50k cash + 50k QRIS).
- **Split Bill:** Bagi tagihan antar pelanggan dalam 1 meja.
- **Tip / Gratuity:** Input tip untuk kasir/delivery.

**Modul Terkait:** `POS Transactions`

---

### 10. Audit Log & Activity Tracking
**Prioritas:** 🟡 Medium  
**Deskripsi:** Pencatatan semua aktivitas kritis untuk keamanan & compliance.

**Sub-fitur:**
- **Action Log:** Siapa yang edit harga, hapus transaksi, ubah stok.
- **Immutable Log:** Log yang tidak bisa dihapus/diedit.
- **Filter & Search:** Cari log berdasarkan user, modul, tanggal.

**Modul Terkait:** `Super Admin`, `Admin Dashboard`

---

## Prioritas Implementasi

| Phase | Fitur | Estimasi |
|-------|-------|----------|
| **Phase 1** | Inventory / Stock Management | 2-3 minggu |
| **Phase 1** | Recipe / BOM | 2 minggu |
| **Phase 2** | Kitchen Display System (KDS) | 1-2 minggu |
| **Phase 2** | Table / Dine-in Management | 2 minggu |
| **Phase 2** | Multi-Payment & Split Bill | 1 minggu |
| **Phase 3** | Supplier & PO | 2 minggu |
| **Phase 3** | Advanced Reports & BI | 2-3 minggu |
| **Phase 3** | Audit Log | 1 minggu |
| **Phase 4** | Subscription / Membership | 2 minggu |
| **Phase 4** | Delivery Driver Tracking | 2-3 minggu |

---

## Catatan Teknis
- Gunakan **Laravel Events/Listeners** untuk update stok agar tidak blocking transaksi.
- Untuk **KDS** & real-time features, gunakan **Pusher / Laravel Reverb** yang sudah ada.
- Untuk **Audit Log**, pertimbangkan package `spatie/laravel-activitylog`.
- Untuk **Reports complex**, bisa gunakan **Laravel Scout + Meilisearch** atau query optimized dengan indexing.
- Untuk **Table QR Ordering**, generate QR dengan `simple-qrcode` dan link ke `/table/{code}/order`.

---

**Next Step:** Pilih Phase 1 untuk kick-off detail desain teknis & database schema.
