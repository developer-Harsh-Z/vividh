"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// One observer for the whole page: scroll reveals (.rv), count-ups ([data-count]) and hero parallax ([data-speed]).
// Content is visible without this; it only adds motion, and does nothing under reduced motion.
export default function Motion() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const countUp = (el: HTMLElement) => {
      const end = Number(el.dataset.count), suffix = el.dataset.suffix ?? "";
      let t0 = 0;
      const step = (t: number) => {
        t0 ||= t;
        const k = Math.min((t - t0) / 1200, 1);
        el.textContent = Math.round(end * (1 - (1 - k) ** 3)).toLocaleString("en-IN") + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.remove("pre");
        el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
        io.unobserve(el);
      }
    }, { rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll<HTMLElement>(".rv").forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("pre"); io.observe(el); }
    });

    const prints = document.querySelectorAll<HTMLElement>("[data-speed]");
    let ticking = false;
    const drift = () => {
      ticking = false;
      prints.forEach((p) => {
        const r = p.getBoundingClientRect();
        p.style.setProperty("--py", `${((r.top + r.height / 2 - innerHeight / 2) * Number(p.dataset.speed)).toFixed(1)}px`);
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(drift); } };
    if (prints.length) { addEventListener("scroll", onScroll, { passive: true }); drift(); }

    return () => { io.disconnect(); removeEventListener("scroll", onScroll); };
  }, [path]);
  return null;
}
