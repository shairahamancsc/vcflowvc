import { NextResponse, type NextRequest } from 'next/server'

// This is a mock middleware. In a real app with Supabase, this would handle session refreshing.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
