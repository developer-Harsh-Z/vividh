import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { uploadableEvents } from "@/lib/queries";
import Uploader from "@/components/Uploader";
import Flash, { sp, type PageProps } from "@/components/Flash";
import { addLink } from "./actions";

export const metadata = { title: "Upload media" };

export default async function Upload({ searchParams }: PageProps) {
  const user = await requireUser("/portal/upload");
  const [events, p] = await Promise.all([uploadableEvents(user), searchParams]);

  return (
    <div className="wrap page">
      <Link className="linkish" href="/portal">← Portal</Link>
      <div className="stack">
        <span className="eyebrow">Upload</span>
        <h1 className="h-page">Add to the <em>archive</em></h1>
        <p className="prose">Everything you upload is checked by an admin before it appears in an album. Location data is removed from every photo.</p>
      </div>
      <Flash searchParams={searchParams} />
      {events.length === 0 ? (
        <div className="empty"><b>No events to upload to.</b><span>Members can upload to any event. Other students need an invite from an admin for a specific event.</span></div>
      ) : (
        <>
          <Uploader events={events} initialEvent={sp(p.event) || undefined} />
          <details className="form">
            <summary className="pill ghost small" style={{ justifySelf: "start" }}>Add a long video as a link</summary>
            <form action={addLink} className="form" style={{ marginTop: 16 }}>
              <label className="field"><span>Event</span>
                <select name="eventId" defaultValue={sp(p.event)} required>{events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select>
              </label>
              <label className="field"><span>Video link</span><input name="url" type="url" required placeholder="https://youtube.com/…" /><small>YouTube, Instagram or Drive.</small></label>
              <label className="field"><span>Title</span><input name="caption" required maxLength={200} placeholder="Fest aftermovie" /></label>
              <button className="pill" style={{ justifySelf: "start" }}>Add link</button>
            </form>
          </details>
        </>
      )}
    </div>
  );
}
