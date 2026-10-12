import { redirect } from "next/navigation";
import { getUser, safeNext } from "@/lib/auth";
import { sp, type PageProps } from "@/components/Flash";

export const metadata = { title: "Login" };

const ERRORS: Record<string, string> = {
  domain: "Sign in with your @ltsu.ac.in college account. Personal Gmail accounts can't be used.",
  state: "Your sign-in expired. Please try again.",
  google: "Google sign-in didn't complete. Please try again.",
};

export default async function Login({ searchParams }: PageProps) {
  const p = await searchParams;
  const next = safeNext(sp(p.next));
  if (await getUser()) redirect(next);
  const dev = process.env.DEV_LOGIN === "1" && process.env.NODE_ENV !== "production";
  const error = ERRORS[sp(p.error)];

  return (
    <div className="wrap page" style={{ maxWidth: 560 }}>
      <div className="stack">
        <span className="eyebrow">VIVIDH portal</span>
        <h1 className="h-page">Login with <em>LTSU</em></h1>
        <p className="prose">Use your college Google account (@ltsu.ac.in). Members upload media and edit their profiles; USET students can apply during recruitment.</p>
      </div>
      {error && <p className="flash error" role="alert">{error}</p>}
      <a className="pill" href={`/auth/google?next=${encodeURIComponent(next)}`} style={{ justifySelf: "start" }}>Continue with Google <span className="arr">→</span></a>
      {dev && (
        <form action="/auth/dev" method="post" className="form" style={{ borderTop: "1px dashed var(--rule)", paddingTop: 20 }}>
          <span className="label">Development only: sign in without Google</span>
          <input type="hidden" name="next" value={next} />
          <label className="field"><span>Email</span><input name="email" type="email" required defaultValue="president.uset@ltsu.ac.in" /></label>
          <button className="pill ghost" style={{ justifySelf: "start" }}>Dev sign-in</button>
        </form>
      )}
    </div>
  );
}
