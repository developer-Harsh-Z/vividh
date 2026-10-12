import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { atLeast } from "@/lib/rules";
import { canViewEvent } from "@/lib/queries";
import { fmtDate } from "@/lib/teams";
import Lightbox from "@/components/Lightbox";
import type { PageProps } from "@/components/Flash";

const load = (slug: string) => db.event.findUnique({
  where: { slug },
  include: {
    media: { where: { status: "approved" }, orderBy: { createdAt: "asc" } },
    credits: { include: { member: { select: { id: true, displayName: true, status: true, visibility: true } } } },
  },
});

export async function generateMetadata({ params }: PageProps<{ slug: string }>): Promise<Metadata> {
  const e = await load((await params).slug);
  if (!e || e.visibility !== "public" || e.archivedAt) return { title: "Event" };
  const cover = e.coverId ?? e.media.find((m) => m.kind === "image")?.id;
  return { title: e.title, description: e.description.slice(0, 160) || `${e.title}, covered by VIVIDH.`, openGraph: cover ? { images: [`/media/${cover}/display`] } : undefined };
}

export default async function EventPage({ params }: PageProps<{ slug: string }>) {
  const { slug } = await params;
  const [e, user] = await Promise.all([load(slug), getUser()]);
  if (!e) notFound();
  if (!canViewEvent(e, user)) {
    if (!user) redirect(`/login?next=/events/${slug}`);
    notFound();
  }
  const shots = e.media.filter((m) => m.kind !== "link").map((m) => ({ id: m.id, kind: m.kind as "image" | "video", alt: m.altText || m.caption || e.title, caption: m.caption, w: m.width, h: m.height }));
  const links = e.media.filter((m) => m.kind === "link");
  const photos = shots.filter((s) => s.kind === "image").length;

  return (
    <div className="wrap page">
      <Link className="linkish" href="/events">← All events</Link>
      <header className="stack">
        <span className="row"><span className="eyebrow">{e.type}</span><span className="mono">{fmtDate(e.date)}{e.venue && ` · ${e.venue}`}</span>{e.visibility === "members" && <span className="status">members only</span>}</span>
        <h1 className="h-page">{e.title}</h1>
        {e.description && <p className="prose">{e.description}</p>}
        <div className="row mono"><span>{photos} photos</span><span>{shots.length - photos} videos</span><span>{e.credits.length} creators</span></div>
      </header>

      {e.credits.length > 0 && (
        <section className="stack">
          <span className="label">Covered by</span>
          <div className="chips">
            {e.credits.map(({ member: m, contribution }) =>
              m.status === "removed" ? <span key={m.id} className="chip">Former member · {contribution}</span>
              : m.visibility === "full" ? <Link key={m.id} className="chip" href={`/team/${m.id}`}>{m.displayName} · {contribution}</Link>
              : m.visibility === "name" ? <span key={m.id} className="chip">{m.displayName} · {contribution}</span> : null)}
          </div>
        </section>
      )}

      {links.length > 0 && (
        <section className="stack">
          <span className="label">Reels and videos</span>
          <ul>{links.map((l) => <li key={l.id}><a href={l.url!} target="_blank" rel="noreferrer">{l.caption || l.url}</a></li>)}</ul>
        </section>
      )}

      {shots.length ? <Lightbox items={shots} canDownload={atLeast(user?.role, "member")} />
        : <div className="empty"><b>No approved photos yet.</b><span>Covered this event? <Link href={`/portal/upload?event=${e.id}`}>Upload your photos</Link>.</span></div>}
    </div>
  );
}
