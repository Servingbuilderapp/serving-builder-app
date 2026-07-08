import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    SUPABASE_DB_PASSWORD: process.env.SUPABASE_DB_PASSWORD || null,
    SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF || null,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
    keys: Object.keys(process.env)
  });
}
