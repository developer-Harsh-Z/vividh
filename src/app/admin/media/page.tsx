import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fmtDate } from "@/lib/teams";
import Flash, { sp, type PageProps } from "@/components/Flash";
import { approveAll, reviewMedia } from "../actions";

export const metadata = { title: "Media queue" };

export default async function MediaQueue({ searchParams }: PageProps) {
  await requireRole("admin"); // layouts don't re-run on client navigation, so every admin page checks too
  const p = await searchParams;
  const status = ["pending", "failed", "processing"].includes(sp(p.status)) ? sp(p.status) : "pending";
  const items = await db.media.findMany({
    where: { status: status as "pending" | "failed" | "processing" }, orderBy: { createdAt: "asc" }, take: 60,
    include: { event: { select: { title: true, slug: true, visibility: true } }, uploader: { select: { name: true, email: true } } },
  });

  return (
    <>
      <div className="row between">
        <h1 className="h-page">Media queue</h1>
        <div className="chips">{["pending", "processing", "failed"].map((s) => <Link key={s} className={`chip${s === status ? " on" : ""}`} href={`/admin/media?status=${s}`}>{s}</Link>)}</div>
      </div>
      <Flash searchParams={searchParams} />
      {items.length === 0 ? <div className="empty"><b>Nothing here.</b><span>New uploads appear here before they go live.</span></div> : (
        <>
          {status === "pending" && (
            <form action={approveAll} className="row">
              {items.map((m) => <input key={m.id} type="hidden" name="ids" value={m.id} />)}
              <button className="pill small">Approve all {items.length} shown</button>
              <span className="muted">Check each one first. Approved photos go live on the event page.</span>
            </form>
          )}
          <div className="queue">
            {items.map((m) => (
              <article key={m.id} className="qcard">
                <div className="thumb">
                  {m.kind === "image" && m.thumbKey ? <img src={`/media/${m.id}/thumb`} alt={m.altText} loading="lazy" />
                    : m.kind === "video" && m.displayKey ? <video src={`/media/${m.id}/display`} controls preload="metadata" style={{ width: "100%" }} />
                    : m.kind === "link" ? <a href={m.url!} target="_blank" rel="noreferrer">Open link ↗</a>
                    : <span className="label">{m.status}</span>}
                </div>
                <form action={reviewMedia} className="body">
                  <input type="hidden" name="id" value={m.id} />
                  <span className="row"><Link href={`/events/${m.event.slug}`}><b>{m.event.title}</b></Link>{m.event.visibility === "public" && <span className="status">public event</span>}</span>
                  <span className="mono">{m.uploader.name} · {fmtDate(m.createdAt)}</span>
                  {m.error && <small style={{ color: "var(--bad)" }}>{m.error}</small>}
                  <input name="caption" defaultValue={m.caption} placeholder="Caption" aria-label="Caption" />
                  <input name="altText" defaultValue={m.altText} placeholder="Describe the photo" aria-label="Description" />
                  <input name="tags" defaultValue={m.tags.join(", ")} placeholder="Tags" aria-label="Tags" />
                  <input name="reason" placeholder="Reason (needed to reject)" aria-label="Reject reason" />
                  <div className="row">
                    <button className="pill small" name="decision" value="approve">Approve</button>
                    <button className="pill small ghost" name="decision" value="reject">Reject</button>
                  </div>
                </form>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
