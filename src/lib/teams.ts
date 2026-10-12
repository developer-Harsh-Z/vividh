import type { Team } from "@prisma/client";

export const TEAMS: { id: Team; name: string; line: string }[] = [
  { id: "leadership", name: "Leadership", line: "Guiding the vision" },
  { id: "ideation", name: "Ideation", line: "Ideas into impact" },
  { id: "writing", name: "Content Writing", line: "Stories that speak" },
  { id: "creative", name: "Creative Making", line: "Designs that stop the scroll" },
  { id: "video", name: "Videography & Photography", line: "Moments, framed" },
  { id: "editing", name: "Editing", line: "Where it all comes together" },
];
export const TEAM_IDS = TEAMS.map((t) => t.id);
export const teamName = (id: Team) => TEAMS.find((t) => t.id === id)?.name ?? id;

export const EVENT_TYPES = ["workshop", "fest", "seminar", "competition", "other"] as const;
export const APP_STATUSES = ["submitted", "shortlisted", "interview", "accepted", "rejected", "waitlisted"] as const;

export const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", ...opts });
