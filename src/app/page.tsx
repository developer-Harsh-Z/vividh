import Link from "next/link";
import { db } from "@/lib/db";
import { TEAMS, fmtDate } from "@/lib/teams";
import { currentWindow } from "@/lib/queries";

const STAR = "M25 3 L31 18 L47 19 L34 29 L39 46 L25 36 L11 46 L16 29 L3 19 L19 18 Z";
const Star = ({ style }: { style?: React.CSSProperties }) => (
  <svg className="doodle star" viewBox="0 0 50 50" aria-hidden="true" style={style}><path d={STAR} /></svg>
);

export default async function Home() {
  const publicMedia = { status: "approved" as const, event: { visibility: "public" as const, archivedAt: null } };
  const [eventsCovered, members, photos, featured, latest, win] = await Promise.all([
    db.event.count({ where: { media: { some: { status: "approved" } } } }),
    db.member.count({ where: { status: "active" } }),
    db.media.count({ where: { status: "approved" } }),
    db.media.findMany({ where: { ...publicMedia, kind: "image" }, orderBy: { reviewedAt: "desc" }, take: 5, include: { event: true } }),
    db.event.findMany({
      where: { visibility: "public", archivedAt: null }, orderBy: { date: "desc" }, take: 4,
      include: { media: { where: { status: "approved", kind: "image" }, take: 1, select: { id: true } }, _count: { select: { media: { where: { status: "approved" } } } } },
    }),
    currentWindow(),
  ]);
  const open = win && win.opensAt <= new Date() && win.closesAt > new Date();

  return (
    <>
      <div className="darkroom">
        <section className="hero">
          <div className="wrap">
            <div className="hero-copy">
              <div className="words"><span>Stories</span><span>Perspectives</span><span>Creativity</span><span>Community</span></div>
              <svg className="sparkle" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0C21 14 26 19 40 20C26 21 21 26 20 40C19 26 14 21 0 20C14 19 19 14 20 0Z" /></svg>
              <div className="mast-wrap">
                <h1 className="mast" aria-label="VIVIDH">{"VIVIDH".split("").map((c, i) => <span key={i} aria-hidden="true">{c}</span>)}</h1>
                <svg className="swoosh" viewBox="0 0 400 44" preserveAspectRatio="none" aria-hidden="true"><path d="M6 30 C 90 10, 240 4, 396 12 M 70 40 C 170 26, 270 24, 336 30" /></svg>
              </div>
              <div className="club">Social Media Club</div>
              <div className="eyebrow">University School of Engineering and Technology</div>
              <p className="lede">We capture moments, tell stories and build the digital identity of USET.</p>
              <Link className="pill" href="/events" style={{ justifySelf: "start" }}>Explore our work <span className="arr">→</span></Link>
              <div className="socials">
                <a href="https://www.instagram.com/lamrin_uset" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" /></svg>
                </a>
              </div>
            </div>
            <div className="collage" aria-hidden="true">
              <div className="print c-top" data-speed="-0.05"><img src="/home/stage.jpg" alt="" /></div>
              <div className="print c-main" data-speed="0.03"><span className="tape" /><img src="/home/hero.jpg" alt="" /></div>
              <div className="print c-bl" data-speed="-0.06"><span className="tape" /><img src="/home/crowd.jpg" alt="" /></div>
              <div className="print c-br" data-speed="0.07"><img src="/home/crew.jpg" alt="" /></div>
              <div className="note hand"><span>People</span><span>Ideas</span><span>Events</span><span>Content</span><span>Impact</span></div>
              <div className="more hand">More<br />than<br />content</div>
              <svg className="doodle crown" viewBox="0 0 96 70"><path d="M10 62 L16 18 L34 42 L48 8 L62 42 L80 18 L86 62 Z M14 52 L82 52" /></svg>
              <Star />
            </div>
          </div>
        </section>
        <div className="ticker" aria-hidden="true">
          <div className="track">
            {[0, 1].map((k) => <span key={k}>{TEAMS.map((t) => <span key={t.id}>{t.name}<b>+</b></span>)}</span>)}
          </div>
        </div>
      </div>

      <section className="block">
        <div className="wrap">
          <div className="who">
            <div className="stack rv">
              <span className="eyebrow">+ Who we are</span>
              <h2 className="h-serif">A community of <span className="mark">creators<svg viewBox="0 0 220 90" preserveAspectRatio="none" aria-hidden="true"><path d="M30 14 C 120 -4, 214 14, 212 46 C 210 82, 60 92, 14 64 C -10 48, 20 18, 70 10" /></svg></span></h2>
              <p className="prose"><b>VIVIDH</b> (<span className="deva">विविध</span>, “diverse”) is the official social media club of USET. We create, collaborate and celebrate creativity across photography, videography, design, writing and more.</p>
              <Link className="pill" href="/team" style={{ justifySelf: "start" }}>Meet the team <span className="arr">→</span></Link>
            </div>
            <div className="stats rv">
              <div className="stat"><b>6</b><span>Teams</span></div>
              <div className="stat"><b data-count={eventsCovered}>{eventsCovered}</b><span>Events covered</span></div>
              <div className="stat"><b data-count={members}>{members}</b><span>Active members</span></div>
              <div className="stat"><b data-count={photos}>{photos.toLocaleString("en-IN")}</b><span>Photos in the archive</span></div>
            </div>
            <div className="group rv" aria-hidden="true">
              <span className="bar" />
              <div className="print"><img src="/home/group.jpg" alt="" /></div>
              <div className="note hand"><span>Same people,</span><span>different</span><span>perspectives</span></div>
              <Star />
            </div>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="split">
            <div className="rv">
              <span className="eyebrow">Our teams</span>
              <h2 className="h-serif">Different voices<br /><em className="under">One vision</em></h2>
            </div>
            <div className="tgrid">
              {TEAMS.map((t) => (
                <Link key={t.id} className="tcard rv" data-team={t.id} href={`/team?team=${t.id}`}>
                  <img src={`/teams/${t.id}.jpg`} alt="" />
                  <div className="tbar"><b>{t.name}</b><small>{t.line}</small><i>→</i></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="block" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="head rv">
              <div><span className="eyebrow">Featured work</span><h2 className="h-serif">Moments <em>that matter</em></h2></div>
              <Link className="pill" href="/events">View all <span className="arr">→</span></Link>
            </div>
            <div className="bento rv">
              {featured.map((m, i) => (
                <Link key={m.id} className={`tile ${["big", "", "", "tall", "wide"][i]}`} href={`/events/${m.event.slug}`}>
                  <img src={`/media/${m.id}/${i === 0 ? "display" : "thumb"}`} alt={m.altText || m.caption} loading="lazy" />
                  {(i === 0 || i === 4) && <span className="cap"><b>{m.event.title}</b><span>{fmtDate(m.event.date, { month: "short", year: "numeric" })}</span></span>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="block" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="head rv">
              <div><span className="eyebrow">Events</span><h2 className="h-serif">From campus moments to <em>flagship fests</em></h2></div>
            </div>
            <div className="egrid">
              {latest.map((e) => (
                <Link key={e.id} className="ecard rv" href={`/events/${e.slug}`}>
                  <div className="img">{(e.coverId ?? e.media[0]?.id) ? <img src={`/media/${e.coverId ?? e.media[0].id}/thumb`} alt="" loading="lazy" /> : <span className="label">No photos yet</span>}</div>
                  <div className="meta"><b>{e.title}</b><span className="mono">{fmtDate(e.date, { month: "short", year: "numeric" })}</span></div>
                  <span className="mono">{e._count.media} photos</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="join">
        <div className="wrap">
          <div className="stack rv">
            <span className="eyebrow">{open ? "Recruitment open" : "Recruitment"}</span>
            <h2 className="h-serif">Join <span className="under">VIVIDH</span></h2>
            <p className="prose">Be part of the creative community. Showcase your skills, learn, collaborate and create impact.</p>
            {win && (
              <div className="steps">
                <div><span>{open ? "Applications close" : win.opensAt > new Date() ? "Applications open" : "Last window closed"}</span>
                  <span className="mono">{fmtDate(open || win.opensAt <= new Date() ? win.closesAt : win.opensAt)}</span></div>
              </div>
            )}
            <Link className="pill" href="/join" style={{ justifySelf: "start" }}>{open ? "Apply now" : "How to join"} <span className="arr">→</span></Link>
          </div>
          <div className="join-art rv" aria-hidden="true">
            <div className="print"><img src="/home/portrait.jpg" alt="" /></div>
            <div className="note hand"><span>Create,</span><span>collaborate,</span><span>grow,</span><span>belong</span></div>
            <Star />
          </div>
        </div>
      </section>
    </>
  );
}
