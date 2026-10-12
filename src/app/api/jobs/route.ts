import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/db";
import { processPending } from "@/lib/media";

export const maxDuration = 60;

// Called every 15 minutes by .github/workflows/jobs.yml with `Authorization: Bearer $CRON_SECRET`.
export async function GET(req: Request) {
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${env("CRON_SECRET")}`);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return new Response("Unauthorized", { status: 401 });
  return Response.json(await processPending());
}
