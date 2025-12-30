// app/api/auth/[...better-auth]/route.ts
import { auth } from '@/lib/auth';

export const handler = auth.handler;
