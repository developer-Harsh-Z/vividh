import Link from "next/link";
import type { Prisma, Team } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { atLeast } from "@/lib/rules";
import { TEAMS, TEAM_IDS } from "@/lib/teams";
import Lightbox from "@/components/Lightbox";
import { sp, type PageProps } from "@/components/Flash";

export const metadata = { title: "Search the archive" };

export default async function Search({ searchParams }: PageProps) {
  const user = await requireRole("member", "/portal/search");
  const p = await searchParams;
  const q = sp(p.q).trim(), eventId = sp(p.event), kind = sp(p.kind), from = sp(p.from), to = sp(p.to);
  const team = TEAM_IDS.includes(sp(p.team) as Team) ? (sp(p.team) as Team) : undefined;

  // ponytail: `contains` search; add pg_trgm indexes past ~100k items (D27)
  const where: Prisma.MediaWhereInput = {
    status: "approved",
    kind: kind === "video" ? "video" : kind === "image" ? "image" : { in: ["image", "video"] },
    ...(eventId && { eventId }),
    event: {
      ...(team && { credits: { some: { member: { teams: { some: { team } } } } } }),
      ...((from || to) && { date: { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) } }),
    },
    ...(q && {
      OR: [
        { caption: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
        { event: { title: { contains: q, mode: "insensitive" } } },
        { uploader: { name: { contains: q, mode: "insensitive" } } },
      ],
    }),
  };
  const searched = Boolean(q || eventId || kind || team || from || to);
  const [results, events] = await Promise.all([
    searched ? db.media.findMany({ where, orderBy: { createdAt: "desc" }, take: 120 }) : Promise.resolve([]),
    db.event.findMany({ orderBy: { date: "desc" }, select: { id: true, title: true } }),
  ]);

  return (
    <div className="wrap page">
      <Link className="linkish" href="/portal">← Portal</Link>
      <div className="stack"><span className="eyebrow">Archive</span><h1 className="h-page">Find a <em>photo</em></h1></div>
      <form className="form wide" role="search">
        <div className="grid2">
          <label className="field"><span>Search</span><input name="q" defaultValue={q} placeholder="trophy, stage, a name…" /></label>
          <label className="field"><span>Event</span><select name="event" defaultValue={eventId}><option value="">Any event</option>{events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></label>
          <label className="field"><span>Covered by team</span><select name="team" defaultValue={team ?? ""}><option value="">Any team</option>{TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
          <label className="field"><span>Type</span><select name="kind" defaultValue={kind}><option value="">Photos and videos</option><option value="image">Photos</option><option value="video">Videos</option></select></label>
          <label className="field"><span>Event date from</span><input type="date" name="from" defaultValue={from} /></label>
          <label className="field"><span>to</span><input type="date" name="to" defaultValue={to} /></label>
        </div>
        <div className="row"><button className="pill">Search</button>{searched && <Link className="linkish" href="/portal/search">Clear</Link>}</div>
      </form>
      {searched && (results.length === 0
        ? <div className="empty"><b>No approved photos match.</b><span>Try fewer words, a wider date range, or “Any event”.</span></div>
        : <>
            <span className="label">{results.length}{results.length === 120 ? "+" : ""} results</span>
            <Lightbox items={results.map((m) => ({ id: m.id, kind: m.kind as "image" | "video", alt: m.altText || m.caption, caption: m.caption, w: m.width, h: m.height }))} canDownload={atLeast(user.role, "member")} />
          </>)}
    </div>
  );
}
