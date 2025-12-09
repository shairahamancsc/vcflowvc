"use client"

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
    throw new Error('Supabase URL or anon key is not set or is a placeholder.');
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
