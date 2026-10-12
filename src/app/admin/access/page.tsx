import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Flash, { type PageProps } from "@/components/Flash";
import { setRole } from "../actions";

export const metadata = { title: "Admin access" };

export default async function Access({ searchParams }: PageProps) {
  await requireRole("owner", "/admin/access");
  const staff = await db.user.findMany({ where: { role: { in: ["owner", "admin"] } }, orderBy: [{ role: "desc" }, { name: "asc" }] });

  return (
    <>
      <h1 className="h-page">Admin access</h1>
      <p className="muted">Owners can grant and remove admin access. There must always be at least two owners: the President and the Faculty Coordinator.</p>
      <Flash searchParams={searchParams} />
      <div className="table-wrap"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Access</th><th /></tr></thead>
        <tbody>{staff.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td><td>{u.email}</td><td><span className="status">{u.role}</span></td>
            <td><form action={setRole}><input type="hidden" name="email" value={u.email} /><input type="hidden" name="role" value="student" /><button className="linkish">Remove access</button></form></td>
          </tr>
        ))}</tbody>
      </table></div>
      <form action={setRole} className="inline">
        <input name="email" type="email" required placeholder="name@ltsu.ac.in" aria-label="Email" />
        <select name="role" aria-label="Access"><option value="admin">Admin</option><option value="owner">Owner</option></select>
        <button className="pill small">Grant</button>
      </form>
      <p className="muted">The person must have signed in once before you can grant access.</p>
    </>
  );
}
