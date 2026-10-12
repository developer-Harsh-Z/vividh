"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap page" style={{ minHeight: "50vh", alignContent: "center" }}>
      <h1 className="h-page">Something went wrong on our side.</h1>
      <p className="prose">Try again in a moment. If it keeps happening, tell a VIVIDH admin what you were doing.</p>
      <button className="pill" onClick={reset} style={{ justifySelf: "start" }}>Try again</button>
    </div>
  );
}
