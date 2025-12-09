"use client"

import { createBrowserClient } from "@supabase/ssr"

// Define a placeholder or an obviously invalid URL to check against
const isInvalidSupabaseUrl = (url: string | undefined) => !url || url === 'YOUR_SUPABASE_URL' || !url.startsWith('http');


export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isInvalidSupabaseUrl(supabaseUrl) || !supabaseAnonKey) {
    // Return a mock client if the credentials are not set
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: { message: "Supabase not configured." } }),
        signOut: async () => {},
      },
      from: () => ({
        select: async () => ({ data: [], error: { message: "Supabase not configured."} }),
      }),
    } as any;
  }

  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  )
}
