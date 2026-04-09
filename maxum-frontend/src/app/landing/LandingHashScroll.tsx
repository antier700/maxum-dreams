"use client";

import { useEffect } from "react";

/**
 * After navigating from another route to `/#section`, scroll the matching `id` into view.
 */
export function LandingHashScroll() {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const scrollTo = () => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    requestAnimationFrame(scrollTo);
    const t = window.setTimeout(scrollTo, 150);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}
