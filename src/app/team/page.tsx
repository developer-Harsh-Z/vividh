import Link from "next/link";
import type { Team } from "@prisma/client";
import { db } from "@/lib/db";
import { TEAMS, TEAM_IDS, teamName } from "@/lib/teams";
import { sp, type PageProps } from "@/components/Flash";

export const metadata = { title: "Team", description: "Six teams, endless possibilities. Meet the people behind VIVIDH." };

type Card = { id: string; displayName: string; visibility: string; user: { image: string | null }; teams: { team: Team; title: string; isPrimary: boolean }[] };

function Person({ m, team }: { m: Card; team?: Team }) {
  const t = m.teams.find((x) => x.team === team) ?? m.teams.find((x) => x.isPrimary) ?? m.teams[0];
  const body = (
    <>
      {t && <span className="sticker" data-team={t.team}>{teamName(t.team).split(" ")[0]}</span>}
      <div className="face">{m.visibility === "full" && m.user.image ? <img src={m.user.image} alt="" referrerPolicy="no-referrer" loading="lazy" /> : <span aria-hidden="true">{m.displayName[0]}</span>}</div>
      <b>{m.displayName}</b>
      <span className="muted">{t?.title}</span>
    </>
  );
  return m.visibility === "full" ? <Link className="person rv" href={`/team/${m.id}`}>{body}</Link> : <div className="person rv">{body}</div>;
}

export default async function TeamPage({ searchParams }: PageProps) {
  const p = await searchParams;
  const team = TEAM_IDS.includes(sp(p.team) as Team) ? (sp(p.team) as Team) : undefined;
  const skill = sp(p.skill);
  const visible = { visibility: { not: "hidden" as const } };
  const [members, alumni, skills] = await Promise.all([
    db.member.findMany({
      where: { status: "active", ...visible, ...(team && { teams: { some: { team } } }), ...(skill && { skills: { some: { name: skill } } }) },
      include: { user: { select: { image: true } }, teams: true }, orderBy: { displayName: "asc" },
    }),
    db.member.findMany({ where: { status: "alumni", ...visible }, include: { user: { select: { image: true } }, teams: true }, orderBy: [{ batch: "desc" }, { displayName: "asc" }] }),
    db.skillTag.findMany({ where: { members: { some: { status: "active" } } }, orderBy: { name: "asc" } }),
  ]);
  const href = (q: Record<string, string | undefined>) => "/team?" + new URLSearchParams(Object.entries({ team, skill, ...q }).filter(([, v]) => v) as [string, string][]);
  const groups = team ? [team] : TEAM_IDS;

  return (
    <div className="wrap page">
      <div className="stack"><span className="eyebrow">Our teams</span><h1 className="h-page">Six teams, <em>one creative family</em></h1></div>
      <div className="chips" aria-label="Filter by team">
        <Link className={`chip${!team ? " on" : ""}`} href={href({ team: undefined })}>All teams</Link>
        {TEAMS.map((t) => <Link key={t.id} data-team={t.id} className={`chip${team === t.id ? " on" : ""}`} href={href({ team: t.id })}>{t.name}</Link>)}
      </div>
      {skills.length > 0 && (
        <div className="chips" aria-label="Filter by skill">
          {skills.map((s) => <Link key={s.id} className={`chip${skill === s.name ? " on" : ""}`} href={href({ skill: skill === s.name ? undefined : s.name })}>#{s.name}</Link>)}
        </div>
      )}
      {members.length === 0 && <div className="empty"><b>No members match.</b><Link href="/team">Show everyone</Link></div>}
      {groups.map((g) => {
        const list = members.filter((m) => m.teams.some((t) => t.team === g));
        if (!list.length) return null;
        return (
          <section key={g} className="stack">
            <h2 className="h-card"><span className="chip solid" data-team={g}>{teamName(g)}</span></h2>
            <div className="people">{list.map((m) => <Person key={m.id} m={m} team={g} />)}</div>
          </section>
        );
      })}
      {alumni.length > 0 && !team && !skill && (
        <section className="stack">
          <h2 className="h-serif">Alumni</h2>
          <div className="people">{alumni.map((m) => <Person key={m.id} m={m} />)}</div>
        </section>
      )}
    </div>
  );
}
