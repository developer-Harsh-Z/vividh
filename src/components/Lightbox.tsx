"use client";
import { useEffect, useRef, useState } from "react";

export type Shot = { id: string; kind: "image" | "video"; alt: string; caption: string; w?: number | null; h?: number | null };

// Album grid plus a full-screen viewer: arrow keys, swipe, Esc to close (native <dialog>).
export default function Lightbox({ items, canDownload }: { items: Shot[]; canDownload: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState(-1);
  const x0 = useRef(0);
  const cur = items[i];
  const go = (d: number) => setI((n) => (n + d + items.length) % items.length);

  useEffect(() => {
    if (i < 0) return;
    if (!ref.current?.open) ref.current?.showModal();
    const key = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  });

  return (
    <>
      <div className="album">
        {items.map((m, n) => (
          <div key={m.id}>
            <button onClick={() => setI(n)} aria-label={`Open ${m.alt || "photo"}`}>
              {m.kind === "video"
                ? <video src={`/media/${m.id}/display`} muted preload="metadata" />
                : <img src={`/media/${m.id}/thumb`} alt={m.alt} loading="lazy" width={m.w ?? undefined} height={m.h ?? undefined} />}
            </button>
          </div>
        ))}
      </div>
      <dialog ref={ref} className="lightbox" onClose={() => setI(-1)}
        onPointerDown={(e) => { x0.current = e.clientX; }}
        onPointerUp={(e) => { const dx = e.clientX - x0.current; if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1); }}>
        {cur && (
          <div className="lb">
            <div className="lb-bar">
              <span className="mono">{i + 1} / {items.length}</span>
              <button onClick={() => ref.current?.close()} autoFocus>Close</button>
            </div>
            <div className="lb-img">
              {cur.kind === "video"
                ? <video src={`/media/${cur.id}/display`} controls autoPlay />
                : <img src={`/media/${cur.id}/display`} alt={cur.alt} />}
            </div>
            <div className="lb-bar">
              <button onClick={() => go(-1)} aria-label="Previous">←</button>
              <span>{cur.caption}</span>
              <span className="row">
                {canDownload && <a href={`/media/${cur.id}/original`} target="_blank" rel="noreferrer">Full size</a>}
                <a href={`/removal?m=${cur.id}`}>Request removal</a>
                <button onClick={() => go(1)} aria-label="Next">→</button>
              </span>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
