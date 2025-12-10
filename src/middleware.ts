import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (
    !supabaseUrl ||
    supabaseUrl === 'YOUR_SUPABASE_URL_HERE' ||
    !supabaseAnonKey ||
    supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE'
  ) {
    // If Supabase is not configured, we bypass the middleware logic
    // to prevent crashes and allow the app to load.
    return response;
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Refresh session if expired - handled by supabase-ssr
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
