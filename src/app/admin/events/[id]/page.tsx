import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { driveEnabled } from "@/lib/drive";
import { fmtDate } from "@/lib/teams";
import EventFields from "@/components/EventFields";
import Flash, { type PageProps } from "@/components/Flash";
import { addCredit, archiveEvent, deleteEvent, importDrive, inviteUploader, removeCredit, removeMedia, revokeInvite, saveEvent, setCover } from "../../actions";

export const metadata = { title: "Edit event" };

export default async function AdminEvent({ params, searchParams }: PageProps<{ id: string }>) {
  await requireRole("admin");
  const { id } = await params;
  const [e, members] = await Promise.all([
    db.event.findUnique({
      where: { id },
      include: {
        credits: { include: { member: { select: { displayName: true } } } },
        invites: { orderBy: { email: "asc" } },
        media: { where: { status: "approved" }, orderBy: { createdAt: "asc" }, take: 200 },
        _count: { select: { media: true } },
      },
    }),
    db.member.findMany({ where: { status: "active" }, orderBy: { displayName: "asc" }, select: { id: true, displayName: true } }),
  ]);
  if (!e) notFound();
  const here = `/admin/events/${e.id}`;

  return (
    <>
      <div className="stack">
        <Link className="linkish" href="/admin/events">← Events</Link>
        <h1 className="h-page">{e.title}</h1>
        <div className="row"><Link className="linkish" href={`/events/${e.slug}`}>View public page</Link>{e.archivedAt && <span className="status">archived</span>}</div>
      </div>
      <Flash searchParams={searchParams} />

      <form action={saveEvent} className="form">
        <input type="hidden" name="id" value={e.id} />
        <EventFields e={e} />
        <div className="row">
          <button className="pill">Save event</button>
          <button className="pill ghost" formAction={archiveEvent}>{e.archivedAt ? "Restore" : "Archive"}</button>
          {e._count.media === 0 && <button className="pill danger" formAction={deleteEvent}>Delete</button>}
        </div>
      </form>

      <section className="stack">
        <h2 className="h-card">Import from Google Drive</h2>
        {!driveEnabled() ? <p className="muted">Drive isn&apos;t connected yet (see docs/RUNBOOK.md).</p>
          : !e.driveFolderId ? <p className="muted">Add the Drive folder link above and save, then import.</p>
          : <form action={importDrive} className="row"><input type="hidden" name="eventId" value={e.id} /><button className="pill">Import photos from the folder</button><span className="muted">New files arrive in the media queue. Re-importing skips files already imported.</span></form>}
      </section>

      <section className="stack">
        <h2 className="h-card">Covered by</h2>
        <div className="chips">
          {e.credits.map((c) => (
            <form key={c.memberId} action={removeCredit} className="chip">
              <input type="hidden" name="eventId" value={e.id} /><input type="hidden" name="memberId" value={c.memberId} />
              {c.member.displayName} · {c.contribution}&nbsp;<button className="linkish" aria-label={`Remove ${c.member.displayName}`}>×</button>
            </form>
          ))}
        </div>
        <form action={addCredit} className="inline">
          <input type="hidden" name="eventId" value={e.id} />
          <select name="memberId" required aria-label="Member">{members.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}</select>
          <select name="contribution" aria-label="Contribution">{["photography", "videography", "writing", "design", "editing", "coverage"].map((c) => <option key={c}>{c}</option>)}</select>
          <button className="pill small">Credit</button>
        </form>
      </section>

      <section className="stack">
        <h2 className="h-card">Invited uploaders</h2>
        <p className="muted">Students who aren&apos;t members can upload to this event until their invite expires.</p>
        {e.invites.length > 0 && (
          <div className="table-wrap"><table><tbody>{e.invites.map((i) => (
            <tr key={i.id}><td>{i.email}</td><td className="mono">until {fmtDate(i.expiresAt)}</td>
              <td><form action={revokeInvite}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="eventId" value={e.id} /><button className="linkish">Revoke</button></form></td></tr>
          ))}</tbody></table></div>
        )}
        <form action={inviteUploader} className="inline">
          <input type="hidden" name="eventId" value={e.id} />
          <input name="email" type="email" required placeholder="name.uset@ltsu.ac.in" aria-label="Email" />
          <button className="pill small">Invite</button>
        </form>
      </section>

      <section className="stack">
        <h2 className="h-card">Approved media ({e.media.length})</h2>
        <div className="queue">
          {e.media.map((m) => (
            <div key={m.id} className="qcard">
              <div className="thumb">{m.kind === "image" ? <img src={`/media/${m.id}/thumb`} alt={m.altText} loading="lazy" /> : <span className="label">{m.kind}</span>}</div>
              <div className="body row">
                {e.coverId === m.id ? <span className="status approved">cover</span> : m.kind === "image" && (
                  <form action={setCover}><input type="hidden" name="mediaId" value={m.id} /><input type="hidden" name="back" value={here} /><button className="linkish">Set as cover</button></form>
                )}
                <form action={removeMedia}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="back" value={here} /><button className="linkish">Remove from site</button></form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
