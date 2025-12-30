// app/api/auth/[...better-auth]/route.ts
export const runtime = 'nodejs';
import { auth } from '@/lib/auth';

export const handler = auth.handler;
