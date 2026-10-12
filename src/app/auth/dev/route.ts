import { redirect } from "next/navigation";
import { safeNext, signIn, startSession } from "@/lib/auth";

// Local development only: sign in as any allowed address without Google. Off in production, always.
export async function POST(req: Request) {
  if (process.env.DEV_LOGIN !== "1" || process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const fd = await req.formData();
  const email = String(fd.get("email") ?? "");
  const uid = await signIn({ email, verified: true, name: email.split("@")[0].split(/[._]/).filter((w) => w !== "uset").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ") || email });
  if (!uid) redirect("/login?error=domain");
  await startSession(uid);
  redirect(safeNext(String(fd.get("next") ?? "")));
}
