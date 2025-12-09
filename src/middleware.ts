import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL';

export async function middleware(request: NextRequest) {
  // If supabase is not configured, skip middleware
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Refresh session if expired - handled by supabase-ssr
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
