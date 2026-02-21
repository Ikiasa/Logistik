import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/finance/invoices — List all invoices
export async function GET() {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}
