import { UserRole } from '@/app/generated/prisma/enums';

export type AuthRole = 'admin' | 'user';

export function toAuthRole(role: UserRole): AuthRole {
  switch (role) {
    case UserRole.ADMIN:
      return 'admin';
    case UserRole.USER:
      return 'user';
  }
}

export function fromAuthRole(role: AuthRole): UserRole {
  switch (role) {
    case 'admin':
      return UserRole.ADMIN;
    case 'user':
      return UserRole.USER;
  }
}
