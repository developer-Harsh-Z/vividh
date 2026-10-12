import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { act, FormError, link, text } from "@/lib/form";
import { teamName } from "@/lib/teams";
import Flash, { type PageProps } from "@/components/Flash";

export const metadata = { title: "My profile" };

// Members edit their own bio, links, skills and visibility. Role, team and status are admin-only (PRD F2).
async function saveProfile(fd: FormData) {
  "use server";
  return act("/portal/profile", async () => {
    const user = await requireUser("/portal/profile");
    if (!user.member) throw new FormError("Only members have a profile.");
    const visibility = String(fd.get("visibility"));
    if (!["full", "name", "hidden"].includes(visibility)) throw new FormError("Choose how you appear publicly.");
    const skillIds = fd.getAll("skills").map(String);
    const valid = await db.skillTag.findMany({ where: { id: { in: skillIds } }, select: { id: true } });
    await db.member.update({
      where: { id: user.member.id },
      data: {
        displayName: text(fd, "displayName", { label: "Display name", max: 60 }),
        bio: text(fd, "bio", { label: "Bio", max: 400, optional: true }),
        instagram: link(fd, "instagram", "Instagram"), linkedin: link(fd, "linkedin", "LinkedIn"), portfolio: link(fd, "portfolio", "Portfolio"),
        visibility: visibility as "full" | "name" | "hidden",
        skills: { set: valid },
      },
    });
    return "Profile saved.";
  });
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const user = await requireUser("/portal/profile");
  if (!user.member) redirect("/portal?error=" + encodeURIComponent("Only members have a profile."));
  const [m, skills] = await Promise.all([
    db.member.findUniqueOrThrow({ where: { id: user.member.id }, include: { teams: true, skills: true } }),
    db.skillTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="wrap page">
      <Link className="linkish" href="/portal">← Portal</Link>
      <div className="stack">
        <span className="eyebrow">{m.teams.map((t) => `${teamName(t.team)} · ${t.title}`).join(" / ")}</span>
        <h1 className="h-page">My <em>profile</em></h1>
        <p className="muted">Your photo comes from your Google account.</p>
      </div>
      <Flash searchParams={searchParams} />
      <form action={saveProfile} className="form">
        <label className="field"><span>Display name</span><input name="displayName" required maxLength={60} defaultValue={m.displayName} /></label>
        <label className="field"><span>Short bio</span><textarea name="bio" maxLength={400} defaultValue={m.bio} /></label>
        <fieldset>
          <legend>Links</legend>
          <label className="field"><span>Instagram</span><input name="instagram" type="url" placeholder="https://instagram.com/…" defaultValue={m.instagram ?? ""} /></label>
          <label className="field"><span>LinkedIn</span><input name="linkedin" type="url" placeholder="https://linkedin.com/in/…" defaultValue={m.linkedin ?? ""} /></label>
          <label className="field"><span>Portfolio</span><input name="portfolio" type="url" placeholder="https://" defaultValue={m.portfolio ?? ""} /></label>
        </fieldset>
        {skills.length > 0 && (
          <fieldset>
            <legend>Skills</legend>
            <div className="checks">{skills.map((s) => <label key={s.id}><input type="checkbox" name="skills" value={s.id} defaultChecked={m.skills.some((x) => x.id === s.id)} />{s.name}</label>)}</div>
          </fieldset>
        )}
        <fieldset>
          <legend>How you appear on the public site</legend>
          <div className="checks" style={{ display: "grid" }}>
            <label><input type="radio" name="visibility" value="full" defaultChecked={m.visibility === "full"} />Full card: photo, name and profile page</label>
            <label><input type="radio" name="visibility" value="name" defaultChecked={m.visibility === "name"} />Name only, no photo</label>
            <label><input type="radio" name="visibility" value="hidden" defaultChecked={m.visibility === "hidden"} />Hidden from the public site</label>
          </div>
        </fieldset>
        <button className="pill" style={{ justifySelf: "start" }}>Save profile</button>
      </form>
    </div>
  );
}
