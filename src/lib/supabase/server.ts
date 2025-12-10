import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  // Check if the environment variables are set and are not placeholders
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (
    !supabaseUrl ||
    supabaseUrl === 'YOUR_SUPABASE_URL_HERE' ||
    !supabaseAnonKey ||
    supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE'
  ) {
    // Return a mock client that will result in errors on data access,
    // but won't crash the entire application during initialization.
    // This allows the user to see the UI and understand they need to add credentials.
    console.warn("Supabase credentials are not set. The application will not function correctly. Please update your .env file.");
    return {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signOut: () => Promise.resolve({}),
        },
        from: (table: string) => ({
            select: () => Promise.resolve({ data: [], error: { message: "Supabase not configured."} }),
            insert: () => Promise.resolve({ error: { message: "Supabase not configured."} }),
            update: () => Promise.resolve({ error: { message: "Supabase not configured."} }),
            eq: () => Promise.resolve({ error: { message: "Supabase not configured."} }),
        }),
    } as any;
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
