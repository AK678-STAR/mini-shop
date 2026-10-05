import "server-only";
import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma Client với Query Logging để đo lường và chứng minh hiệu năng (Anti-N+1)
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { emit: "stdout", level: "query" },
      { emit: "stdout", level: "error" },
      { emit: "stdout", level: "warn" },
    ],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
