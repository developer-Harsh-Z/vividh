import sharp from "sharp";
import { db } from "./db";
import * as storage from "./storage";
import * as drive from "./drive";

const MAX_ATTEMPTS = 3;

// Turns a `processing` row into a reviewable `pending` one (docs/ARCHITECTURE.md, "Upload pipeline").
export async function processMedia(id: string) {
  const m = await db.media.findUnique({ where: { id } });
  if (!m || m.status !== "processing") return;
  try {
    const original = m.source === "drive"
      ? await drive.download(m.driveFileId!)
      : Buffer.from(await (await storage.getObject(m.originalKey!)).arrayBuffer());

    if (m.kind === "video") {
      // Clips are served as uploaded; no transcoding in v1.
      await db.media.update({ where: { id }, data: { status: "pending", displayKey: m.originalKey, error: null } });
      return;
    }

    // rotate() applies the EXIF orientation; sharp writes no metadata by default, so GPS and camera data are dropped.
    const img = sharp(original, { failOn: "error" }).rotate();
    const [display, thumb] = await Promise.all([
      img.clone().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true }),
      img.clone().resize(480, 480, { fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toBuffer(),
    ]);
    const displayKey = `d/${id}.webp`, thumbKey = `t/${id}.webp`;
    await Promise.all([storage.putObject(displayKey, display.data, "image/webp"), storage.putObject(thumbKey, thumb, "image/webp")]);

    // Phone-upload originals move to the club Drive folder (D8); without Drive they stay in the bucket.
    let { driveFileId, originalKey } = m;
    const folder = process.env.DRIVE_UPLOAD_FOLDER_ID;
    if (m.source === "upload" && folder && drive.driveEnabled() && originalKey) {
      driveFileId = await drive.upload(folder, `${m.eventId}-${id}`, m.mime ?? "image/jpeg", original);
      await storage.deleteObject(originalKey);
      originalKey = null;
    }
    await db.media.update({
      where: { id },
      data: { status: "pending", displayKey, thumbKey, driveFileId, originalKey, width: display.info.width, height: display.info.height, error: null },
    });
  } catch (e) {
    const attempts = m.attempts + 1;
    await db.media.update({
      where: { id },
      data: { attempts, status: attempts >= MAX_ATTEMPTS ? "failed" : "processing", error: String(e).slice(0, 500) },
    });
  }
}

// Called by the cron route: retries stuck items and clears abandoned uploads.
// ponytail: sequential within one request; for 5,000-file fest drops run this in a loop in a worker container.
export async function processPending(budgetMs = 50_000) {
  const start = Date.now();
  await db.media.deleteMany({ where: { status: "uploading", createdAt: { lt: new Date(Date.now() - 864e5) } } });
  const due = await db.media.findMany({
    where: { status: "processing", attempts: { lt: MAX_ATTEMPTS }, updatedAt: { lt: new Date(Date.now() - 60_000) } },
    select: { id: true }, orderBy: { updatedAt: "asc" }, take: 200,
  });
  let done = 0;
  for (const { id } of due) {
    if (Date.now() - start > budgetMs) break;
    await processMedia(id);
    done++;
  }
  return { done, waiting: due.length - done };
}
