/**
 * Formats a number as Indonesian Rupiah (IDR)
 * @param amountInCents The amount in cents/minor units
 * @returns Formatted string with Rp prefix
 */
export const formatIDR = (amountInCents: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amountInCents / 100);
};

/**
 * Formats a number with Indonesian thousand separators
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
};
