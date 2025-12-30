// middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// user در session + attributes
type ExtendedUser = { role?: 'ADMIN' | 'USER'; avatar?: string | null };

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession(request);

  const url = request.nextUrl.pathname;

  // مسیرهای عمومی
  const publicRoutes = ['/', '/login', '/register', '/products', '/blog'];
  if (publicRoutes.includes(url)) return NextResponse.next();

  // اگر اصلاً session نداریم و مسیر محافظت‌شده‌ست → redirect
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // اینجا به TS می‌گیم user همون AuthUser ـه
  const user = { ...session.user, ...(session.user as ExtendedUser) };

  // مسیرهای فقط ADMIN
  const adminRoutes = ['/admin', '/admin/dashboard', '/admin/products'];
  const isAdminRoute = adminRoutes.some(route => url.startsWith(route));

  if (isAdminRoute) {
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
