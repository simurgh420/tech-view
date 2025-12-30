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

export type AppUser = {
  id: string;
  name: string | null;
  email: string;
  password: string | null;
  avatar: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
