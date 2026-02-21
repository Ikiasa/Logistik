
/**
 * Financial utility for consistent currency formatting.
 * Enforces integer-only (cents) logic for all monetary displays.
 */
export const formatCurrency = (amountInCents: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amountInCents / 100);
};

export const parseAmountInput = (value: string): number => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return 0;
    // Convert to cents and ensure integer
    return Math.round(parsed * 100);
};
