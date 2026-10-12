import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, env } from "./db";
import { allowedEmail, atLeast, normEmail, signSession, verifySession, type Role } from "./rules";

export const SESSION_COOKIE = "vs";
const DAYS = 30;

export async function startSession(uid: string) {
  const exp = Date.now() + DAYS * 864e5;
  (await cookies()).set(SESSION_COOKIE, signSession({ uid, exp }, env("SESSION_SECRET")), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

// The role is read from the database on every request, so revoking access works immediately.
export const getUser = cache(async () => {
  const s = verifySession((await cookies()).get(SESSION_COOKIE)?.value, env("SESSION_SECRET"));
  return s ? db.user.findUnique({ where: { id: s.uid }, include: { member: true } }) : null;
});
export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;

export async function requireUser(next = "/portal"): Promise<CurrentUser> {
  const u = await getUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(next)}`);
  return u;
}

export async function requireRole(min: Role, next?: string): Promise<CurrentUser> {
  const u = await requireUser(next);
  if (!atLeast(u.role, min)) redirect("/portal?error=" + encodeURIComponent("You don't have access to that page."));
  return u;
}

// ---- Google OAuth (D17) ----

const redirectUri = () => `${env("APP_URL")}/auth/callback`;

export function googleAuthUrl(state: string) {
  const p = new URLSearchParams({
    client_id: env("GOOGLE_CLIENT_ID"), redirect_uri: redirectUri(), response_type: "code",
    scope: "openid email profile", state, hd: env("ALLOWED_DOMAIN"), prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

export async function googleProfile(code: string) {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      code, client_id: env("GOOGLE_CLIENT_ID"), client_secret: env("GOOGLE_CLIENT_SECRET"),
      redirect_uri: redirectUri(), grant_type: "authorization_code",
    }),
  });
  if (!r.ok) throw new Error(`Google token exchange failed (${r.status})`);
  const { id_token } = (await r.json()) as { id_token: string };
  // The token came straight from Google over TLS in exchange for our client secret,
  // so per Google's OpenID docs its signature needn't be re-verified. We still check the audience.
  const c = JSON.parse(Buffer.from(id_token.split(".")[1], "base64url").toString());
  if (c.aud !== env("GOOGLE_CLIENT_ID")) throw new Error("ID token audience mismatch");
  return { email: String(c.email), verified: c.email_verified === true, name: String(c.name ?? c.email), picture: c.picture as string | undefined };
}

// Creates or updates the user. Returns null when the address isn't allowed.
export async function signIn(p: { email: string; verified: boolean; name: string; picture?: string }) {
  const email = normEmail(p.email);
  if (!p.verified || !allowedEmail(email, env("ALLOWED_DOMAIN"))) return null;
  const owners = (process.env.OWNER_EMAILS ?? "").split(",").map(normEmail);
  const user = await db.user.upsert({
    where: { email },
    create: { email, name: p.name, image: p.picture, lastLogin: new Date(), role: owners.includes(email) ? "owner" : "student" },
    update: { name: p.name, image: p.picture, lastLogin: new Date() },
  });
  if (owners.includes(email) && user.role !== "owner") await db.user.update({ where: { id: user.id }, data: { role: "owner" } });
  return user.id;
}

export const safeNext = (n: string | null | undefined) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/portal");
