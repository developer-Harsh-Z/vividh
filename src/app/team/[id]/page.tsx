import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { teamName, fmtDate } from "@/lib/teams";
import type { PageProps } from "@/components/Flash";

export default async function Profile({ params }: PageProps<{ id: string }>) {
  const { id } = await params;
  const [m, viewer] = await Promise.all([
    db.member.findUnique({
      where: { id },
      include: {
        user: { select: { image: true } }, teams: true, skills: true,
        credits: { where: { event: { archivedAt: null, visibility: "public" } }, include: { event: true }, orderBy: { event: { date: "desc" } } },
      },
    }),
    getUser(),
  ]);
  // Only members who chose a full public card get a profile page (members can always see their own).
  if (!m || m.status === "removed" || (m.visibility !== "full" && viewer?.member?.id !== m.id)) notFound();
  const links = [["Instagram", m.instagram], ["LinkedIn", m.linkedin], ["Portfolio", m.portfolio]].filter(([, v]) => v) as [string, string][];

  return (
    <div className="wrap page">
      <Link className="linkish" href="/team">← Team</Link>
      <div className="split" style={{ alignItems: "start" }}>
        <div className="person" style={{ maxWidth: 280 }}>
          <div className="face">{m.user.image ? <img src={m.user.image} alt={m.displayName} referrerPolicy="no-referrer" /> : <span>{m.displayName[0]}</span>}</div>
        </div>
        <div className="stack">
          <div className="chips">{m.teams.map((t) => <span key={t.team} className="chip solid" data-team={t.team}>{teamName(t.team)} · {t.title}</span>)}</div>
          <h1 className="h-page">{m.displayName}</h1>
          {m.status === "alumni" && <span className="status">Alumni{m.batch ? ` · ${m.batch}` : ""}</span>}
          {m.bio && <p className="prose">{m.bio}</p>}
          {m.skills.length > 0 && <div className="chips">{m.skills.map((s) => <Link key={s.id} className="chip" href={`/team?skill=${encodeURIComponent(s.name)}`}>#{s.name}</Link>)}</div>}
          {links.length > 0 && <div className="row">{links.map(([k, v]) => <a key={k} className="pill ghost small" href={v} target="_blank" rel="noreferrer">{k}</a>)}</div>}
          {m.credits.length > 0 && (
            <section className="stack">
              <span className="label">Events covered</span>
              <div className="table-wrap"><table><tbody>
                {m.credits.map((c) => <tr key={c.eventId}><td className="mono">{fmtDate(c.event.date)}</td><td><Link href={`/events/${c.event.slug}`}>{c.event.title}</Link></td><td className="muted">{c.contribution}</td></tr>)}
              </tbody></table></div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
