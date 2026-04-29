import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

const statements = {
  ...defaultStatements,
  posts: ['create', 'read', 'update', 'delete', 'update:own', 'delete:own'],
  brands: ['create', 'update', 'delete'],
  categories: ['create', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statements);

export const roles = {
  USER: ac.newRole({
    posts: ['create', 'read', 'update:own', 'delete:own'],
  }),

  ADMIN: ac.newRole({
    posts: ['create', 'read', 'update', 'delete', 'update:own', 'delete:own'],
    brands: ['create', 'update', 'delete'],
    categories: ['create', 'update', 'delete'],
    ...adminAc.statements,
  }),
};
