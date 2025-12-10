"use client"

import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) {
    return client;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    supabaseUrl === 'YOUR_SUPABASE_URL_HERE' ||
    !supabaseAnonKey ||
    supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE'
  ) {
     console.warn("Supabase credentials are not set for the client. The application will not function correctly. Please update your .env file.");
     // Return a mock client to prevent crashing
     return {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: () => Promise.resolve({ error: { message: "Supabase not configured. Please check your .env file."} }),
            signOut: () => Promise.resolve({}),
            signUp: () => Promise.resolve({ error: { message: "Supabase not configured. Please check your .env file."} }),
        },
        from: (table: string) => ({
            select: () => Promise.resolve({ data: [], error: { message: "Supabase not configured."} }),
            insert: () => Promise.resolve({ error: { message: "Supabase not configured."} }),
            update: () => Promise.resolve({ error: { message: "Supabase not configured."} }),
            delete: () => Promise.resolve({ error: { message: "Supabase not configured."} }),
            eq: () => Promise.resolve({ error: { message: "Supabase not configured."} }),
            single: () => Promise.resolve({ error: { message: "Supabase not configured."} }),
        }),
    } as any;
  }

  client = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );

  return client;
}
