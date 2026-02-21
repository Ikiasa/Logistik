import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/analytics — Get dashboard analytics
export async function GET(request: NextRequest) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');

    // Orders summary
    if (metric === 'orders' || !metric) {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('status', { count: 'exact' })
            .is('deleted_at', null);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const total = orders?.length || 0;
        const pending = orders?.filter(o => o.status === 'pending').length || 0;
        const completed = orders?.filter(o => o.status === 'COMPLETED').length || 0;

        return NextResponse.json({
            data: {
                total_orders: total,
                pending_orders: pending,
                completed_orders: completed,
            }
        });
    }

    return NextResponse.json({ data: {} });
}
