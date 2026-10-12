import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fmtDate } from "@/lib/teams";
import EventFields from "@/components/EventFields";
import Flash, { type PageProps } from "@/components/Flash";
import { saveEvent } from "../actions";

export const metadata = { title: "Events" };

export default async function AdminEvents({ searchParams }: PageProps) {
  await requireRole("admin");
  const events = await db.event.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { media: { where: { status: "approved" } } } } },
  });
  const pending = await db.media.groupBy({ by: ["eventId"], where: { status: "pending" }, _count: true });

  return (
    <>
      <h1 className="h-page">Events</h1>
      <Flash searchParams={searchParams} />
      <details>
        <summary className="pill small" style={{ display: "inline-flex" }}>New event</summary>
        <form action={saveEvent} className="form" style={{ marginTop: 16 }}><EventFields /><button className="pill" style={{ justifySelf: "start" }}>Create event</button></form>
      </details>
      <div className="table-wrap"><table>
        <thead><tr><th>Date</th><th>Event</th><th>Album</th><th>Approved</th><th>Pending</th></tr></thead>
        <tbody>{events.map((e) => (
          <tr key={e.id}>
            <td className="mono">{fmtDate(e.date)}</td>
            <td><Link href={`/admin/events/${e.id}`}><b>{e.title}</b></Link>{e.archivedAt && <> <span className="status">archived</span></>}</td>
            <td><span className="status">{e.visibility}</span></td>
            <td className="num">{e._count.media}</td>
            <td className="num">{pending.find((p) => p.eventId === e.id)?._count ?? 0}</td>
          </tr>
        ))}</tbody>
      </table></div>
    </>
  );
}
