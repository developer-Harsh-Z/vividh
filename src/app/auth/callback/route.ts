import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { googleProfile, safeNext, signIn, startSession } from "@/lib/auth";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const jar = await cookies();
  const [state, next] = (jar.get("vs_state")?.value ?? "").split("|");
  jar.delete({ name: "vs_state", path: "/auth" });
  if (!state || state !== q.get("state")) redirect("/login?error=state");
  const code = q.get("code");
  if (!code) redirect("/login?error=google");

  let uid: string | null;
  try {
    uid = await signIn(await googleProfile(code));
  } catch (e) {
    console.error("Google sign-in failed", e);
    redirect("/login?error=google");
  }
  if (!uid) redirect("/login?error=domain");
  await startSession(uid);
  redirect(safeNext(next));
}
