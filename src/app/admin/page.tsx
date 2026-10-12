import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { driveEnabled } from "@/lib/drive";
import { fmtDate } from "@/lib/teams";
import Flash, { type PageProps } from "@/components/Flash";

export default async function Overview({ searchParams }: PageProps) {
  await requireRole("admin"); // layouts don't re-run on client navigation, so every admin page checks too
  const [pending, failed, removals, apps, members, owners, admins, recent] = await Promise.all([
    db.media.count({ where: { status: "pending" } }),
    db.media.count({ where: { status: "failed" } }),
    db.removalRequest.count({ where: { status: "open" } }),
    db.application.count({ where: { status: "submitted" } }),
    db.member.count({ where: { status: "active" } }),
    db.user.findMany({ where: { role: "owner" }, select: { name: true, email: true } }),
    db.user.findMany({ where: { role: "admin" }, select: { name: true, email: true } }),
    db.activityLog.findMany({ orderBy: { at: "desc" }, take: 8, include: { actor: { select: { name: true } } } }),
  ]);
  const checks: [boolean, string][] = [
    [owners.length >= 2, `At least two owners (now ${owners.length})`],
    [pending === 0, `Media queue is empty (${pending} waiting)`],
    [removals === 0, `No open removal requests (${removals} open)`],
    [failed === 0, `No failed uploads (${failed})`],
    [driveEnabled(), "Google Drive connected"],
  ];

  return (
    <>
      <h1 className="h-page">Overview</h1>
      <Flash searchParams={searchParams} />
      <div className="cards">
        <Link className={`kpi${pending ? " alert" : ""}`} href="/admin/media"><b>{pending}</b><span className="muted">Media to review</span></Link>
        <Link className={`kpi${removals ? " alert" : ""}`} href="/admin/removals"><b>{removals}</b><span className="muted">Removal requests</span></Link>
        <Link className={`kpi${apps ? " alert" : ""}`} href="/admin/applications"><b>{apps}</b><span className="muted">New applications</span></Link>
        <Link className="kpi" href="/admin/members"><b>{members}</b><span className="muted">Active members</span></Link>
      </div>
      <section className="stack">
        <h2 className="h-card">Handover checklist</h2>
        <ul className="stack" style={{ listStyle: "none", padding: 0, gap: 8 }}>
          {checks.map(([ok, label]) => <li key={label} className="row"><span className={`status ${ok ? "approved" : "pending"}`}>{ok ? "ok" : "check"}</span>{label}</li>)}
        </ul>
        <p className="muted">Owners: {owners.map((o) => `${o.name} (${o.email})`).join(", ") || "none"}. Admins: {admins.map((a) => a.name).join(", ") || "none"}. Full steps are in docs/RUNBOOK.md.</p>
      </section>
      <section className="stack">
        <div className="row between"><h2 className="h-card">Recent activity</h2><Link className="linkish" href="/admin/log">Full log</Link></div>
        <div className="table-wrap"><table><tbody>
          {recent.map((r) => <tr key={r.id}><td className="mono">{fmtDate(r.at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td><td>{r.actor.name}</td><td className="mono">{r.action}</td></tr>)}
        </tbody></table></div>
      </section>
    </>
  );
}
