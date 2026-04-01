import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const isProduction = process.env.NODE_ENV === "production";
  const useSSL = process.env.DATABASE_SSL === "true";

  const pool = new Pool({
    connectionString,
    // Only enable SSL when explicitly required (external DB providers like Supabase, Neon, etc.)
    // Dokploy / internal Docker databases do NOT need SSL
    ...(useSSL && { ssl: { rejectUnauthorized: false } }),
  });

  pool.on("error", (err) => console.error("PG Pool error:", err));

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["query", "error", "warn"],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
