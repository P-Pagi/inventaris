import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
    try {
        const dbPath = path.resolve(process.cwd(), "dev.db");
        const connectionString = `file:${dbPath}`;

        console.log("[Prisma] Initializing client with dbPath:", dbPath);

        // Ensure environment variable is set for internal Prisma checks
        process.env.DATABASE_URL = connectionString;

        const adapter = new PrismaBetterSqlite3({ url: dbPath });

        const client = new PrismaClient({
            adapter,
            log: ["query", "info", "warn", "error"],
        });

        console.log("[Prisma] Client initialized successfully");
        return client;
    } catch (error) {
        console.error("[Prisma] Error during initialization:", error);
        throw error;
    }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
