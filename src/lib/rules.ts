// Pure rules: no I/O, no framework imports, so `node --test` can check them directly.
import { createHmac, timingSafeEqual } from "node:crypto";

export type Role = "student" | "member" | "admin" | "owner";
const RANK: Record<Role, number> = { student: 0, member: 1, admin: 2, owner: 3 };
export const atLeast = (role: Role | undefined, min: Role) => role !== undefined && RANK[role] >= RANK[min];

export const normEmail = (email: string) => email.trim().toLowerCase();
export const allowedEmail = (email: string, domain: string) => normEmail(email).endsWith("@" + domain.toLowerCase());
export const isUset = (email: string, suffix: string) => normEmail(email).endsWith(suffix.toLowerCase());

// Upload limits (PRD F4). HEIC is left out on purpose: iOS converts to JPEG when the picker doesn't accept it (D23).
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const VIDEO_TYPES = ["video/mp4", "video/quicktime"];
export const MAX_IMAGE = 25 * 1024 * 1024;
export const MAX_VIDEO = 50 * 1024 * 1024;
export const ACCEPT = [...IMAGE_TYPES, ...VIDEO_TYPES].join(",");

export function checkUpload(type: string, size: number): string | null {
  if (IMAGE_TYPES.includes(type)) return size > MAX_IMAGE ? "Photos can be up to 25 MB." : null;
  if (VIDEO_TYPES.includes(type)) return size > MAX_VIDEO ? "Video clips can be up to 50 MB. Add longer videos as a link." : null;
  return "Only JPEG, PNG, WebP, MP4 and MOV files can be uploaded.";
}

export function slugify(title: string, date: Date): string {
  const base = title.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").slice(0, 60);
  const year = String(date.getUTCFullYear());
  return base.endsWith(year) ? base : `${base || "event"}-${year}`;
}

// Accepts a bare folder ID or any Drive folder URL.
export function driveFolderId(input: string): string | null {
  const s = input.trim();
  const m = s.match(/folders\/([\w-]{10,})/) ?? s.match(/[?&]id=([\w-]{10,})/);
  if (m) return m[1];
  return /^[\w-]{10,}$/.test(s) ? s : null;
}

// Session token: base64url(json) + "." + base64url(hmac). Holds only the user id and expiry.
export type Session = { uid: string; exp: number };
const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const mac = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest();

export function signSession(s: Session, secret: string): string {
  const body = b64(JSON.stringify(s));
  return `${body}.${b64(mac(body, secret))}`;
}

export function verifySession(token: string | undefined, secret: string, now = Date.now()): Session | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = mac(body, secret);
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    return typeof s.uid === "string" && s.exp > now ? s : null;
  } catch {
    return null;
  }
}

// Who may see a media file (docs/ARCHITECTURE.md, "Media delivery").
export type MediaView = {
  status: string;
  eventPublic: boolean;
  eventArchived: boolean;
  uploaderId: string;
};
export function canSeeMedia(m: MediaView, viewer: { id: string; role: Role } | null): "public" | "private" | false {
  if (viewer && atLeast(viewer.role, "admin")) return "private";
  if (m.status === "approved") {
    if (m.eventPublic && !m.eventArchived) return "public";
    if (viewer && atLeast(viewer.role, "member")) return "private";
  }
  return viewer && viewer.id === m.uploaderId ? "private" : false;
}
