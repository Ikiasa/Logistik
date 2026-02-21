import { createClient } from '@supabase/supabase-js';

// ── Client-side Supabase (for browser) ──────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Server-side Supabase (for API routes only) ──────────────
// Uses service_role key to bypass RLS. NEVER expose this to the client.
export function createServerClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        // Fallback to anon key if service role not available
        console.warn('SUPABASE_SERVICE_ROLE_KEY not set, using anon key as fallback');
        return createClient(supabaseUrl, supabaseAnonKey);
    }
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false }
    });
}
