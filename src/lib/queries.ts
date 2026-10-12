import { db } from "./db";
import { atLeast } from "./rules";
import type { CurrentUser } from "./auth";

// The newest recruitment window (open, upcoming or last closed).
export const currentWindow = () => db.recruitmentWindow.findFirst({ orderBy: { opensAt: "desc" } });
export const isOpen = (w: { opensAt: Date; closesAt: Date } | null, now = new Date()) => !!w && w.opensAt <= now && now < w.closesAt;

export const canViewEvent = (e: { visibility: string; archivedAt: Date | null }, user: CurrentUser | null) =>
  (e.visibility === "public" && !e.archivedAt) || atLeast(user?.role, "member");

// Members upload to any open event; other students only to events they're invited to (Contributor).
export function uploadableEvents(user: CurrentUser) {
  const invited = atLeast(user.role, "member") ? {} : { invites: { some: { email: user.email, expiresAt: { gt: new Date() } } } };
  return db.event.findMany({ where: { archivedAt: null, ...invited }, orderBy: { date: "desc" }, select: { id: true, title: true } });
}
