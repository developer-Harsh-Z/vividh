import { EVENT_TYPES } from "@/lib/teams";

type E = { title: string; date: Date; venue: string; type: string; description: string; visibility: string; driveFolderId: string | null };

export default function EventFields({ e }: { e?: E }) {
  return (
    <>
      <div className="grid2">
        <label className="field"><span>Title</span><input name="title" required maxLength={120} defaultValue={e?.title} /></label>
        <label className="field"><span>Date</span><input name="date" type="date" required defaultValue={e?.date.toISOString().slice(0, 10)} /></label>
        <label className="field"><span>Venue</span><input name="venue" maxLength={120} defaultValue={e?.venue} /></label>
        <label className="field"><span>Type</span><select name="type" defaultValue={e?.type ?? "other"}>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className="field"><span>Who can see the album</span>
          <select name="visibility" defaultValue={e?.visibility ?? "members"}><option value="members">Members only</option><option value="public">Public</option></select>
        </label>
        <label className="field"><span>Google Drive folder</span><input name="driveFolder" placeholder="https://drive.google.com/drive/folders/…" defaultValue={e?.driveFolderId ? `https://drive.google.com/drive/folders/${e.driveFolderId}` : ""} /></label>
      </div>
      <label className="field"><span>Description</span><textarea name="description" maxLength={2000} defaultValue={e?.description} /></label>
    </>
  );
}
