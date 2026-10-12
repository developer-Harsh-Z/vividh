import { AwsClient } from "aws4fetch";
import { env } from "./db";

// S3 API over plain fetch (D20). Path-style URLs work for Cloudflare R2 and MinIO alike.
const client = () => new AwsClient({
  accessKeyId: env("S3_ACCESS_KEY"), secretAccessKey: env("S3_SECRET_KEY"), service: "s3", region: process.env.S3_REGION || "auto",
});
const url = (key: string, base = env("S3_ENDPOINT")) => `${base}/${env("S3_BUCKET")}/${key}`;

async function ok(res: Response, what: string) {
  if (!res.ok) throw new Error(`Storage ${what} failed: ${res.status} ${await res.text().catch(() => "")}`.slice(0, 300));
  return res;
}

// Presigned PUT the browser uploads to directly; expires in 15 minutes.
// S3_PUBLIC_ENDPOINT is the address browsers use when it differs from the server's (e.g. Docker: minio:9000 vs a public host).
export async function uploadUrl(key: string, type: string) {
  const req = new Request(`${url(key, process.env.S3_PUBLIC_ENDPOINT || env("S3_ENDPOINT"))}?X-Amz-Expires=900`, { method: "PUT", headers: { "content-type": type } });
  return (await client().sign(req, { aws: { signQuery: true } })).url;
}

// Pass a Range header through so videos can stream and seek (Safari requires it).
export const getObject = async (key: string, range?: string | null) =>
  ok(await client().fetch(url(key), range ? { headers: { range } } : undefined), "get");

export async function putObject(key: string, body: Uint8Array, type: string) {
  await ok(await client().fetch(url(key), { method: "PUT", body: new Uint8Array(body), headers: { "content-type": type } }), "put");
}

export async function objectSize(key: string): Promise<number | null> {
  const res = await client().fetch(url(key), { method: "HEAD" });
  return res.ok ? Number(res.headers.get("content-length")) : null;
}

export async function deleteObject(key: string) {
  const res = await client().fetch(url(key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) await ok(res, "delete");
}
