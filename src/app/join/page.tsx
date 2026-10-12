import Link from "next/link";
import type { Team } from "@prisma/client";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { isUset } from "@/lib/rules";
import { currentWindow, isOpen } from "@/lib/queries";
import { TEAMS, fmtDate, teamName } from "@/lib/teams";
import Flash, { type PageProps } from "@/components/Flash";
import { saveApplication } from "./actions";

export const metadata = { title: "Join", description: "Apply to join VIVIDH, the social media club of USET." };

export default async function Join({ searchParams }: PageProps) {
  const [user, win] = await Promise.all([getUser(), currentWindow()]);
  const open = isOpen(win);
  const app = user && win ? await db.application.findUnique({ where: { windowId_userId: { windowId: win.id, userId: user.id } } }) : null;
  const teams = TEAMS.filter((t) => win?.teams.includes(t.id));
  const uset = user && isUset(user.email, process.env.USET_SUFFIX ?? ".uset@ltsu.ac.in");

  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">{open ? "Recruitment open" : "Recruitment"}</span>
        <h1 className="h-page">Join <span className="under">VIVIDH</span></h1>
        <p className="prose">Six teams: leadership, ideation, writing, creative making, video and photo, and editing. Pick the two that fit you best. No experience is required; show us how you think.</p>
      </div>
      <Flash searchParams={searchParams} />

      {!open && (
        <div className="empty">
          <b>Applications are closed right now.</b>
          <span>{win && win.opensAt > new Date() ? `The next window opens on ${fmtDate(win.opensAt)}.` : "The next window will be announced on Instagram @lamrin_uset."}</span>
        </div>
      )}

      {open && win && (
        <>
          <div className="steps">
            <div><span>Applications close</span><span className="mono">{fmtDate(win.closesAt)}</span></div>
            <div><span>Teams hiring</span><span className="mono">{win.teams.length}</span></div>
          </div>
          {win.note && <p className="prose">{win.note}</p>}
          {app && <p className="row">Your application: <span className={`status ${app.status}`}>{app.status}</span>{app.status === "submitted" && <span className="muted">You can edit it until the deadline.</span>}</p>}

          {!user ? (
            <Link className="pill" href="/login?next=/join" style={{ justifySelf: "start" }}>Sign in with your LTSU account to apply</Link>
          ) : user.member?.status === "active" ? (
            <p className="flash ok">You&apos;re already a VIVIDH member.</p>
          ) : !uset ? (
            <p className="flash error">Applications are open to USET students. Sign in with your .uset@ltsu.ac.in account.</p>
          ) : (!app || app.status === "submitted") && (
            <form action={saveApplication} className="form">
              <fieldset>
                <legend>About you</legend>
                <div className="grid2">
                  <label className="field"><span>Full name</span><input name="name" required maxLength={100} defaultValue={app?.name ?? user.name} /></label>
                  <label className="field"><span>Phone</span><input name="phone" type="tel" required defaultValue={app?.phone} placeholder="98765 43210" /><small>Only admins see this.</small></label>
                  <label className="field"><span>Year</span>
                    <select name="year" required defaultValue={app?.year ?? ""}><option value="" disabled>Choose</option>{[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>Year {y}</option>)}</select>
                  </label>
                  <label className="field"><span>Branch</span><input name="branch" required maxLength={80} defaultValue={app?.branch} placeholder="CSE" /></label>
                </div>
              </fieldset>
              <fieldset>
                <legend>Teams</legend>
                <div className="grid2">
                  <label className="field"><span>First choice</span>
                    <select name="choice1" required defaultValue={app?.choice1 ?? ""}><option value="" disabled>Choose a team</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                  </label>
                  <label className="field"><span>Second choice (optional)</span>
                    <select name="choice2" defaultValue={app?.choice2 ?? ""}><option value="">None</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                  </label>
                </div>
              </fieldset>
              <fieldset>
                <legend>Your work</legend>
                <label className="field"><span>Portfolio or sample link</span><input name="portfolio" type="url" placeholder="https://" defaultValue={app?.portfolio ?? ""} /><small>Instagram, Behance, Drive, YouTube: anything that shows your work.</small></label>
                <label className="field"><span>Task link (Editing and Creative Making)</span><input name="taskLink" type="url" placeholder="https://" defaultValue={app?.taskLink ?? ""} /><small>For Editing: a 15-second edit. For Creative: one poster. Share it as a link.</small></label>
                <label className="field"><span>Why VIVIDH?</span><textarea name="why" required maxLength={1200} defaultValue={app?.why} /><small>150 words or fewer.</small></label>
              </fieldset>
              <button className="pill" style={{ justifySelf: "start" }}>{app ? "Update application" : "Submit application"}</button>
            </form>
          )}
        </>
      )}
      {app && !open && <p className="row">Your last application ({teamName(app.choice1 as Team)}): <span className={`status ${app.status}`}>{app.status}</span></p>}
    </div>
  );
}
