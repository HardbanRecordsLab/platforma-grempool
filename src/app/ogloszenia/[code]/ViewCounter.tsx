"use client";

import { useEffect } from "react";

// Reports a view of the listing. The server counts each visitor once per
// listing per day; nothing is stored in the browser.
export default function ViewCounter({ code }: { code: string }) {
  useEffect(() => {
    fetch("/api/materials/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      keepalive: true,
    }).catch(() => {});
  }, [code]);

  return null;
}
