"use client";

import { useEffect, useRef } from "react";

/**
 * Fades + lifts children in when they scroll into view.
 * `immediate` = plays on page load with pure CSS (for above-the-fold content, so the
 * hero is never blank while JavaScript loads on a slow TikTok in-app browser).
 * Without JS (no `js` class on <html>), everything is simply visible.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  immediate = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  immediate?: boolean;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || immediate) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);
  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`${immediate ? "reveal-now" : "reveal"} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
