"use client";

import { useEffect } from "react";

// Counts one view per listing per browser session.
export default function ViewCounter({ code }: { code: string }) {
  useEffect(() => {
    const key = `viewed:${code}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked (private mode): still count the view.
    }
    fetch("/api/materials/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      keepalive: true,
    }).catch(() => {});
  }, [code]);

  return null;
}
