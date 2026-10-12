"use server";
import type { AppStatus, MemberStatus, Role, Team } from "@prisma/client";
import { db, env } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { allowedEmail, driveFolderId, normEmail, slugify } from "@/lib/rules";
import { act, audit, day, FormError, int, optional, pick, tags, text } from "@/lib/form";
import { APP_STATUSES, EVENT_TYPES, TEAM_IDS } from "@/lib/teams";
import { deleteObject } from "@/lib/storage";
import * as drive from "@/lib/drive";
import { processMedia } from "@/lib/media";

const id = (fd: FormData, name = "id") => String(fd.get(name) ?? "");
const back = (fd: FormData, fallback: string) => { const b = String(fd.get("back") ?? ""); return b.startsWith("/admin") ? b : fallback; };

// ---------------- media ----------------

export async function reviewMedia(fd: FormData) {
  return act(back(fd, "/admin/media"), async () => {
    const admin = await requireRole("admin");
    const m = await db.media.findUnique({ where: { id: id(fd) } });
    if (!m) throw new FormError("That item no longer exists.");
    const approve = fd.get("decision") === "approve";
    const reason = optional(fd, "reason", { label: "Reason", max: 300 });
    if (!approve && !reason) throw new FormError("Give a reason when rejecting, so the uploader knows what to fix.");
    const after = {
      status: approve ? ("approved" as const) : ("rejected" as const), rejectReason: approve ? null : reason,
      caption: text(fd, "caption", { label: "Caption", max: 300, optional: true }), altText: text(fd, "altText", { label: "Description", max: 300, optional: true }),
      tags: tags(fd, "tags"), reviewedById: admin.id, reviewedAt: new Date(),
    };
    await db.media.update({ where: { id: m.id }, data: after });
    await audit(admin.id, approve ? "media.approve" : "media.reject", "Media", m.id, { status: m.status }, { status: after.status, reason });
    return approve ? "Approved." : "Rejected.";
  });
}

export async function approveAll(fd: FormData) {
  return act("/admin/media", async () => {
    const admin = await requireRole("admin");
    const ids = fd.getAll("ids").map(String);
    const { count } = await db.media.updateMany({ where: { id: { in: ids }, status: "pending" }, data: { status: "approved", reviewedById: admin.id, reviewedAt: new Date() } });
    await db.activityLog.createMany({ data: ids.map((t) => ({ actorId: admin.id, action: "media.approve", targetType: "Media", targetId: t })) });
    return `Approved ${count} items.`;
  });
}

async function takeDown(mediaId: string, actorId: string, why: string) {
  const m = await db.media.findUnique({ where: { id: mediaId } });
  if (!m) return;
  await Promise.all([m.displayKey, m.thumbKey].filter((k): k is string => !!k).map(deleteObject));
  await db.media.update({ where: { id: m.id }, data: { status: "removed", displayKey: null, thumbKey: null } });
  await audit(actorId, "media.remove", "Media", m.id, { status: m.status }, { status: "removed", why });
}

export async function removeMedia(fd: FormData) {
  return act(back(fd, "/admin/media"), async () => {
    const admin = await requireRole("admin");
    await takeDown(id(fd), admin.id, "admin");
    return "Removed from the site.";
  });
}

export async function resolveRemoval(fd: FormData) {
  return act("/admin/removals", async () => {
    const admin = await requireRole("admin");
    const r = await db.removalRequest.findUnique({ where: { id: id(fd) } });
    if (!r || r.status !== "open") throw new FormError("That request is already handled.");
    const remove = fd.get("decision") === "remove";
    if (remove) await takeDown(r.mediaId, admin.id, `removal request ${r.id}`);
    await db.removalRequest.update({ where: { id: r.id }, data: { status: remove ? "done" : "declined", resolvedById: admin.id } });
    await audit(admin.id, remove ? "removal.done" : "removal.decline", "RemovalRequest", r.id);
    return remove ? "Photo removed. Reply to the requester to let them know." : "Request declined.";
  });
}

