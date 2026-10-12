import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { canSeeMedia, atLeast } from "@/lib/rules";
import * as storage from "@/lib/storage";
import * as drive from "@/lib/drive";

// Permission-checked file delivery (D21). Public approved files get cache headers so Cloudflare serves repeats.
export async function GET(req: Request, { params }: { params: Promise<{ id: string; size: string }> }) {
  const { id, size } = await params;
  const [m, user] = await Promise.all([
    db.media.findUnique({ where: { id }, include: { event: { select: { visibility: true, archivedAt: true } } } }),
    getUser(),
  ]);
  if (!m) return new Response("Not found", { status: 404 });
  const access = canSeeMedia({ status: m.status, eventPublic: m.event.visibility === "public", eventArchived: !!m.event.archivedAt, uploaderId: m.uploaderId }, user);
  if (!access) return new Response("Not found", { status: 404 });

  // Browsers keep public files 1 h (so takedowns stick quickly); the CDN keeps them a day and can be purged.
  const cache = access === "public" ? "public, max-age=3600, s-maxage=86400" : "private, no-store";
  const headers = (type: string) => ({ "content-type": type, "cache-control": cache, "x-content-type-options": "nosniff" });

  if (size === "original") {
    if (!atLeast(user?.role, "member") && user?.id !== m.uploaderId) return new Response("Not found", { status: 404 });
    if (m.originalKey) return proxy(await storage.getObject(m.originalKey), headers(m.mime ?? "application/octet-stream"));
    if (m.driveFileId && drive.driveEnabled()) return new Response(new Uint8Array(await drive.download(m.driveFileId)), { headers: headers(m.mime ?? "image/jpeg") });
    return new Response("Not found", { status: 404 });
  }
  const key = size === "thumb" ? (m.thumbKey ?? m.displayKey) : size === "display" ? m.displayKey : null;
  if (!key) return new Response("Not found", { status: 404 });
  return proxy(await storage.getObject(key, req.headers.get("range")), headers(m.kind === "video" ? (m.mime ?? "video/mp4") : "image/webp"));
}

function proxy(res: Response, headers: Record<string, string>) {
  const out = new Headers(headers);
  for (const h of ["content-length", "content-range", "accept-ranges", "etag"]) {
    const v = res.headers.get(h);
    if (v) out.set(h, v);
  }
  return new Response(res.body, { status: res.status, headers: out });
}
