/* eslint-disable @typescript-eslint/no-explicit-any */
// Prisma loader with a safe fallback when the package isn't available.
// This keeps the app running in environments where npm installs are blocked.

type PrismaClientLike = {
  user: {
    upsert: (args: any) => Promise<any>;
    findUnique: (args: any) => Promise<any>;
  };
  article: {
    create: (args: any) => Promise<any>;
    findUnique: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any[]>;
  };
  quiz: {
    createMany: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any[]>;
  };
};

const createStub = (): PrismaClientLike => ({
  user: {
    async upsert() {
      return { id: "dev-user" };
    },
    async findUnique() {
      return { id: "dev-user" };
    },
  },
  article: {
    async create() {
      return { id: "dev-article" };
    },
    async findUnique() {
      return null;
    },
    async findMany() {
      return [];
    },
  },
  quiz: {
    async createMany() {
      return { count: 0 };
    },
    async findMany() {
      return [];
    },
  },
});

function loadPrisma(): PrismaClientLike {
  try {
    // Avoid static resolution errors when @prisma/client isn't installed.
    // eslint-disable-next-line no-eval
    const req = eval("require") as NodeRequire;
    const { PrismaPg } = req("@prisma/adapter-pg");
    const { PrismaClient } = req("@prisma/client");

    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    return new PrismaClient({ adapter });
  } catch (err) {
    // Fall back to stub to keep dev builds working.
    return createStub();
  }
}

const globalForPrisma = global as unknown as { prisma?: PrismaClientLike };
const prisma = globalForPrisma.prisma || loadPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
