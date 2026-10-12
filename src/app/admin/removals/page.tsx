import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fmtDate } from "@/lib/teams";
import Flash, { type PageProps } from "@/components/Flash";
import { resolveRemoval } from "../actions";

export const metadata = { title: "Removal requests" };

export default async function Removals({ searchParams }: PageProps) {
  await requireRole("admin");
  const [open, done] = await Promise.all([
    db.removalRequest.findMany({ where: { status: "open" }, orderBy: { createdAt: "asc" }, include: { media: { include: { event: { select: { title: true, slug: true } } } } } }),
    db.removalRequest.findMany({ where: { status: { not: "open" } }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const overdue = (d: Date) => Date.now() - d.getTime() > 72 * 3600_000;

  return (
    <>
      <h1 className="h-page">Removal requests</h1>
      <p className="muted">Anyone in a photo can ask for it to be taken down. Respond within 72 hours and reply to them by email.</p>
      <Flash searchParams={searchParams} />
      {open.length === 0 ? <div className="empty">No open requests.</div> : (
        <div className="queue">
          {open.map((r) => (
            <article key={r.id} className="qcard">
              <div className="thumb">{r.media.thumbKey ? <img src={`/media/${r.media.id}/thumb`} alt="" /> : <span className="label">{r.media.status}</span>}</div>
              <div className="body">
                <Link href={`/events/${r.media.event.slug}`}><b>{r.media.event.title}</b></Link>
                <span className="mono">{r.email} · {fmtDate(r.createdAt)} {overdue(r.createdAt) && <span className="status failed">over 72 h</span>}</span>
                <p>{r.reason}</p>
                <form action={resolveRemoval} className="row">
                  <input type="hidden" name="id" value={r.id} />
                  <button className="pill small danger" name="decision" value="remove">Remove photo</button>
                  <button className="pill small ghost" name="decision" value="decline">Decline</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
      {done.length > 0 && (
        <div className="table-wrap"><table><tbody>
          {done.map((r) => <tr key={r.id}><td className="mono">{fmtDate(r.createdAt)}</td><td>{r.email}</td><td><span className={`status ${r.status}`}>{r.status}</span></td></tr>)}
        </tbody></table></div>
      )}
    </>
  );
}
