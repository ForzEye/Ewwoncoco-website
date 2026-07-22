<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Penjualan Harian - {{ $data['date_formatted'] }}</title>
    <style>
        @page {
            margin: 25px 30px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #2D3748;
            line-height: 1.4;
            font-size: 11px;
            background-color: #FFFFFF;
        }
        .header {
            border-bottom: 2px solid #00C48C;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header table {
            width: 100%;
        }
        .logo-text {
            font-size: 20px;
            font-weight: 800;
            color: #1A1A1A;
            letter-spacing: 0.5px;
        }
        .logo-subtext {
            font-size: 10px;
            color: #00C48C;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .report-title {
            text-align: right;
        }
        .report-title h2 {
            margin: 0;
            font-size: 16px;
            color: #1A1A1A;
        }
        .report-title p {
            margin: 2px 0 0 0;
            font-size: 10px;
            color: #718096;
        }

        /* KPI Cards */
        .kpi-container {
            width: 100%;
            margin-bottom: 20px;
        }
        .kpi-card {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 10px 12px;
            width: 48%;
            box-sizing: border-box;
        }
        .kpi-label {
            font-size: 9px;
            font-weight: bold;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .kpi-value {
            font-size: 18px;
            font-weight: 800;
            color: #1A1A1A;
            margin-top: 3px;
        }
        .kpi-sub {
            font-size: 8.5px;
            color: #00C48C;
            margin-top: 2px;
            font-weight: 600;
        }

        /* Section Styling */
        .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #1A1A1A;
            margin-bottom: 8px;
            padding-left: 6px;
            border-left: 3px solid #00C48C;
        }

        /* Tables */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }
        table.data-table th {
            background-color: #EDF2F7;
            color: #4A5568;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 7px 10px;
            text-align: left;
            border-bottom: 1px solid #CBD5E0;
        }
        table.data-table td {
            padding: 7px 10px;
            border-bottom: 1px solid #E2E8F0;
            font-size: 10px;
            color: #2D3748;
        }
        table.data-table tr:nth-child(even) {
            background-color: #F8FAFC;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .text-emerald { color: #00C48C; font-weight: bold; }

        .footer {
            margin-top: 30px;
            border-top: 1px solid #E2E8F0;
            padding-top: 10px;
            font-size: 8.5px;
            color: #A0AEC0;
            text-align: center;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="header">
        <table>
            <tr>
                <td>
                    <div class="logo-text">EWWON COCO</div>
                    <div class="logo-subtext">Business Intelligence System</div>
                </td>
                <td class="report-title">
                    <h2>LAPORAN PENJUALAN HARIAN</h2>
                    <p>{{ $data['date_formatted'] }}</p>
                </td>
            </tr>
        </table>
    </div>

    <!-- Executive KPI Cards Grid -->
    <table class="kpi-container" cellspacing="0" cellpadding="0">
        <tr>
            <td class="kpi-card" style="margin-right: 4%;">
                <div class="kpi-label">TOTAL OMSET HARIAN</div>
                <div class="kpi-value text-emerald">Rp {{ number_format($data['total_revenue'], 0, ',', '.') }}</div>
                <div class="kpi-sub">Dari {{ $data['total_transactions'] }} Transaksi Berhasil</div>
            </td>
            <td class="kpi-card">
                <div class="kpi-label">RATA-RATA TRANSAKSI (AOV)</div>
                <div class="kpi-value">Rp {{ number_format($data['average_order_value'], 0, ',', '.') }}</div>
                <div class="kpi-sub">Total Diskon Diberikan: Rp {{ number_format($data['total_discount'], 0, ',', '.') }}</div>
            </td>
        </tr>
    </table>

    <!-- Channel Breakdown -->
    <div class="section-title">1. Rincian Kanal Penjualan</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Kanal Penjualan</th>
                <th class="text-center">Jumlah Transaksi</th>
                <th class="text-right">Total Pendapatan</th>
                <th class="text-right">Kontribusi</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Kasir (POS Direct)</strong></td>
                <td class="text-center">{{ $data['pos_count'] }} Nota</td>
                <td class="text-right font-bold">Rp {{ number_format($data['pos_revenue'], 0, ',', '.') }}</td>
                <td class="text-right font-bold">
                    {{ $data['total_revenue'] > 0 ? number_format(($data['pos_revenue'] / $data['total_revenue']) * 100, 1) : 0 }}%
                </td>
            </tr>
            <tr>
                <td><strong>Pesanan Online (Web/App)</strong></td>
                <td class="text-center">{{ $data['online_count'] }} Order</td>
                <td class="text-right font-bold">Rp {{ number_format($data['online_revenue'], 0, ',', '.') }}</td>
                <td class="text-right font-bold">
                    {{ $data['total_revenue'] > 0 ? number_format(($data['online_revenue'] / $data['total_revenue']) * 100, 1) : 0 }}%
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Payment Methods & Branch Tables (2 Columns Side-by-Side if possible) -->
    <table style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="width: 49%; vertical-align: top;">
                <div class="section-title">2. Metode Pembayaran</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Metode</th>
                            <th class="text-center">Trx</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($data['payment_methods'] as $pm)
                            <tr>
                                <td><strong>{{ $pm['name'] }}</strong></td>
                                <td class="text-center">{{ $pm['count'] }}</td>
                                <td class="text-right">Rp {{ number_format($pm['amount'], 0, ',', '.') }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="3" class="text-center">Belum ada transaksi</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
            <td style="width: 2%;"></td>
            <td style="width: 49%; vertical-align: top;">
                <div class="section-title">3. Penjualan Per Cabang</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nama Cabang</th>
                            <th class="text-right">Total Omset</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($data['branch_stats'] as $b)
                            <tr>
                                <td><strong>{{ $b['name'] }}</strong></td>
                                <td class="text-right">Rp {{ number_format($b['total'], 0, ',', '.') }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="2" class="text-center">Pusat / Cabang Tunggal</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
        </tr>
    </table>

    <!-- Top Selling Products -->
    <div class="section-title">4. Top Produk Terlaris Hari Ini</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;" class="text-center">#</th>
                <th>Nama Produk</th>
                <th style="width: 20%;" class="text-center">Terjual (Qty)</th>
                <th style="width: 30%;" class="text-right">Total Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data['top_products'] as $index => $prod)
                <tr>
                    <td class="text-center font-bold">{{ $index + 1 }}</td>
                    <td><strong>{{ $prod['name'] }}</strong></td>
                    <td class="text-center font-bold">{{ number_format($prod['qty'], 0, ',', '.') }} porsi</td>
                    <td class="text-right font-bold text-emerald">Rp {{ number_format($prod['total'], 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="4" class="text-center">Belum ada produk terjual hari ini.</td></tr>
            @endforelse
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        Dokumen ini dihasilkan secara otomatis oleh <strong>Ewwon Coco Automated BI System</strong> pada {{ date('d-m-Y H:i:s') }}.
    </div>

</body>
</html>
