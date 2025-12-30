//app/api/auth/register/route.ts

import prisma from '@/services/db/client';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (!existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    const hashed = await hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
