# Brainstorming: Ewwon Coco POS & Admin Enhancements
**Date:** 2026-05-14
**Status:** Planning

## 1. Sistem Void (Pembatalan Transaksi)
Fitur untuk membatalkan transaksi di sisi kasir dengan batasan keamanan untuk mencegah penyalahgunaan.

### Mekanisme:
- **Self-Service with Limit**: Kasir dapat melakukan void sendiri tanpa otorisasi admin.
- **Limit Transaksi**: Maksimal 3 kali void dalam satu shift yang sama.
- **Auto-Lock**: Jika melewati batas 3 kali, sistem POS pada shift tersebut akan terkunci secara otomatis.
- **Warning System**: Muncul notifikasi peringatan saat kasir melakukan void (misal: "Sisa kuota void: 1x").
- **Admin Intervention**: Hanya Admin yang dapat membuka kunci (Unlock) POS jika sudah terkunci.
- **Monitoring**: Admin dapat melihat riwayat dan jumlah void tiap kasir melalui dashboard.

## 2. Monitoring Pesanan Online di POS
Integrasi pesanan dari Customer Web langsung ke layar kasir untuk pemrosesan cepat.

### Mekanisme:
- **Real-time Alerts (Pusher)**: Menggunakan Pusher & Laravel Echo untuk notifikasi instan di Top Navbar (Header) POS. Akan muncul badge angka pesanan masuk.
- **Top Navbar Management**: Tombol atau Tab baru di bagian atas (sejajar dengan menu Transaksi/Shift) untuk membuka daftar pesanan online.
- **Order Acceptance (ACC)**: Tombol untuk menerima pesanan.
- **Auto Printing**: Begitu tombol ACC ditekan, sistem otomatis mencetak struk ke printer dapur (kitchen printer).
- **Status Management**: Kasir dapat mengubah status pesanan (e.g., "Preparing", "Ready for Pickup", "Completed") langsung dari UI POS.

## 3. Penempatan Admin & Kasir (Superadmin)
Manajemen akun yang terpusat dengan penempatan lokasi kerja yang jelas.

### Mekanisme:
- **Merchant Mapping**: Superadmin wajib menentukan Merchant saat membuat/edit akun Admin atau Kasir.
- **Quota Akun**: 
    - 1 Merchant = 1 Admin.
    - 1 Merchant = Multi-Kasir (mendukung sistem pergantian shift).
- **Access Control**: User hanya bisa melihat data dan melakukan transaksi sesuai dengan Merchant yang ditugaskan.

## 4. Monitoring Shift Kasir (Admin Dashboard)
Fitur bagi Admin Merchant untuk mengawasi operasional kasir di cabangnya.

### Mekanisme:
- **Shift Activity Tracking**: Melihat siapa yang sedang bertugas dan status shift (Open/Closed).
- **Financial Summary**: Ringkasan total uang masuk dan total penjualan ditampilkan hanya setelah kasir melakukan "Clock Out".
- **Force Close**: Fitur bagi Admin untuk menutup shift kasir secara paksa jika kasir lupa melakukan closing.

---
**Next Step:** Detail Desain Teknis & Implementasi.
