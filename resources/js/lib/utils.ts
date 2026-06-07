import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility untuk menggabungkan className dengan Tailwind merge
 * (digunakan oleh shadcn/ui components)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

/**
 * Filter pagination links to show a responsive set (e.g. « 1 ... 14 15 16 ... 65 »)
 * instead of all page links, avoiding layout breaks when pages grow up to 65+ pages.
 */
export function getFilteredLinks(links: PaginationLink[]): PaginationLink[] {
    if (!links || links.length <= 8) return links || [];

    const filtered: PaginationLink[] = [];
    const prevLink = links[0];
    const nextLink = links[links.length - 1];
    
    // Page links are index 1 to links.length - 2
    const pageLinks = links.slice(1, -1);
    
    // Find index of the active page link in pageLinks
    const activeIdx = pageLinks.findIndex(l => l.active);
    
    const firstPage = pageLinks[0];
    const lastPage = pageLinks[pageLinks.length - 1];
    
    filtered.push(prevLink);
    
    let lastAddedPageNum = -1;
    
    pageLinks.forEach((link, idx) => {
        const pageNum = parseInt(link.label, 10);
        if (isNaN(pageNum)) {
            // If the label is not a number, always include it
            filtered.push(link);
            return;
        }
        
        const isFirst = idx === 0;
        const isLast = idx === pageLinks.length - 1;
        const isActive = link.active;
        const isNearActive = activeIdx !== -1 && Math.abs(idx - activeIdx) <= 1; // 1 page buffer
        
        if (isFirst || isLast || isActive || isNearActive) {
            if (lastAddedPageNum !== -1 && pageNum - lastAddedPageNum > 1) {
                filtered.push({
                    url: null,
                    label: '...',
                    active: false
                });
            }
            filtered.push(link);
            lastAddedPageNum = pageNum;
        }
    });
    
    filtered.push(nextLink);
    return filtered;
}

