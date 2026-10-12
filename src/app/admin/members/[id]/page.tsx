import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { TEAMS } from "@/lib/teams";
import Flash, { type PageProps } from "@/components/Flash";
import { setMemberStatus, updateMember } from "../../actions";

export const metadata = { title: "Edit member" };

export default async function AdminMember({ params, searchParams }: PageProps<{ id: string }>) {
  await requireRole("admin");
  const { id } = await params;
  const m = await db.member.findUnique({ where: { id }, include: { user: true, teams: true } });
  if (!m) notFound();

  return (
    <>
      <div className="stack">
        <Link className="linkish" href="/admin/members">← Members</Link>
        <h1 className="h-page">{m.displayName}</h1>
        <div className="row"><span className="muted">{m.user.email}</span><span className={`status ${m.status}`}>{m.status}</span><span className="status">{m.user.role}</span></div>
      </div>
      <Flash searchParams={searchParams} />

      <form action={updateMember} className="form">
        <input type="hidden" name="id" value={m.id} />
        <div className="grid2">
          <label className="field"><span>Display name</span><input name="displayName" required maxLength={60} defaultValue={m.displayName} /></label>
          <label className="field"><span>Graduating year</span><input name="batch" type="number" min={2000} max={2100} defaultValue={m.batch ?? ""} /><small>Used to group alumni.</small></label>
        </div>
        <fieldset>
          <legend>Teams and roles</legend>
          {TEAMS.map((t) => {
            const cur = m.teams.find((x) => x.team === t.id);
            return (
              <div key={t.id} className="inline">
                <label className="inline" style={{ minWidth: 230 }}><input type="checkbox" name={`team_${t.id}`} defaultChecked={!!cur} />{t.name}</label>
                <input name={`title_${t.id}`} defaultValue={cur?.title ?? ""} placeholder="Role title" aria-label={`${t.name} role title`} />
                <label className="inline"><input type="radio" name="primary" value={t.id} defaultChecked={cur?.isPrimary} />primary</label>
              </div>
            );
          })}
        </fieldset>
        <button className="pill" style={{ justifySelf: "start" }}>Save</button>
      </form>

      <section className="stack">
        <h2 className="h-card">Status</h2>
        <p className="muted">Retiring moves them to the alumni list. Removing hides them everywhere. Either way their event credits are kept.</p>
        <form action={setMemberStatus} className="row">
          <input type="hidden" name="id" value={m.id} />
          {m.status !== "active" && <button className="pill small" name="status" value="active">Make active</button>}
          {m.status !== "alumni" && <button className="pill small ghost" name="status" value="alumni">Retire to alumni</button>}
          {m.status !== "removed" && <button className="pill small danger" name="status" value="removed">Remove</button>}
        </form>
      </section>
    </>
  );
}
