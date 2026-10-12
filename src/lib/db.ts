import { PrismaClient } from "@prisma/client";

// One client per server process (dev hot-reload would otherwise open a new pool each save).
const g = globalThis as unknown as { db?: PrismaClient };
export const db = g.db ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.db = db;

export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return v;
}
