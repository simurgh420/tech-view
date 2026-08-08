import type { UserRole } from '@/app/generated/prisma/client';

const ROLE_RANK: Record<UserRole, number> = {
  USER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function canManageUser(
  actorRole: UserRole | string,
  targetRole: UserRole | string
): boolean {
  if (!(actorRole in ROLE_RANK) || !(targetRole in ROLE_RANK)) {
    return false;
  }

  return ROLE_RANK[actorRole as UserRole] > ROLE_RANK[targetRole as UserRole];
}
