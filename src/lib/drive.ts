import { createSign } from "node:crypto";
import { env } from "./db";

// Google Drive through a service account (D22): the club shares event folders with its email.
const API = "https://www.googleapis.com/drive/v3";
export const driveEnabled = () => Boolean(process.env.DRIVE_SA_EMAIL && process.env.DRIVE_SA_KEY);

let cached: { token: string; exp: number } | null = null;

async function token() {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({
    iss: env("DRIVE_SA_EMAIL"), scope: "https://www.googleapis.com/auth/drive",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(env("DRIVE_SA_KEY").replace(/\\n/g, "\n"), "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  if (!r.ok) throw new Error(`Drive auth failed (${r.status})`);
  const j = (await r.json()) as { access_token: string; expires_in: number };
  cached = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return cached.token;
}

async function call(url: string, init: RequestInit = {}) {
  const r = await fetch(url, { ...init, headers: { ...init.headers, Authorization: `Bearer ${await token()}` } });
  if (!r.ok) throw new Error(`Drive request failed (${r.status}): ${(await r.text()).slice(0, 200)}`);
  return r;
}

export type DriveFile = { id: string; name: string; mimeType: string; size?: string };

// Photos and videos directly inside a folder (not subfolders).
export async function listFolder(folderId: string): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken = "";
  do {
    const q = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`,
      fields: "nextPageToken, files(id, name, mimeType, size)", pageSize: "1000",
      supportsAllDrives: "true", includeItemsFromAllDrives: "true", ...(pageToken && { pageToken }),
    });
    const j = (await (await call(`${API}/files?${q}`)).json()) as { files: DriveFile[]; nextPageToken?: string };
    files.push(...j.files);
    pageToken = j.nextPageToken ?? "";
  } while (pageToken);
  return files;
}

export async function download(fileId: string) {
  return Buffer.from(await (await call(`${API}/files/${fileId}?alt=media&supportsAllDrives=true`)).arrayBuffer());
}

// Service accounts have no storage of their own, so the target folder must be in a Shared Drive.
export async function upload(folderId: string, name: string, type: string, data: Uint8Array): Promise<string> {
  const b = `vividh${Date.now()}`;
  const body = Buffer.concat([
    Buffer.from(`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: [folderId] })}\r\n--${b}\r\nContent-Type: ${type}\r\n\r\n`),
    data,
    Buffer.from(`\r\n--${b}--`),
  ]);
  const r = await call("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id", {
    method: "POST", headers: { "Content-Type": `multipart/related; boundary=${b}` }, body,
  });
  return ((await r.json()) as { id: string }).id;
}
