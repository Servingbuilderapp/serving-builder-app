import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;

export const createClient = () => {
  if (typeof window === 'undefined') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
    return createSupabaseClient(supabaseUrl, supabaseKey);
  }

  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  let projectRef = 'local';
  try {
    const urlObj = new URL(supabaseUrl);
    projectRef = urlObj.hostname.split('.')[0] || 'local';
  } catch (e) {
    // Fallback if URL is invalid
  }

  supabaseClientInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: `sb-${projectRef}-auth-token-cached`
    }
  });

  return supabaseClientInstance;
};
