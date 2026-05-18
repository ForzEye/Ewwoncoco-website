import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility untuk menggabungkan className dengan Tailwind merge
 * (digunakan oleh shadcn/ui components)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
