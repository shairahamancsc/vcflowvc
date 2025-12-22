
'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase credentials are not set for the client. Please update your .env file.'
  );
}

// Note: this is a singleton. The same instance will be shared across the app.
const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export function createClient() {
  return supabase;
}
