// app/api/auth/register/route.ts

import { registerUser } from '@/services/auth/usecases/register';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await registerUser(body);

    if (!result.ok) {
      const status =
        result.code === 'INVALID_INPUT' ? 400 : result.code === 'USER_EXISTS' ? 409 : 500;
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status }
      );
    }
    return NextResponse.json(
      { success: true, data: result.data, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    // Replace with a real logger (pino, Sentry) in production
    console.error('POST /api/auth/register error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
