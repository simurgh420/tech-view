import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

const statements = {
  ...defaultStatements,
  posts: ['create', 'read', 'update', 'delete', 'update:own', 'delete:own'],
  brands: ['create', 'update', 'delete'],
  categories: ['create', 'read', 'update', 'delete'],
  comments: ['create', 'read', 'update', 'update:own', 'delete:own', 'delete'],
  contacts: ['read', 'delete'],
  products: ['create', 'read', 'update', 'delete'],
  reviews: ['create', 'read', 'update', 'update:own', 'delete:own', 'delete'],
  wishlist: ['create', 'read', 'delete:own', 'delete'],
  productComments: ['create', 'read', 'update', 'update:own', 'delete', 'delete:own', 'moderate'],
} as const;

export const ac = createAccessControl(statements);

export const roles = {
  USER: ac.newRole({
    posts: ['create', 'read', 'update:own', 'delete:own'],
    comments: ['create', 'update:own', 'delete:own'],
    products: ['read'],
    reviews: ['create', 'update:own', 'delete:own'],
    wishlist: ['create', 'read', 'delete:own'],
    productComments: ['create', 'read', 'update:own', 'delete:own'],
  }),

  ADMIN: ac.newRole({
    posts: ['create', 'read', 'update', 'delete', 'update:own', 'delete:own'],
    brands: ['create', 'update', 'delete'],
    categories: ['create', 'read', 'update', 'delete'],
    comments: ['create', 'read', 'update', 'delete', 'update:own', 'delete:own'],
    products: ['create', 'read', 'update', 'delete'],
    contacts: ['read', 'delete'],
    reviews: ['create', 'read', 'update', 'delete', 'update:own', 'delete:own'],
    wishlist: ['create', 'read', 'delete', 'delete:own'],
    productComments: ['create', 'read', 'update', 'update:own', 'delete', 'delete:own', 'moderate'],
    ...adminAc.statements,
  }),
  SUPER_ADMIN: ac.newRole({
    posts: ['create', 'read', 'update', 'delete', 'update:own', 'delete:own'],

    brands: ['create', 'update', 'delete'],

    categories: ['create', 'read', 'update', 'delete'],

    comments: ['create', 'read', 'update', 'delete', 'update:own', 'delete:own'],

    products: ['create', 'read', 'update', 'delete'],

    contacts: ['read', 'delete'],

    reviews: ['create', 'read', 'update', 'delete', 'update:own', 'delete:own'],

    wishlist: ['create', 'read', 'delete', 'delete:own'],

    productComments: ['create', 'read', 'update', 'update:own', 'delete', 'delete:own', 'moderate'],

    ...adminAc.statements,
  }),
};
