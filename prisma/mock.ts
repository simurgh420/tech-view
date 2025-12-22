const mockPrisma = {
  blogPost: {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    count: async () => 0,
  },
  tag: { findMany: async () => [], findUnique: async () => null },
  comment: { findMany: async () => [], findUnique: async () => null },
};
export default mockPrisma;