// ---------------- events ----------------

export async function saveEvent(fd: FormData) {
  const existingId = id(fd);
  return act(existingId ? `/admin/events/${existingId}` : "/admin/events", async () => {
    const admin = await requireRole("admin");
    const folderInput = optional(fd, "driveFolder", { label: "Drive folder", max: 300 });
    const driveFolder = folderInput ? driveFolderId(folderInput) : null;
    if (folderInput && !driveFolder) throw new FormError("That doesn't look like a Google Drive folder link.");
    const data = {
      title: text(fd, "title", { label: "Title", max: 120 }), date: day(fd, "date", "Date"),
      venue: text(fd, "venue", { label: "Venue", max: 120, optional: true }), type: pick(fd, "type", EVENT_TYPES, "event type"),
      description: text(fd, "description", { label: "Description", max: 2000, optional: true }),
      visibility: pick(fd, "visibility", ["public", "members"] as const, "visibility"), driveFolderId: driveFolder,
    };
    if (existingId) {
      const before = await db.event.findUniqueOrThrow({ where: { id: existingId } });
      await db.event.update({ where: { id: existingId }, data });
      await audit(admin.id, "event.update", "Event", existingId, before, data);
      return "Event saved.";
    }
    let slug = slugify(data.title, data.date);
    if (await db.event.findUnique({ where: { slug } })) slug += "-" + Date.now().toString(36).slice(-4);
    const e = await db.event.create({ data: { ...data, slug } });
    await audit(admin.id, "event.create", "Event", e.id, undefined, data);
    return "Event created.";
  });
}

export async function archiveEvent(fd: FormData) {
  return act(`/admin/events/${id(fd)}`, async () => {
    const admin = await requireRole("admin");
    const e = await db.event.findUniqueOrThrow({ where: { id: id(fd) } });
    const archivedAt = e.archivedAt ? null : new Date();
    await db.event.update({ where: { id: e.id }, data: { archivedAt } });
    await audit(admin.id, archivedAt ? "event.archive" : "event.unarchive", "Event", e.id);
    return archivedAt ? "Event archived. It's hidden from the site." : "Event restored.";
  });
}

export async function deleteEvent(fd: FormData) {
  return act("/admin/events", async () => {
    const admin = await requireRole("admin");
    const e = await db.event.findUnique({ where: { id: id(fd) }, include: { _count: { select: { media: true } } } });
    if (!e) throw new FormError("Event not found.");
    if (e._count.media > 0) throw new FormError("This event has media, so it can only be archived.");
    await db.event.delete({ where: { id: e.id } });
    await audit(admin.id, "event.delete", "Event", e.id, { title: e.title });
    return "Event deleted.";
  });
}

export async function setCover(fd: FormData) {
  return act(back(fd, "/admin/events"), async () => {
    const admin = await requireRole("admin");
    const m = await db.media.findUnique({ where: { id: id(fd, "mediaId") } });
    if (!m || m.status !== "approved" || m.kind !== "image") throw new FormError("Only approved photos can be covers.");
    await db.event.update({ where: { id: m.eventId }, data: { coverId: m.id } });
    await audit(admin.id, "event.cover", "Event", m.eventId, undefined, { coverId: m.id });
    return "Cover photo set.";
  });
}

export async function addCredit(fd: FormData) {
  return act(`/admin/events/${id(fd, "eventId")}`, async () => {
    const admin = await requireRole("admin");
    const data = { eventId: id(fd, "eventId"), memberId: id(fd, "memberId"), contribution: text(fd, "contribution", { label: "Contribution", max: 40 }) };
    await db.eventCredit.upsert({ where: { eventId_memberId: { eventId: data.eventId, memberId: data.memberId } }, create: data, update: data });
    await audit(admin.id, "event.credit", "Event", data.eventId, undefined, data);
    return "Credit added.";
  });
}

