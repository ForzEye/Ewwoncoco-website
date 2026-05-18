/**
 * Format angka ke format Rupiah Indonesia
 * Output: Rp 85.000
 */
export function rupiah(amount: number): string {
    return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

/**
 * Format angka ke format Rupiah singkat (Rp 1,2 jt)
 */
export function rupiahShort(amount: number): string {
    if (amount >= 1_000_000_000) {
        return 'Rp ' + (amount / 1_000_000_000).toFixed(1).replace('.', ',') + ' M';
    }
    if (amount >= 1_000_000) {
        return 'Rp ' + (amount / 1_000_000).toFixed(1).replace('.', ',') + ' jt';
    }
    if (amount >= 1_000) {
        return 'Rp ' + (amount / 1_000).toFixed(0) + ' rb';
    }
    return rupiah(amount);
}

/**
 * Format tanggal ke format Indonesia
 * Output: 15 Januari 2025
 */
export function tanggal(date: Date | string): string {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Format tanggal + waktu ke format Indonesia
 * Output: 15 Januari 2025, 14:30
 */
export function tanggalWaktu(date: Date | string): string {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format waktu relatif (misal: "3 menit lalu")
 */
export function relativTime(date: Date | string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return tanggal(date);
}

/**
 * Angka biasa dengan titik ribuan
 * Output: 1.200
 */
export function angka(num: number): string {
    return Math.round(num).toLocaleString('id-ID');
}

/**
 * Persentase
 * Output: 10%
 */
export function persen(num: number, decimals = 0): string {
    return num.toFixed(decimals) + '%';
}

/**
 * Format kuantitas/stok bersih dari nol mubazir
 * Output: 1.000 (dari 1000.0000) atau 1 (dari 1.0000) atau 1,5 (dari 1.5000)
 */
export function qty(num: number | string): string {
    const val = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(val)) return '0';
    // Gunakan toLocaleString untuk pemisah ribuan dan desimal yang benar sesuai ID
    return Number(val.toFixed(4)).toLocaleString('id-ID', {
        maximumFractionDigits: 4,
        minimumFractionDigits: 0
    });
}
