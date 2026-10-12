import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { googleAuthUrl, safeNext } from "@/lib/auth";

export async function GET(req: Request) {
  const state = randomBytes(16).toString("hex");
  const next = safeNext(new URL(req.url).searchParams.get("next"));
  (await cookies()).set("vs_state", `${state}|${next}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/auth", maxAge: 600 });
  redirect(googleAuthUrl(state));
}
