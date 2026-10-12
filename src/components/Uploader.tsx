"use client";
import { useState } from "react";
import { requestUploads, confirmUpload } from "@/app/portal/upload/actions";

type Row = { file: File; pct: number; state: "waiting" | "uploading" | "done" | "error"; msg?: string };
const ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/quicktime"; // no HEIC: iOS converts to JPEG (D23)

// PUT straight to storage with a presigned URL; XHR because fetch has no upload progress.
function put(url: string, file: File, onPct: (n: number) => void) {
  return new Promise<void>((ok, fail) => {
    const x = new XMLHttpRequest();
    x.open("PUT", url);
    x.setRequestHeader("content-type", file.type);
    x.upload.onprogress = (e) => e.lengthComputable && onPct(Math.round((e.loaded / e.total) * 100));
    x.onload = () => (x.status < 300 ? ok() : fail(new Error(`Upload failed (${x.status})`)));
    x.onerror = () => fail(new Error("Network error. Check your connection and retry."));
    x.send(file);
  });
}

export default function Uploader({ events, initialEvent }: { events: { id: string; title: string }[]; initialEvent?: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const patch = (i: number, p: Partial<Row>) => setRows((r) => r.map((x, n) => (n === i ? { ...x, ...p } : x)));
  const add = (list: FileList | null) => list && setRows((r) => [...r, ...[...list].map((file) => ({ file, pct: 0, state: "waiting" as const }))]);

  async function submit(fd: FormData) {
    setError("");
    const todo = rows.map((r, i) => ({ r, i })).filter(({ r }) => r.state !== "done");
    if (!todo.length) return setError("Choose at least one photo or clip.");
    setBusy(true);
    const res = await requestUploads({
      eventId: String(fd.get("eventId")), caption: String(fd.get("caption") ?? ""), altText: String(fd.get("altText") ?? ""),
      tags: String(fd.get("tags") ?? ""), files: todo.map(({ r }) => ({ name: r.file.name, type: r.file.type, size: r.file.size })),
    });
    if ("error" in res) { setBusy(false); return setError(res.error); }

    let next = 0; // three uploads at a time
    const worker = async () => {
      while (next < todo.length) {
        const k = next++, { r, i } = todo[k], { id, url } = res.items[k];
        try {
          patch(i, { state: "uploading" });
          await put(url, r.file, (pct) => patch(i, { pct }));
          const c = await confirmUpload(id);
          patch(i, c.ok ? { state: "done", pct: 100 } : { state: "error", msg: c.error });
        } catch (e) {
          patch(i, { state: "error", msg: (e as Error).message });
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    setBusy(false);
  }

  const done = rows.filter((r) => r.state === "done").length;
  return (
    <form action={submit} className="form">
      <label className="field"><span>Event</span>
        <select name="eventId" defaultValue={initialEvent} required>
          {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </label>
      <label className={`drop${over ? " over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}>
        <b>Choose photos and clips</b>
        <span className="muted">JPEG, PNG or WebP up to 25 MB · MP4 or MOV up to 50 MB</span>
        <input type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => add(e.target.files)} />
      </label>
      {rows.length > 0 && (
        <div className="files" aria-live="polite">
          {rows.map((r, i) => (
            <div className="file" key={i}>
              <span>{r.file.name}</span>
              <span className={`status ${r.state === "done" ? "approved" : r.state === "error" ? "failed" : "pending"}`}>{r.state === "error" ? "failed" : r.state}</span>
              <progress max={100} value={r.pct} />
              {r.msg && <small className="muted" style={{ gridColumn: "1 / -1" }}>{r.msg}</small>}
            </div>
          ))}
        </div>
      )}
      <div className="grid2">
        <label className="field"><span>Caption</span><input name="caption" maxLength={300} placeholder="Main stage, closing night" /></label>
        <label className="field"><span>Tags</span><input name="tags" placeholder="stage, crowd, trophy" /><small>Comma-separated</small></label>
      </div>
      <label className="field"><span>Describe the photos</span><input name="altText" maxLength={300} placeholder="Students dancing in front of the main stage" /><small>Read aloud to people using screen readers</small></label>
      {error && <p className="flash error">{error}</p>}
      <div className="row">
        <button className="pill" disabled={busy}>{busy ? "Uploading…" : "Upload"}</button>
        {done > 0 && <span className="muted">{done} sent for approval</span>}
      </div>
    </form>
  );
}
