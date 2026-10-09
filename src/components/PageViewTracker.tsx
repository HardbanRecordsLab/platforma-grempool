"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Reports each public page view to our own statistics (no cookies).
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const body = JSON.stringify({ path: pathname, referrer: document.referrer });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/stats/view", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/stats/view", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(
        () => {}
      );
    }
  }, [pathname]);

  return null;
}