export async function removeCredit(fd: FormData) {
  return act(`/admin/events/${id(fd, "eventId")}`, async () => {
    const admin = await requireRole("admin");
    await db.eventCredit.delete({ where: { eventId_memberId: { eventId: id(fd, "eventId"), memberId: id(fd, "memberId") } } });
    await audit(admin.id, "event.uncredit", "Event", id(fd, "eventId"), { memberId: id(fd, "memberId") });
    return "Credit removed.";
  });
}

export async function inviteUploader(fd: FormData) {
  return act(`/admin/events/${id(fd, "eventId")}`, async () => {
    const admin = await requireRole("admin");
    const email = normEmail(text(fd, "email", { label: "Email", max: 200 }));
    if (!allowedEmail(email, env("ALLOWED_DOMAIN"))) throw new FormError(`Invites must go to an @${env("ALLOWED_DOMAIN")} address.`);
    const e = await db.event.findUniqueOrThrow({ where: { id: id(fd, "eventId") } });
    // Invites last until 14 days after the event, or 14 days from now for past events.
    const expiresAt = new Date(Math.max(e.date.getTime(), Date.now()) + 14 * 864e5);
    await db.uploadInvite.upsert({ where: { eventId_email: { eventId: e.id, email } }, create: { eventId: e.id, email, invitedById: admin.id, expiresAt }, update: { expiresAt } });
    await audit(admin.id, "event.invite", "Event", e.id, undefined, { email, expiresAt });
    return `${email} can upload to this event until ${expiresAt.toLocaleDateString("en-IN")}.`;
  });
}

export async function revokeInvite(fd: FormData) {
  return act(`/admin/events/${id(fd, "eventId")}`, async () => {
    const admin = await requireRole("admin");
    const inv = await db.uploadInvite.delete({ where: { id: id(fd) } });
    await audit(admin.id, "event.uninvite", "Event", inv.eventId, { email: inv.email });
    return "Invite revoked.";
  });
}

// D16: import every photo/video in an event's Drive folder as pending; originals stay in Drive.
export async function importDrive(fd: FormData) {
  return act(`/admin/events/${id(fd, "eventId")}`, async () => {
    const admin = await requireRole("admin");
    if (!drive.driveEnabled()) throw new FormError("Drive isn't set up yet. See docs/RUNBOOK.md, “Google Drive”.");
    const e = await db.event.findUniqueOrThrow({ where: { id: id(fd, "eventId") } });
    if (!e.driveFolderId) throw new FormError("Add the event's Drive folder link first.");
    const files = await drive.listFolder(e.driveFolderId).catch((err) => {
      throw new FormError(`Couldn't read that folder. Share it with the club service account. (${String(err).slice(0, 120)})`);
    });
    const { count } = await db.media.createMany({
      skipDuplicates: true,
      data: files.map((f) => ({
        eventId: e.id, uploaderId: admin.id, source: "drive" as const, driveFileId: f.id, mime: f.mimeType,
        kind: f.mimeType.startsWith("video/") ? ("video" as const) : ("image" as const), status: "processing" as const,
        caption: f.name.replace(/\.[^.]+$/, "").slice(0, 300), sizeBytes: f.size ? Number(f.size) : null,
      })),
    });
    await audit(admin.id, "event.driveImport", "Event", e.id, undefined, { found: files.length, added: count });
    // Videos from Drive aren't copied (D9): they stay links to the Drive file.
    await db.media.updateMany({
      where: { eventId: e.id, source: "drive", kind: "video", status: "processing" },
      data: { kind: "link", status: "pending" },
    });
    const vids = await db.media.findMany({ where: { eventId: e.id, source: "drive", kind: "link", url: null }, select: { id: true, driveFileId: true } });
    await Promise.all(vids.map((v) => db.media.update({ where: { id: v.id }, data: { url: `https://drive.google.com/file/d/${v.driveFileId}/view` } })));

    const due = await db.media.findMany({ where: { eventId: e.id, status: "processing" }, select: { id: true }, take: 500 });
    const start = Date.now();
    let done = 0;
    for (const m of due) { if (Date.now() - start > 40_000) break; await processMedia(m.id); done++; }
    return `Found ${files.length} files, ${count} new. Processed ${done}; the rest finish within 15 minutes and then wait in the review queue.`;
  });
}

