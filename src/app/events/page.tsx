import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { atLeast } from "@/lib/rules";
import { EVENT_TYPES, fmtDate } from "@/lib/teams";
import { sp, type PageProps } from "@/components/Flash";

export const metadata = { title: "Events", description: "Every USET event VIVIDH has covered, from workshops to flagship fests." };

export default async function Events({ searchParams }: PageProps) {
  const p = await searchParams;
  const user = await getUser();
  const type = sp(p.type), year = Number(sp(p.year)), q = sp(p.q).trim();
  const where: Prisma.EventWhereInput = {
    archivedAt: null,
    ...(atLeast(user?.role, "member") ? {} : { visibility: "public" }),
    ...((EVENT_TYPES as readonly string[]).includes(type) && { type: type as (typeof EVENT_TYPES)[number] }),
    ...(year > 2000 && { date: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } }),
    ...(q && { title: { contains: q, mode: "insensitive" } }),
  };
  const [events, years] = await Promise.all([
    db.event.findMany({
      where, orderBy: { date: "desc" }, take: 120,
      include: { media: { where: { status: "approved", kind: "image" }, take: 1, select: { id: true } }, _count: { select: { media: { where: { status: "approved" } } } } },
    }),
    db.$queryRaw<{ y: number }[]>`SELECT DISTINCT EXTRACT(YEAR FROM date)::int AS y FROM "Event" ORDER BY y DESC`,
  ]);
  const now = new Date();
  const upcoming = events.filter((e) => e.date > now).reverse();
  const past = events.filter((e) => e.date <= now);

  return (
    <div className="wrap page">
      <div className="head">
        <div className="stack"><span className="eyebrow">Events</span><h1 className="h-page">From campus moments to <em>flagship fests</em></h1></div>
      </div>
      <form className="row" role="search">
        <input name="q" defaultValue={q} placeholder="Search events" aria-label="Search events" style={{ maxWidth: 260 }} />
        <select name="type" defaultValue={type} aria-label="Event type" style={{ maxWidth: 180 }}>
          <option value="">All types</option>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
        </select>
        <select name="year" defaultValue={year || ""} aria-label="Year" style={{ maxWidth: 140 }}>
          <option value="">All years</option>
          {years.map(({ y }) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="pill small">Filter</button>
        {(q || type || year > 0) && <Link className="linkish" href="/events">Clear</Link>}
      </form>

      {upcoming.length > 0 && (
        <section className="stack">
          <span className="label">Coming up</span>
          <div className="table-wrap"><table><tbody>
            {upcoming.map((e) => (
              <tr key={e.id}><td className="num mono">{fmtDate(e.date)}</td><td><Link href={`/events/${e.slug}`}><b>{e.title}</b></Link></td><td className="muted">{e.venue}</td></tr>
            ))}
          </tbody></table></div>
        </section>
      )}

      {past.length === 0 ? (
        <div className="empty"><b>No events match those filters.</b><span>Try another year or type, or clear the search.</span></div>
      ) : (
        <div className="egrid">
          {past.map((e) => {
            const cover = e.coverId ?? e.media[0]?.id;
            return (
              <Link key={e.id} className="ecard rv" href={`/events/${e.slug}`}>
                <div className="img">{cover ? <img src={`/media/${cover}/thumb`} alt="" loading="lazy" /> : <span className="label">No photos yet</span>}</div>
                <div className="meta"><b>{e.title}</b><span className="mono">{fmtDate(e.date, { month: "short", year: "numeric" })}</span></div>
                <span className="row"><span className="mono">{e.type} · {e._count.media} items</span>{e.visibility === "members" && <span className="status">members</span>}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
