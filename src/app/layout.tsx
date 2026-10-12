import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, Caveat, Instrument_Serif, JetBrains_Mono, Tiro_Devanagari_Hindi } from "next/font/google";
import { getUser } from "@/lib/auth";
import { atLeast } from "@/lib/rules";
import Motion from "@/components/Motion";
import ThemeToggle, { themeScript } from "@/components/ThemeToggle";
import "./globals.css";

const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-serif" });
const sans = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-sans" });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const deva = Tiro_Devanagari_Hindi({ weight: "400", subsets: ["devanagari"], variable: "--font-deva" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "VIVIDH · Social Media Club, USET", template: "%s · VIVIDH" },
  description: "VIVIDH (विविध) is the social media club of USET, Lamrin Tech Skills University. We capture moments, tell stories and build the digital identity of USET.",
  openGraph: { siteName: "VIVIDH", images: ["/logo.png"] },
};
export const viewport: Viewport = { themeColor: "#0A0A0B" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${hand.variable} ${mono.variable} ${deva.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <header className="darkroom nav">
          <div className="wrap">
            <Link href="/" aria-label="VIVIDH home"><img className="logo" src="/logo.png" alt="VIVIDH Social Media Club" width={56} height={56} /></Link>
            <nav className="links" aria-label="Site">
              <Link href="/">Home</Link>
              <Link href="/events">Events</Link>
              <Link href="/team">Team</Link>
              <Link href="/join">Join Us</Link>
            </nav>
            <div className="nav-r">
              <ThemeToggle />
              {user ? (
                <details className="menu">
                  <summary aria-label="Account menu">
                    {user.image ? <img className="avatar" src={user.image} alt="" referrerPolicy="no-referrer" /> : <span className="pill small">{user.name.split(" ")[0]}</span>}
                  </summary>
                  <div className="menu-panel">
                    <span className="label" style={{ padding: "6px 12px" }}>{user.email}</span>
                    <Link href="/portal">My portal</Link>
                    <Link href="/portal/upload">Upload media</Link>
                    {atLeast(user.role, "member") && <Link href="/portal/search">Search archive</Link>}
                    {user.member && <Link href="/portal/profile">Edit my profile</Link>}
                    {atLeast(user.role, "admin") && <Link href="/admin">Admin console</Link>}
                    <form action="/auth/logout" method="post"><button>Sign out</button></form>
                  </div>
                </details>
              ) : (
                <Link className="pill small" href="/login">Login with LTSU</Link>
              )}
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="darkroom">
          <div className="wrap">
            <span className="row"><img src="/logo.png" alt="" width={40} height={40} /><span className="label">VIVIDH · USET, Lamrin Tech Skills University</span></span>
            <span className="row">
              <a className="label" href="https://www.instagram.com/lamrin_uset" target="_blank" rel="noreferrer">Instagram @lamrin_uset</a>
              <Link className="label" href="/removal">Request a photo removal</Link>
            </span>
          </div>
        </footer>
        <Motion />
      </body>
    </html>
  );
}
