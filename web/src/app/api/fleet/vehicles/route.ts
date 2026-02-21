import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/fleet/vehicles — List all vehicles
export async function GET() {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('vehicle_tracking')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

// POST /api/fleet/vehicles — Register a new vehicle
export async function POST(request: NextRequest) {
    const supabase = createServerClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from('vehicle_tracking')
        .insert({
            vehicle_id: body.vehicle_id || crypto.randomUUID(),
            plate_number: body.plate_number,
            vehicle_model: body.vehicle_model,
            status: body.status || 'ACTIVE',
            tenant_id: '00000000-0000-0000-0000-000000000000',
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
}
