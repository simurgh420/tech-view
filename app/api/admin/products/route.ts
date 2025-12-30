//app/api/admin/products/route.ts

import { auth } from '@/lib/auth';
import { withAuthUser } from '@/lib/auth-user';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await auth.api.getSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = withAuthUser(session.user);
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({ message: 'Admin access granted' });
}
