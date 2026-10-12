import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { act, FormError, text } from "@/lib/form";
import Flash, { sp, type PageProps } from "@/components/Flash";

export const metadata = { title: "Request a photo removal" };

// Anyone may ask, signed in or not (PRD F4). Admins must act within 72 hours.
async function requestRemoval(fd: FormData) {
  "use server";
  const id = String(fd.get("media") ?? "").match(/\bc[a-z0-9]{20,30}\b/)?.[0] ?? ""; // a bare id or any link containing one
  return act(`/removal?m=${encodeURIComponent(id)}`, async () => {
    if (fd.get("website")) redirect("/"); // honeypot: bots fill every field
    const media = id && (await db.media.findUnique({ where: { id }, select: { id: true } }));
    if (!media) throw new FormError("We couldn't find that photo. Paste the link of the photo page or image.");
    const email = text(fd, "email", { label: "Email", max: 200 });
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new FormError("Enter an email address we can reply to.");
    await db.removalRequest.create({ data: { mediaId: media.id, email, reason: text(fd, "reason", { label: "Reason", max: 1000 }) } });
    return "Request received. An admin will review it within 72 hours.";
  });
}

export default async function Removal({ searchParams }: PageProps) {
  const [p, user] = await Promise.all([searchParams, getUser()]);
  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">Privacy</span>
        <h1 className="h-page">Request a photo removal</h1>
        <p className="prose">If you appear in a photo on this site and want it taken down, tell us here. You don&apos;t need an account. Admins review every request within 72 hours.</p>
      </div>
      <Flash searchParams={searchParams} />
      <form action={requestRemoval} className="form">
        <label className="field"><span>Photo</span><input name="media" required defaultValue={sp(p.m)} placeholder="Photo link or ID" /><small>Open the photo and use “Request removal”, or paste its link.</small></label>
        <label className="field"><span>Your email</span><input name="email" type="email" required defaultValue={user?.email} /></label>
        <label className="field"><span>Reason</span><textarea name="reason" required maxLength={1000} placeholder="I'm the person on the left and don't want this photo public." /></label>
        <input name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
        <button className="pill" style={{ justifySelf: "start" }}>Send request</button>
      </form>
    </div>
  );
}
