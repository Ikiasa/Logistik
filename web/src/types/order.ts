
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Order {
    id: string;
    tenant_id: string;
    total_amount: number; // In cents
    total_currency: string;
    status: OrderStatus;
    created_at: string;
}

export interface CreateOrderRequest {
    total_amount: number; // In cents
    total_currency: string;
}
