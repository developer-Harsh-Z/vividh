import type { AppStatus, Team } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { currentWindow, isOpen } from "@/lib/queries";
import { APP_STATUSES, TEAMS, TEAM_IDS, fmtDate, teamName } from "@/lib/teams";
import Flash, { sp, type PageProps } from "@/components/Flash";
import { saveWindow, updateApplication } from "../actions";

export const metadata = { title: "Recruitment" };
const ymd = (d?: Date) => d?.toISOString().slice(0, 10);

export default async function Applications({ searchParams }: PageProps) {
  await requireRole("admin");
  const p = await searchParams;
  const win = await currentWindow();
  const status = (APP_STATUSES as readonly string[]).includes(sp(p.status)) ? (sp(p.status) as AppStatus) : undefined;
  const team = TEAM_IDS.includes(sp(p.team) as Team) ? (sp(p.team) as Team) : undefined;
  const apps = win ? await db.application.findMany({
    where: { windowId: win.id, ...(status && { status }), ...(team && { OR: [{ choice1: team }, { choice2: team }] }) },
    include: { user: { select: { email: true } } }, orderBy: { createdAt: "asc" },
  }) : [];
  const qs = new URLSearchParams({ ...(status && { status }), ...(team && { team }) }).toString();
  const back = `/admin/applications${qs && "?" + qs}`;

  return (
    <>
      <h1 className="h-page">Recruitment</h1>
      <Flash searchParams={searchParams} />
      <details open={!win}>
        <summary className="pill small" style={{ display: "inline-flex" }}>{win ? `Window: ${fmtDate(win.opensAt)} to ${fmtDate(win.closesAt)} · ${isOpen(win) ? "open" : "closed"}` : "Set up a recruitment window"}</summary>
        <form action={saveWindow} className="form" style={{ marginTop: 16 }}>
          {win && <input type="hidden" name="id" value={win.id} />}
          <div className="grid2">
            <label className="field"><span>Opens</span><input type="date" name="opensAt" required defaultValue={ymd(win?.opensAt)} /></label>
            <label className="field"><span>Closes</span><input type="date" name="closesAt" required defaultValue={ymd(win?.closesAt)} /></label>
          </div>
          <fieldset><legend>Teams hiring</legend><div className="checks">{TEAMS.map((t) => <label key={t.id}><input type="checkbox" name={`team_${t.id}`} defaultChecked={win ? win.teams.includes(t.id) : true} />{t.name}</label>)}</div></fieldset>
          <label className="field"><span>Note for applicants</span><textarea name="note" maxLength={500} defaultValue={win?.note} /></label>
          <div className="row"><button className="pill">Save window</button>{win && <button className="pill ghost" name="asNew" value="1">Save as a new window</button>}</div>
        </form>
      </details>

      {win && (
        <>
          <form className="row" role="search">
            <select name="status" defaultValue={status ?? ""} aria-label="Status" style={{ maxWidth: 180 }}><option value="">All statuses</option>{APP_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            <select name="team" defaultValue={team ?? ""} aria-label="Team" style={{ maxWidth: 240 }}><option value="">All teams</option>{TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            <button className="pill small">Filter</button>
            <a className="linkish" href={`/admin/applications/export?window=${win.id}`}>Download CSV</a>
          </form>
          {apps.length === 0 ? <div className="empty">No applications{status || team ? " match these filters" : " yet"}.</div> : (
            <div className="stack">
              {apps.map((a) => (
                <details key={a.id} className="qcard">
                  <summary className="body row between" style={{ cursor: "pointer" }}>
                    <span><b>{a.name}</b> <span className="muted">· Year {a.year} · {a.branch}</span></span>
                    <span className="row"><span className="chip solid" data-team={a.choice1}>{teamName(a.choice1)}</span>{a.choice2 && <span className="chip" data-team={a.choice2}>{teamName(a.choice2)}</span>}<span className={`status ${a.status}`}>{a.status}</span></span>
                  </summary>
                  <div className="body">
                    <p className="mono">{a.user.email} · {a.phone} · applied {fmtDate(a.createdAt)}</p>
                    <p className="prose">{a.why}</p>
                    <div className="row">{a.portfolio && <a href={a.portfolio} target="_blank" rel="noreferrer">Portfolio ↗</a>}{a.taskLink && <a href={a.taskLink} target="_blank" rel="noreferrer">Task ↗</a>}</div>
                    <form action={updateApplication} className="form wide">
                      <input type="hidden" name="id" value={a.id} /><input type="hidden" name="back" value={back} />
                      <label className="field"><span>Private notes</span><textarea name="notes" defaultValue={a.notes} maxLength={2000} style={{ minHeight: 70 }} /></label>
                      <div className="inline">
                        <select name="status" defaultValue={a.status} aria-label="Status">{APP_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                        <select name="team" defaultValue={a.choice1} aria-label="Team if accepted">{TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                        <input name="title" placeholder="Role title if accepted" defaultValue="Member" aria-label="Role title" />
                        <button className="pill small">Save</button>
                      </div>
                      <small className="muted">Setting the status to “accepted” makes them a member of the chosen team.</small>
                    </form>
                  </div>
                </details>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
