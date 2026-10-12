"use server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkUpload } from "@/lib/rules";
import { uploadableEvents } from "@/lib/queries";
import { uploadUrl, objectSize, deleteObject } from "@/lib/storage";
import { processMedia } from "@/lib/media";
import { act, FormError, link, parseTags, text } from "@/lib/form";

const MAX_PER_HOUR = 300;
const clean = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);

type Req = { eventId: string; caption: string; altText: string; tags: string; files: { name: string; type: string; size: number }[] };

// Step 1 of the upload pipeline: check permission and limits, create rows, hand back presigned PUT URLs.
export async function requestUploads(input: Req): Promise<{ items: { id: string; url: string }[] } | { error: string }> {
  const user = await requireUser("/portal/upload");
  const events = await uploadableEvents(user);
  if (!events.some((e) => e.id === input?.eventId)) return { error: "You can't upload to that event." };
  const files = Array.isArray(input.files) ? input.files : [];
  if (files.length < 1 || files.length > 100) return { error: "Choose between 1 and 100 files at a time." };
  for (const f of files) {
    const err = checkUpload(String(f?.type), Number(f?.size));
    if (err) return { error: `${clean(f?.name, 80)}: ${err}` };
  }
  const recent = await db.media.count({ where: { uploaderId: user.id, createdAt: { gt: new Date(Date.now() - 3600_000) } } });
  if (recent + files.length > MAX_PER_HOUR) return { error: `You can upload up to ${MAX_PER_HOUR} files an hour. Try again later.` };

  const tags = parseTags(clean(input.tags, 500));
  const items = [];
  for (const f of files) {
    const key = `o/${randomUUID()}`;
    const m = await db.media.create({
      data: {
        eventId: input.eventId, uploaderId: user.id, kind: f.type.startsWith("video/") ? "video" : "image", mime: f.type,
        originalKey: key, caption: clean(input.caption), altText: clean(input.altText), tags, sizeBytes: Number(f.size),
      },
    });
    items.push({ id: m.id, url: await uploadUrl(key, f.type) });
  }
  return { items };
}

// Step 3: the phone says the PUT finished. Check what actually arrived, then process it.
export async function confirmUpload(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const m = await db.media.findUnique({ where: { id: String(id) } });
  if (!m || m.uploaderId !== user.id || m.status !== "uploading" || !m.originalKey) return { ok: false, error: "Upload not found." };
  const size = await objectSize(m.originalKey);
  const err = size === null ? "The file didn't reach storage. Try again." : checkUpload(m.mime ?? "", size);
  if (err) {
    await deleteObject(m.originalKey);
    await db.media.delete({ where: { id: m.id } });
    return { ok: false, error: err };
  }
  await db.media.update({ where: { id: m.id }, data: { status: "processing", sizeBytes: size } });
  await processMedia(m.id); // failures stay `processing` and the cron retries them
  return { ok: true };
}

export async function addLink(fd: FormData) {
  return act("/portal/upload", async () => {
    const user = await requireUser("/portal/upload");
    const eventId = String(fd.get("eventId"));
    if (!(await uploadableEvents(user)).some((e) => e.id === eventId)) throw new FormError("You can't add links to that event.");
    const url = link(fd, "url", "Video link");
    if (!url) throw new FormError("Paste the video link.");
    await db.media.create({ data: { eventId, uploaderId: user.id, kind: "link", source: "upload", url, caption: text(fd, "caption", { label: "Title", max: 200 }), status: "pending" } });
    return "Link sent for approval.";
  });
}

// Uploaders may delete their own files until an admin approves them (PRD F4).
export async function deleteMyUpload(fd: FormData) {
  return act("/portal", async () => {
    const user = await requireUser();
    const m = await db.media.findUnique({ where: { id: String(fd.get("id")) } });
    if (!m || m.uploaderId !== user.id) throw new FormError("Upload not found.");
    if (m.status === "approved") throw new FormError("This item is already approved. Ask an admin to remove it.");
    await Promise.all([m.originalKey, m.displayKey, m.thumbKey].filter((k): k is string => !!k).map(deleteObject));
    await db.media.delete({ where: { id: m.id } });
    return "Deleted.";
  });
}
