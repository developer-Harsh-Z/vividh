import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page" style={{ minHeight: "50vh", alignContent: "center" }}>
      <span className="hand" style={{ fontSize: 32 }}>Out of frame…</span>
      <h1 className="h-page">This page doesn&apos;t exist, or you don&apos;t have access to it.</h1>
      <Link className="pill" href="/" style={{ justifySelf: "start" }}>Back home</Link>
    </div>
  );
}
