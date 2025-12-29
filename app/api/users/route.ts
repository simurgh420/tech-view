// app/api/users/route.ts

import { createUser } from '@/services/users/db/mutations';
import { getUsers } from '@/services/users/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/users Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load users' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('POST /api/users Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create user' }, { status: 500 });
  }
}
