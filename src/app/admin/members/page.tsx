import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { TEAMS, teamName } from "@/lib/teams";
import Flash, { sp, type PageProps } from "@/components/Flash";
import { addMember, addTag, deleteTag } from "../actions";

export const metadata = { title: "Members" };

export default async function AdminMembers({ searchParams }: PageProps) {
  await requireRole("admin");
  const p = await searchParams;
  const status = ["active", "alumni", "removed"].includes(sp(p.status)) ? (sp(p.status) as "active" | "alumni" | "removed") : "active";
  const q = sp(p.q).trim();
  const [members, tags] = await Promise.all([
    db.member.findMany({
      where: { status, ...(q && { OR: [{ displayName: { contains: q, mode: "insensitive" } }, { user: { email: { contains: q, mode: "insensitive" } } }] }) },
      include: { user: { select: { email: true, role: true } }, teams: true, _count: { select: { credits: true } } },
      orderBy: { displayName: "asc" },
    }),
    db.skillTag.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { members: true } } } }),
  ]);

  return (
    <>
      <h1 className="h-page">Members</h1>
      <Flash searchParams={searchParams} />
      <details>
        <summary className="pill small" style={{ display: "inline-flex" }}>Add a member</summary>
        <form action={addMember} className="form" style={{ marginTop: 16 }}>
          <div className="grid2">
            <label className="field"><span>College email</span><input name="email" type="email" required placeholder="name.uset@ltsu.ac.in" /></label>
            <label className="field"><span>Name</span><input name="name" required maxLength={60} /></label>
            <label className="field"><span>Team</span><select name="team">{TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
            <label className="field"><span>Role title</span><input name="title" required maxLength={60} defaultValue="Member" /></label>
          </div>
          <button className="pill" style={{ justifySelf: "start" }}>Add member</button>
        </form>
      </details>

      <form className="row" role="search">
        <input name="q" defaultValue={q} placeholder="Name or email" aria-label="Search members" style={{ maxWidth: 240 }} />
        <select name="status" defaultValue={status} aria-label="Status" style={{ maxWidth: 160 }}><option value="active">Active</option><option value="alumni">Alumni</option><option value="removed">Removed</option></select>
        <button className="pill small">Filter</button>
      </form>
      <div className="table-wrap"><table>
        <thead><tr><th>Name</th><th>Teams</th><th>Access</th><th>Events</th></tr></thead>
        <tbody>{members.map((m) => (
          <tr key={m.id}>
            <td><Link href={`/admin/members/${m.id}`}><b>{m.displayName}</b></Link><div className="muted">{m.user.email}</div></td>
            <td>{m.teams.map((t) => `${teamName(t.team)} (${t.title})`).join(", ")}</td>
            <td><span className="status">{m.user.role}</span></td>
            <td className="num">{m._count.credits}</td>
          </tr>
        ))}</tbody>
      </table></div>
      {members.length === 0 && <div className="empty">No {status} members{q && " match that search"}.</div>}

      <section className="stack">
        <h2 className="h-card">Skill tags</h2>
        <p className="muted">Members pick from this list on their profile, which keeps tags consistent.</p>
        <div className="chips">
          {tags.map((t) => (
            <form key={t.id} action={deleteTag} className="chip"><input type="hidden" name="id" value={t.id} />#{t.name} ({t._count.members})&nbsp;<button className="linkish" aria-label={`Delete ${t.name}`}>×</button></form>
          ))}
        </div>
        <form action={addTag} className="inline"><input name="name" required maxLength={30} placeholder="reels" aria-label="New skill" /><button className="pill small">Add skill</button></form>
      </section>
    </>
  );
}
