
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define paths that are public and don't require any authentication
const publicPaths = ['/login', '/signup'];
const customerPaths = ['/', '/portal', '/api/client-logout'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname } = request.nextUrl;
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname.endsWith('favicon.ico');
  const isCustomerPath = customerPaths.includes(pathname);

  // If it's a public path that doesn't need any auth check, let it go.
  if (isPublicPath) {
    return response;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value,
      set: (name: string, value: string, options) => {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove: (name: string, options) => {
        request.cookies.set({ name, value: '', ...options });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // Check for admin/technician session for non-public, non-customer paths
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!isCustomerPath) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // If user is logged in but tries to access login page, redirect to dashboard
    if (session && pathname === '/login') {
       return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // Handle customer portal paths
  if (isCustomerPath) {
    const clientId = request.cookies.get('client_id')?.value;
    
    // If trying to access portal without being logged in, redirect to customer login
    if (pathname.startsWith('/portal') && !clientId) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // If logged in as customer and trying to access root login, redirect to portal
    if (pathname === '/' && clientId) {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
