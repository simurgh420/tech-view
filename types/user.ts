// types/user.ts

export type UserRole = 'ADMIN' | 'USER';
export type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  role: UserRole;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
};

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
export type RegisterResponse = {
  success: boolean;
  data?: { id: string; email: string; name: string };
  error?: string;
  code?: string;
};