// ---------------- members ----------------

async function ensureMember(email: string, name: string, team: Team, title: string) {
  const user = await db.user.upsert({ where: { email }, create: { email, name, role: "member" }, update: {} });
  if (user.role === "student") await db.user.update({ where: { id: user.id }, data: { role: "member" } });
  const member = await db.member.upsert({
    where: { userId: user.id },
    create: { userId: user.id, displayName: name, teams: { create: { team, title, isPrimary: true } } },
    update: { status: "active", leftOn: null },
  });
  await db.memberTeam.upsert({ where: { memberId_team: { memberId: member.id, team } }, create: { memberId: member.id, team, title, isPrimary: true }, update: { title } });
  return member;
}

export async function addMember(fd: FormData) {
  return act("/admin/members", async () => {
    const admin = await requireRole("admin");
    const email = normEmail(text(fd, "email", { label: "Email", max: 200 }));
    if (!allowedEmail(email, env("ALLOWED_DOMAIN"))) throw new FormError(`Members need an @${env("ALLOWED_DOMAIN")} address.`);
    const team = pick(fd, "team", TEAM_IDS, "team");
    const m = await ensureMember(email, text(fd, "name", { label: "Name", max: 60 }), team, text(fd, "title", { label: "Role title", max: 60 }));
    await audit(admin.id, "member.add", "Member", m.id, undefined, { email, team });
    return "Member added. They can sign in with that address.";
  });
}

export async function updateMember(fd: FormData) {
  return act(`/admin/members/${id(fd)}`, async () => {
    const admin = await requireRole("admin");
    const before = await db.member.findUniqueOrThrow({ where: { id: id(fd) }, include: { teams: true } });
    const teams = TEAM_IDS.filter((t) => fd.get(`team_${t}`)).map((t) => ({
      team: t, title: text(fd, `title_${t}`, { label: "Role title", max: 60, optional: true }) || "Member", isPrimary: fd.get("primary") === t,
    }));
    if (!teams.length) throw new FormError("A member needs at least one team.");
    if (!teams.some((t) => t.isPrimary)) teams[0].isPrimary = true;
    const batchRaw = String(fd.get("batch") ?? "");
    await db.$transaction([
      db.memberTeam.deleteMany({ where: { memberId: before.id } }),
      db.member.update({
        where: { id: before.id },
        data: { displayName: text(fd, "displayName", { label: "Name", max: 60 }), batch: batchRaw ? int(fd, "batch", 2000, 2100, "Batch") : null, teams: { create: teams } },
      }),
    ]);
    await audit(admin.id, "member.update", "Member", before.id, { teams: before.teams }, { teams });
    return "Member saved.";
  });
}

export async function setMemberStatus(fd: FormData) {
  return act(`/admin/members/${id(fd)}`, async () => {
    const admin = await requireRole("admin");
    const status = pick(fd, "status", ["active", "alumni", "removed"] as const, "status") as MemberStatus;
    const m = await db.member.findUniqueOrThrow({ where: { id: id(fd) }, include: { user: true } });
    if (status !== "active" && m.user.role === "owner") throw new FormError("Owners can't be retired. Remove their owner access first.");
    await db.member.update({ where: { id: m.id }, data: { status, leftOn: status === "active" ? null : new Date() } });
    // Retired and removed members lose member access (admins keep theirs until an owner changes it).
    if (m.user.role === "member" && status !== "active") await db.user.update({ where: { id: m.userId }, data: { role: "student" } });
    if (m.user.role === "student" && status === "active") await db.user.update({ where: { id: m.userId }, data: { role: "member" } });
    await audit(admin.id, `member.${status}`, "Member", m.id, { status: m.status }, { status });
    return status === "alumni" ? "Moved to alumni." : status === "removed" ? "Removed. Their event credits are kept." : "Member is active again.";
  });
}

