// app/api/users/route.ts

import { createUser } from '@/services/users/db/mutations';
import { getUsers } from '@/services/users/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await getUsers();
  return NextResponse.json(users);
}
export async function POST(req: Request) {
  const body = await req.json();
  const user = await createUser(body);
  return NextResponse.json(user);
}
