// types/user.ts

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

export interface UserPayload {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role?: UserRole;
}