export async function addTag(fd: FormData) {
  return act("/admin/members", async () => {
    const admin = await requireRole("admin");
    const name = text(fd, "name", { label: "Skill", max: 30 }).toLowerCase();
    const t = await db.skillTag.upsert({ where: { name }, create: { name }, update: {} });
    await audit(admin.id, "tag.add", "SkillTag", t.id, undefined, { name });
    return `Added “${name}”.`;
  });
}

export async function deleteTag(fd: FormData) {
  return act("/admin/members", async () => {
    const admin = await requireRole("admin");
    const t = await db.skillTag.delete({ where: { id: id(fd) } });
    await audit(admin.id, "tag.delete", "SkillTag", t.id, { name: t.name });
    return `Deleted “${t.name}”.`;
  });
}

// ---------------- recruitment ----------------

export async function saveWindow(fd: FormData) {
  return act("/admin/applications", async () => {
    const admin = await requireRole("admin");
    const data = {
      opensAt: day(fd, "opensAt", "Opens"), closesAt: day(fd, "closesAt", "Closes"),
      teams: TEAM_IDS.filter((t) => fd.get(`team_${t}`)), note: text(fd, "note", { label: "Note", max: 500, optional: true }),
    };
    if (data.closesAt <= data.opensAt) throw new FormError("The window must close after it opens.");
    if (!data.teams.length) throw new FormError("Choose at least one team that is hiring.");
    const wid = fd.get("asNew") ? "" : id(fd);
    const w = wid ? await db.recruitmentWindow.update({ where: { id: wid }, data }) : await db.recruitmentWindow.create({ data });
    await audit(admin.id, wid ? "window.update" : "window.create", "RecruitmentWindow", w.id, undefined, data);
    return "Recruitment window saved.";
  });
}

export async function updateApplication(fd: FormData) {
  return act(back(fd, "/admin/applications"), async () => {
    const admin = await requireRole("admin");
    const a = await db.application.findUniqueOrThrow({ where: { id: id(fd) } });
    const status = pick(fd, "status", APP_STATUSES, "status") as AppStatus;
    const notes = text(fd, "notes", { label: "Notes", max: 2000, optional: true });

    if (status === "accepted") {
      // One step from applicant to member; upserts make accepting twice harmless (PRD F5).
      const team = pick(fd, "team", TEAM_IDS, "team");
      const user = await db.user.findUniqueOrThrow({ where: { id: a.userId } });
      const m = await ensureMember(user.email, a.name, team, text(fd, "title", { label: "Role title", max: 60, optional: true }) || "Member");
      await audit(admin.id, "member.add", "Member", m.id, undefined, { fromApplication: a.id, team });
    }
    await db.application.update({ where: { id: a.id }, data: { status, notes } });
    await audit(admin.id, "application.status", "Application", a.id, { status: a.status }, { status });
    return status === "accepted" ? `${a.name} is now a member.` : "Application updated.";
  });
}

// ---------------- access (owners only) ----------------

export async function setRole(fd: FormData) {
  return act("/admin/access", async () => {
    const owner = await requireRole("owner");
    const email = normEmail(text(fd, "email", { label: "Email", max: 200 }));
    const role = pick(fd, "role", ["admin", "owner", "member", "student"] as const, "role") as Role;
    const user = await db.user.findUnique({ where: { email }, include: { member: true } });
    if (!user) throw new FormError("No account with that email. Ask them to sign in once first.");
    if (user.role === "owner" && role !== "owner" && (await db.user.count({ where: { role: "owner" } })) <= 2)
      throw new FormError("There must always be at least two owners. Make someone else an owner first.");
    const next = role === "student" && user.member?.status === "active" ? "member" : role;
    await db.user.update({ where: { id: user.id }, data: { role: next } });
    await audit(owner.id, "access.role", "User", user.id, { role: user.role }, { role: next });
    return `${email} is now ${next === "admin" ? "an admin" : next === "owner" ? "an owner" : `a ${next}`}.`;
  });
}
