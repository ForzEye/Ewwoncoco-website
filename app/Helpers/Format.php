<?php

namespace App\Helpers;

use Carbon\Carbon;

/**
 * Format helper untuk EWWON COCO.
 * SELALU gunakan class ini — jangan format manual.
 */
class Format
{
    /**
     * Format angka ke Rupiah Indonesia
     * Output: Rp 85.000
     */
    public static function rupiah(float|int|null $amount): string
    {
        if ($amount === null) {
            return 'Rp 0';
        }

        return 'Rp '.number_format((float) $amount, 0, ',', '.');
    }

    /**
     * Format Rupiah singkat
     * Output: Rp 1,2 jt / Rp 500 rb
     */
    public static function rupiahShort(float|int|null $amount): string
    {
        if ($amount === null) {
            return 'Rp 0';
        }

        $amount = (float) $amount;

        if ($amount >= 1_000_000_000) {
            return 'Rp '.number_format($amount / 1_000_000_000, 1, ',', '.').' M';
        }

        if ($amount >= 1_000_000) {
            return 'Rp '.number_format($amount / 1_000_000, 1, ',', '.').' jt';
        }

        if ($amount >= 1_000) {
            return 'Rp '.number_format($amount / 1_000, 0, ',', '.').' rb';
        }

        return static::rupiah($amount);
    }

    /**
     * Format tanggal ke Indonesia
     * Output: 15 Januari 2025
     */
    public static function tanggal(string|Carbon|null $date): string
    {
        if ($date === null) {
            return '-';
        }

        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);

        return $carbon->locale('id')->isoFormat('D MMMM YYYY');
    }

    /**
     * Format tanggal + waktu ke Indonesia
     * Output: 15 Januari 2025, 14:30
     */
    public static function tanggalWaktu(string|Carbon|null $date): string
    {
        if ($date === null) {
            return '-';
        }

        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);

        return $carbon->locale('id')->isoFormat('D MMMM YYYY, HH:mm');
    }

    /**
     * Waktu relatif
     * Output: 3 menit lalu
     */
    public static function relatif(string|Carbon|null $date): string
    {
        if ($date === null) {
            return '-';
        }

        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);

        return $carbon->locale('id')->diffForHumans();
    }

    /**
     * Angka dengan titik ribuan
     * Output: 1.200
     */
    public static function angka(float|int|null $num): string
    {
        return number_format((float) ($num ?? 0), 0, ',', '.');
    }

    /**
     * Persentase
     * Output: 10%
     */
    public static function persen(float|int|null $num, int $decimals = 0): string
    {
        return number_format((float) ($num ?? 0), $decimals, ',', '.').'%';
    }
}
