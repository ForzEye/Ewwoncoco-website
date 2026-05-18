# Desain Spesifikasi (Versi Sederhana): Inventory, Recipe, & Business Intelligence — EWWON COCO

Dokumen ini merinci arsitektur yang disederhanakan untuk manajemen stok, resep, dan analitik bisnis menggunakan metode **Harga Rata-rata (Average Costing)**.

## 1. Arsitektur Database (Schema Sederhana)

### A. Master Data Bahan Baku
**Tabel: `ingredients`**
- `id` (PK)
- `merchant_id` (FK)
- `name` (string)
- `unit` (string) - Contoh: pcs, ml, gr.

### B. Stok & Biaya per Cabang
**Tabel: `branch_ingredients`**
- `id` (PK)
- `branch_id` (FK)
- `ingredient_id` (FK)
- `stock` (decimal) - Total stok saat ini di cabang tersebut.
- `min_stock` (decimal) - Stok minimum untuk notifikasi.
- `average_cost` (decimal) - Harga rata-rata per unit untuk perhitungan HPP.

### C. Sistem Resep (BOM)
**Tabel: `recipes`**
- `id` (PK)
- `product_id` (FK)
- `ingredient_id` (FK)
- `quantity` (decimal) - Jumlah bahan yang digunakan untuk 1 unit produk.

### D. Log Pergerakan Stok
**Tabel: `stock_movements`**
- `id` (PK)
- `branch_id` (FK)
- `ingredient_id` (FK)
- `type` (enum) - `IN` (Masuk/Beli), `OUT` (Penjualan), `ADJUST` (Opname/Koreksi).
- `quantity` (decimal)
- `notes` (text)

---

## 2. Alur Kerja Logika (Simplified Logic)

### A. Alur Update Harga Rata-rata (Saat Barang Masuk)
Saat stok baru ditambahkan (Pembelian), sistem menghitung ulang `average_cost` dengan rumus:
`New_Avg_Cost = ((Old_Qty * Old_Avg_Cost) + (New_Qty * New_Price)) / (Old_Qty + New_Qty)`

### B. Alur Pemotongan Stok Otomatis
1. Transaksi (POS/Online) dinyatakan `Selesai`.
2. Sistem mencari resep untuk setiap produk.
3. Mengurangi `stock` pada `branch_ingredients` secara langsung.
4. Mencatat histori ke `stock_movements`.

### C. Kalkulasi HPP & Laba
- **HPP per Produk** = `SUM(Quantity_Resep * average_cost_Bahan)`.
- **Laba Kotor** = `Total Penjualan - Total HPP`.

---

## 3. Rencana Implementasi

1. **Phase 1**: Migrasi database (4 tabel di atas).
2. **Phase 2**: UI Manajemen Bahan Baku & Stok Cabang (Input Stok Masuk).
3. **Phase 3**: UI Manajemen Resep & Logic Pemotongan Stok saat transaksi.
4. **Phase 4**: Dashboard Laporan BI (HPP, Profit Margin, Stok Menipis).
