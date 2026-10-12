import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { atLeast } from "@/lib/rules";
import { uploadableEvents } from "@/lib/queries";
import { fmtDate } from "@/lib/teams";
import Flash, { type PageProps } from "@/components/Flash";
import { deleteMyUpload } from "./upload/actions";

export const metadata = { title: "My portal" };

export default async function Portal({ searchParams }: PageProps) {
  const user = await requireUser("/portal");
  const admin = atLeast(user.role, "admin");
  const [uploads, counts, events, queue, apps] = await Promise.all([
    db.media.findMany({ where: { uploaderId: user.id }, orderBy: { createdAt: "desc" }, take: 30, include: { event: { select: { title: true, slug: true } } } }),
    db.media.groupBy({ by: ["status"], where: { uploaderId: user.id }, _count: true }),
    uploadableEvents(user),
    admin ? db.media.count({ where: { status: "pending" } }) : 0,
    admin ? db.application.count({ where: { status: "submitted" } }) : 0,
  ]);
  const n = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">VIVIDH portal</span>
        <h1 className="h-page">Welcome back, <em>{user.name.split(" ")[0]}</em></h1>
        <p className="muted">Keep creating. Keep growing.</p>
      </div>
      <Flash searchParams={searchParams} />
      <div className="cards">
        <div className="kpi"><b>{counts.reduce((a, c) => a + c._count, 0)}</b><span className="muted">My uploads</span></div>
        <div className="kpi"><b>{n("pending") + n("processing")}</b><span className="muted">Awaiting approval</span></div>
        <div className="kpi"><b>{n("approved")}</b><span className="muted">Approved</span></div>
        {admin && <Link className={`kpi${queue ? " alert" : ""}`} href="/admin/media"><b>{queue}</b><span className="muted">Media to review →</span></Link>}
        {admin && <Link className={`kpi${apps ? " alert" : ""}`} href="/admin/applications"><b>{apps}</b><span className="muted">New applications →</span></Link>}
      </div>
      <div className="row">
        {events.length > 0 ? <Link className="pill" href="/portal/upload">Upload media <span className="arr">→</span></Link>
          : <span className="muted">You can upload once you&apos;re a member or invited to cover an event.</span>}
        {user.member && <Link className="pill ghost" href="/portal/profile">Edit my profile</Link>}
        {atLeast(user.role, "member") && <Link className="pill ghost" href="/portal/search">Search the archive</Link>}
        {!user.member && <Link className="pill ghost" href="/join">Join VIVIDH</Link>}
      </div>

      <section className="stack">
        <h2 className="h-card">Recent uploads</h2>
        {uploads.length === 0 ? <div className="empty"><b>Nothing uploaded yet.</b><span>Photos you upload appear here with their review status.</span></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>File</th><th>Event</th><th>Uploaded</th><th>Status</th><th /></tr></thead>
            <tbody>
              {uploads.map((m) => (
                <tr key={m.id}>
                  <td>{m.kind === "image" && m.thumbKey ? <img src={`/media/${m.id}/thumb`} alt="" width={56} height={42} style={{ objectFit: "cover", borderRadius: 4 }} /> : <span className="mono">{m.kind}</span>}</td>
                  <td><Link href={`/events/${m.event.slug}`}>{m.event.title}</Link>{m.caption && <div className="muted">{m.caption}</div>}</td>
                  <td className="mono">{fmtDate(m.createdAt)}</td>
                  <td><span className={`status ${m.status}`}>{m.status}</span>{m.rejectReason && <div className="muted">{m.rejectReason}</div>}</td>
                  <td>{m.status !== "approved" && m.status !== "removed" && (
                    <form action={deleteMyUpload}><input type="hidden" name="id" value={m.id} /><button className="linkish">Delete</button></form>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </section>
    </div>
  );
}
