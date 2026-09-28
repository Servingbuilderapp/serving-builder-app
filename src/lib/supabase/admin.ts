import { createClient } from '@supabase/supabase-js'

// La variable que de verdad está creada en Vercel se llama
// SUPABASE_SERVICE_ROLE_KEY (no SUPABASE_SECRET_KEY, que es el nombre que
// este archivo pedía antes y que nunca existió en Vercel — por eso
// cualquier acción que pasara por aquí fallaba con "Invalid API key").
// Se deja SUPABASE_SECRET_KEY como respaldo por si algún entorno viejo
// todavía la usa con ese nombre.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || 'placeholder-key';

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
