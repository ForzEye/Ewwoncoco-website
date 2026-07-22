<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DailySalesReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $reportData;
    public string $pdfContent;

    /**
     * Create a new message instance.
     */
    public function __construct(array $reportData, string $pdfContent)
    {
        $this->reportData = $reportData;
        $this->pdfContent = $pdfContent;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '📊 [EWWON COCO BI] Laporan Penjualan Harian - ' . $this->reportData['date_formatted'],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtmlContent(),
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        $filename = 'Laporan_Penjualan_Harian_' . $this->reportData['date_raw'] . '.pdf';

        return [
            Attachment::fromData(fn () => $this->pdfContent, $filename)
                ->withMime('application/pdf'),
        ];
    }

    /**
     * Build responsive HTML content for email body
     */
    private function buildHtmlContent(): string
    {
        $d = $this->reportData;
        $formattedRevenue = number_format($d['total_revenue'], 0, ',', '.');
        $formattedTrx = number_format($d['total_transactions'], 0, ',', '.');

        return "
        <div style=\"font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;\">
            <div style=\"max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e1e8ed;\">
                <div style=\"border-bottom: 2px solid #00C48C; padding-bottom: 15px; margin-bottom: 20px;\">
                    <h2 style=\"margin: 0; color: #1A1A1A; font-size: 22px;\">EWWON COCO</h2>
                    <p style=\"margin: 4px 0 0 0; color: #00C48C; font-weight: bold; font-size: 12px; text-transform: uppercase;\">Daily Business Intelligence Report</p>
                </div>

                <p style=\"font-size: 14px; color: #333333; line-height: 1.5;\">
                    Halo Management / Executive,<br><br>
                    Berikut adalah ringkasan performa penjualan harian toko untuk <strong>{$d['date_formatted']}</strong>. Berkas PDF laporan lengkap telah terlampir pada email ini.
                </p>

                <div style=\"background-color: #F0FAF6; border-left: 4px solid #00C48C; padding: 15px 20px; border-radius: 8px; margin: 25px 0;\">
                    <div style=\"font-size: 11px; font-weight: bold; color: #666666; text-transform: uppercase;\">TOTAL OMSET HARIAN</div>
                    <div style=\"font-size: 26px; font-weight: bold; color: #00C48C; margin-top: 5px;\">Rp {$formattedRevenue}</div>
                    <div style=\"font-size: 12px; color: #555555; margin-top: 5px;\">{$formattedTrx} Transaksi Berhasil (Kasir POS + Pesanan Online)</div>
                </div>

                <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;\">
                    <tr style=\"background: #f8fafc;\">
                        <td style=\"padding: 10px; border-bottom: 1px solid #eee;\"><strong>Kasir POS</strong></td>
                        <td style=\"padding: 10px; border-bottom: 1px solid #eee; text-align: right;\">Rp " . number_format($d['pos_revenue'], 0, ',', '.') . " ({$d['pos_count']} Trx)</td>
                    </tr>
                    <tr>
                        <td style=\"padding: 10px; border-bottom: 1px solid #eee;\"><strong>Online Web/App</strong></td>
                        <td style=\"padding: 10px; border-bottom: 1px solid #eee; text-align: right;\">Rp " . number_format($d['online_revenue'], 0, ',', '.') . " ({$d['online_count']} Trx)</td>
                    </tr>
                </table>

                <p style=\"font-size: 13px; color: #666666;\">
                    📄 <em>Silakan buka berkas lampiran <strong>Laporan_Penjualan_Harian_{$d['date_raw']}.pdf</strong> untuk melihat rincian metode pembayaran & top produk terlaris.</em>
                </p>

                <div style=\"border-top: 1px solid #eee; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 11px; color: #999999;\">
                    &copy; " . date('Y') . " Ewwon Coco Automated BI System. All rights reserved.
                </div>
            </div>
        </div>
        ";
    }
}
