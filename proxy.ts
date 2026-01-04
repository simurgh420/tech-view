import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
