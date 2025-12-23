
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define paths that are public and don't require any authentication
const publicPaths = ['/login', '/signup', '/clients/signup'];
const customerPaths = ['/', '/portal'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname } = request.nextUrl;
  
  // Allow Vercel-specific paths and static assets to pass through
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname.endsWith('.ico') || pathname.endsWith('.png') || pathname.endsWith('.svg')) {
    return response;
  }

  const isPublicPath = publicPaths.includes(pathname);
  const isCustomerPath = customerPaths.includes(pathname);
  
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

  const { data: { session } } = await supabase.auth.getSession();
  const clientId = request.cookies.get('client_id')?.value;

  // If it's a public path, anyone can access it.
  if (isPublicPath) {
     // If a logged-in staff member tries to access a public auth page, redirect them to the dashboard
    if (session && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }
  
  // Customer portal paths
  if (isCustomerPath) {
    if (pathname.startsWith('/portal') && !clientId) {
      // Not a logged-in customer, redirect to customer login
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname === '/' && clientId) {
      // Logged-in customer trying to access root, redirect to their portal
      return NextResponse.redirect(new URL('/portal', request.url));
    }
    return response;
  }
  
  // All other paths are considered protected staff/admin paths.
  // If there's no staff session, redirect to the staff login page.
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
