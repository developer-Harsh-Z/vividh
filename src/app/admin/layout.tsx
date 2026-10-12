import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { atLeast } from "@/lib/rules";

export const metadata = { title: { default: "Admin", template: "%s · Admin · VIVIDH" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin", "/admin");
  return (
    <div className="wrap shell">
      <nav className="side-nav" aria-label="Admin">
        <span className="label">Admin console</span>
        <Link href="/admin">Overview</Link>
        <Link href="/admin/media">Media queue</Link>
        <Link href="/admin/events">Events</Link>
        <Link href="/admin/members">Members</Link>
        <Link href="/admin/applications">Recruitment</Link>
        <Link href="/admin/removals">Removal requests</Link>
        <Link href="/admin/log">Activity log</Link>
        {atLeast(user.role, "owner") && <Link href="/admin/access">Admin access</Link>}
      </nav>
      <div className="main">{children}</div>
    </div>
  );
}
