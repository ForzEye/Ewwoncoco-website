# 🥥 Ewwon Coco: The Ultimate Coconut Dessert Platform

Ewwon Coco adalah ekosistem digital modern yang dirancang untuk revolusi bisnis dessert kelapa muda. Platform ini menggabungkan kemudahan pemesanan online ala aplikasi transportasi dengan ketangguhan sistem operasional kasir (POS) di outlet fisik.

## 🌟 Fitur Unggulan

### 🛍️ Online Ordering Experience
- **Modern Catalog**: Antarmuka belanja yang bersih dan responsif.
- **Real-time Tracking**: Pelacakan kurir interaktif dengan WebSocket.
- **Loyalty Program**: Referral system, poin reward, dan cashback otomatis.

### 📠 Smart POS (Point of Sale)
- **Fast Checkout**: UI kasir premium yang dioptimalkan untuk kecepatan.
- **Automated Closing**: Rekapitulasi penjualan otomatis (Cash, QRIS, Online).
- **Shift Management**: Kontrol pembukaan/penutupan shift dengan monitoring void transparan.
- **Recipe & Inventory**: Pengurangan stok otomatis berdasarkan resep (BOM) setiap kali produk terjual.

### 🏢 Super Admin & Merchant Central
- **Dynamic CMS**: Kendali penuh atas branding (logo, favicon) dan SEO homepage.
- **Global Analytics**: Visualisasi data real-time untuk memantau performa seluruh cabang dan produk terlaris.
- **User Management**: Kontrol akses terpusat untuk Kasir, Admin, dan Super Admin.

## 🛠️ Teknologi yang Digunakan
- **Backend**: Laravel 11 (PHP 8.2+)
- **Frontend**: React.js, Inertia.js
- **Styling**: Tailwind CSS 4
- **Real-time**: Pusher & Laravel Echo
- **Icons**: Lucide React
- **Charts**: Recharts

## 🚀 Cara Menjalankan Project

1. **Clone & Setup Environment**
   ```bash
   git clone https://github.com/your-repo/ewwoncoco.git
   cp .env.example .env
   ```

2. **Install Dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Database Migration & Seeding**
   ```bash
   php artisan migrate --seed
   ```

4. **Run Development Server**
   ```bash
   php artisan serve
   npm run dev
   ```

5. **Start Background Workers (Optional for Real-time)**
   ```bash
   php artisan queue:work
   ```

## 🔒 Hak Akses (Credentials Default)
- **Super Admin**: `superadmin@ewwoncoco.id` / `password`
- **Admin Merchant**: `admin@ewwoncoco.id` / `password`
- **Kasir**: `kasir@ewwoncoco.id` / `password`

---
*Built with ❤️ for Ewwon Coco Ecosystem.*
