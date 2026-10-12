"use server";
import type { Team } from "@prisma/client";
import { db, env } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isUset } from "@/lib/rules";
import { currentWindow, isOpen } from "@/lib/queries";
import { act, FormError, int, link, pick, text } from "@/lib/form";

export async function saveApplication(fd: FormData) {
  return act("/join", async () => {
    const user = await requireUser("/join");
    const win = await currentWindow();
    if (!win || !isOpen(win)) throw new FormError("Applications are closed right now.");
    if (!isUset(user.email, env("USET_SUFFIX"))) throw new FormError("Applications are open to USET students (.uset@ltsu.ac.in accounts).");
    if (user.member?.status === "active") throw new FormError("You're already a VIVIDH member.");

    const teams = win.teams as Team[];
    const choice1 = pick(fd, "choice1", teams, "first team");
    const c2 = String(fd.get("choice2") ?? "");
    const choice2 = c2 ? pick(fd, "choice2", teams, "second team") : null;
    if (choice2 === choice1) throw new FormError("Pick two different teams, or leave the second choice empty.");
    const why = text(fd, "why", { label: "Why VIVIDH", max: 1200 });
    if (why.split(/\s+/).length > 150) throw new FormError("Keep “Why VIVIDH” to 150 words or fewer.");
    const phone = text(fd, "phone", { label: "Phone", max: 20 }).replace(/[\s-]/g, "");
    if (!/^\+?\d{10,13}$/.test(phone)) throw new FormError("Enter a valid phone number.");

    const data = {
      name: text(fd, "name", { label: "Name", max: 100 }), year: int(fd, "year", 1, 5, "Year"),
      branch: text(fd, "branch", { label: "Branch", max: 80 }), phone, choice1, choice2, why,
      portfolio: link(fd, "portfolio", "Portfolio link"), taskLink: link(fd, "taskLink", "Task link"),
    };
    const existing = await db.application.findUnique({ where: { windowId_userId: { windowId: win.id, userId: user.id } } });
    if (existing && existing.status !== "submitted") throw new FormError("Your application is already being reviewed, so it can't be edited.");
    await db.application.upsert({
      where: { windowId_userId: { windowId: win.id, userId: user.id } },
      create: { ...data, windowId: win.id, userId: user.id },
      update: data,
    });
    return existing ? "Application updated." : "Application submitted. We'll be in touch.";
  });
}
