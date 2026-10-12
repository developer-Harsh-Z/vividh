"use client";
import { useEffect, useState } from "react";

const ORDER = ["auto", "light", "dark"] as const;
type Theme = (typeof ORDER)[number];

// Runs before paint (inlined in <head>) so the saved theme never flashes.
export const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("auto");
  useEffect(() => {
    try { setTheme((localStorage.getItem("theme") as Theme) || "auto"); } catch {}
  }, []);
  const next = () => {
    const t = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(t);
    if (t === "auto") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch {}
  };
  return (
    <button className="icon-btn" onClick={next} aria-label={`Theme: ${theme}. Change theme`} title={`Theme: ${theme}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d={theme === "dark" ? "M12 4a8 8 0 0 0 0 16z" : theme === "light" ? "M12 4v16" : "M12 4a8 8 0 0 1 0 16"} fill="currentColor" />
      </svg>
    </button>
  );
}
