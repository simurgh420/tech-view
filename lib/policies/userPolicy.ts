// lib/policies/userPolicy.ts

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function canViewUser(actor: any, targetId: string) {
  if (!actor) return false;
  if (actor.role === 'ADMIN') return true;
  return actor.id === targetId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function canEditUser(actor: any, targetId: string) {
  if (!actor) return false;
  if (actor.role === 'ADMIN') return true;
  return actor.id === targetId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function canChangeRole(actor: any) {
  return actor?.role === 'ADMIN';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function canDeleteUser(actor: any) {
  return actor?.role === 'ADMIN';
}
