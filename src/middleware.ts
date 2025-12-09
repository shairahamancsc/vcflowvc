import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { response, user } = { response: NextResponse.next(), user: null };

  // refreshed expires, auth token and user
  // const supabase = createClient()
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()


  const { pathname } = request.nextUrl;

  // Assume a mock cookie `auth-token` is set on login.
  // In a real app, you'd verify a JWT or session.
  const isAuthenticated = request.cookies.has('serviceflow-user-role');

  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
