"use client";

import { useEffect } from "react";

/** Re-tints the global aura to match the current mood. */
export function AccentTheme({ colors }: { colors: [string, string, string] }) {
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--accent", colors[0]);
    root.setProperty("--accent-2", colors[1]);
    root.setProperty("--accent-deep", colors[2]);
    return () => {
      root.removeProperty("--accent");
      root.removeProperty("--accent-2");
      root.removeProperty("--accent-deep");
    };
  }, [colors]);
  return null;
}
