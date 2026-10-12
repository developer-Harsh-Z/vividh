import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fmtDate } from "@/lib/teams";
import { sp, type PageProps } from "@/components/Flash";

export const metadata = { title: "Activity log" };
const PAGE = 100;

export default async function Log({ searchParams }: PageProps) {
  await requireRole("admin");
  const p = await searchParams;
  const q = sp(p.q).trim();
  const before = Number(sp(p.before)) || undefined;
  const rows = await db.activityLog.findMany({
    where: { ...(q && { OR: [{ action: { contains: q } }, { targetType: q }, { actor: { name: { contains: q, mode: "insensitive" } } }] }), ...(before && { id: { lt: before } }) },
    orderBy: { id: "desc" }, take: PAGE, include: { actor: { select: { name: true } } },
  });

  return (
    <>
      <h1 className="h-page">Activity log</h1>
      <p className="muted">Every admin change, newest first. Entries can&apos;t be edited or deleted.</p>
      <form className="row" role="search"><input name="q" defaultValue={q} placeholder="Action or person" aria-label="Filter" style={{ maxWidth: 260 }} /><button className="pill small">Filter</button></form>
      <div className="table-wrap"><table>
        <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Target</th><th>Change</th></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id}>
            <td className="mono">{fmtDate(r.at, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
            <td>{r.actor.name}</td>
            <td className="mono">{r.action}</td>
            <td className="mono">{r.targetType} {r.targetId.slice(-6)}</td>
            <td><small className="muted">{r.after ? JSON.stringify(r.after).slice(0, 140) : ""}</small></td>
          </tr>
        ))}</tbody>
      </table></div>
      {rows.length === PAGE && <Link className="pill ghost small" href={`/admin/log?${new URLSearchParams({ ...(q && { q }), before: String(rows.at(-1)!.id) })}`}>Older entries</Link>}
    </>
  );
}
