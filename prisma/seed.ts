// Sample data for local development: `npm run db:seed`. Never run against production.
import prisma from "@prisma/client";
import { slugify } from "../src/lib/rules.ts";

if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed a production database.");
const db = new prisma.PrismaClient();
const day = 864e5;

const skills = ["reels", "photography", "videography", "copywriting", "poster design", "video editing", "motion graphics", "anchoring", "strategy"];
for (const name of skills) await db.skillTag.upsert({ where: { name }, create: { name }, update: {} });

// Sample people use obviously fake addresses so they're easy to clear out later.
const people = [
  { email: (process.env.OWNER_EMAILS ?? "president.uset@ltsu.ac.in").split(",")[0].trim(), name: "Club President", team: "leadership", title: "President", role: "owner", skills: ["strategy"] },
  { email: "sample.ideation.uset@ltsu.ac.in", name: "Sample Ideation Lead", team: "ideation", title: "Ideation lead", role: "member", skills: ["strategy", "reels"] },
  { email: "sample.writer.uset@ltsu.ac.in", name: "Sample Writer", team: "writing", title: "Copywriter", role: "member", skills: ["copywriting"] },
  { email: "sample.designer.uset@ltsu.ac.in", name: "Sample Designer", team: "creative", title: "Poster design", role: "member", skills: ["poster design", "motion graphics"] },
  { email: "sample.photo.uset@ltsu.ac.in", name: "Sample Photographer", team: "video", title: "Photographer", role: "member", skills: ["photography"] },
  { email: "sample.editor.uset@ltsu.ac.in", name: "Sample Editor", team: "editing", title: "Reel editor", role: "member", skills: ["video editing", "reels"] },
] as const;

for (const p of people) {
  const user = await db.user.upsert({ where: { email: p.email }, create: { email: p.email, name: p.name, role: p.role }, update: { role: p.role } });
  await db.member.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id, displayName: p.name, visibility: "full", bio: "Sample profile for local development.",
      teams: { create: { team: p.team, title: p.title, isPrimary: true } },
      skills: { connect: p.skills.map((name) => ({ name })) },
    },
    update: {},
  });
}

const events = [
  { title: "USET Annual Fest 2026", type: "fest", date: "2026-03-12", venue: "Main ground", visibility: "public", description: "Three days of music, technology and creativity. The club covered every stage live." },
  { title: "Tech Symposium", type: "seminar", date: "2026-02-20", venue: "Seminar hall", visibility: "public", description: "Talks from industry speakers and alumni." },
  { title: "Freshers' Welcome", type: "fest", date: "2025-09-05", venue: "Auditorium", visibility: "members", description: "Welcoming the new batch." },
  { title: "Reels Workshop", type: "workshop", date: new Date(Date.now() + 10 * day).toISOString().slice(0, 10), venue: "Media lab", visibility: "public", description: "Hands-on session on shooting and editing reels on a phone." },
] as const;

for (const e of events) {
  const date = new Date(e.date);
  const slug = slugify(e.title, date);
  await db.event.upsert({ where: { slug }, create: { ...e, date, slug }, update: {} });
}

if (!(await db.recruitmentWindow.count())) {
  await db.recruitmentWindow.create({
    data: {
      opensAt: new Date(Date.now() - day), closesAt: new Date(Date.now() + 21 * day),
      teams: ["leadership", "ideation", "writing", "creative", "video", "editing"],
      note: "Sample window for local development.",
    },
  });
}

console.log("Seeded: skills, sample members, events and an open recruitment window.");
await db.$disconnect();
