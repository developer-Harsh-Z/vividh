import { db } from "@/lib/db";

// For uptime monitors: 200 when the app can reach the database.
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
