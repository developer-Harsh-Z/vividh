import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { atLeast } from "@/lib/rules";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  // Quote for CSV, and neutralise spreadsheet formulas (=, +, -, @) typed into the form.
  return `"${(/^[=+\-@]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  const user = await getUser();
  if (!atLeast(user?.role, "admin")) return new Response("Not found", { status: 404 });
  const windowId = new URL(req.url).searchParams.get("window") ?? "";
  const apps = await db.application.findMany({ where: { windowId }, include: { user: { select: { email: true } } }, orderBy: { createdAt: "asc" } });
  const cols = ["name", "email", "phone", "year", "branch", "choice1", "choice2", "portfolio", "taskLink", "why", "status", "notes", "createdAt"] as const;
  const rows = apps.map((a) => cols.map((c) => cell(c === "email" ? a.user.email : c === "createdAt" ? a.createdAt.toISOString() : a[c])).join(","));
  return new Response([cols.join(","), ...rows].join("\r\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="vividh-applications.csv"`, "cache-control": "private, no-store" },
  });
}
