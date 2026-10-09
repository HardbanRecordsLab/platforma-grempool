"use client";

import { useEffect, useState } from "react";
import { BellRing, BellOff, Loader2, Send, Smartphone } from "lucide-react";

const urlBase64ToUint8Array = (base64: string) => {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

type State = "loading" | "unsupported" | "ios-browser" | "denied" | "off" | "on";

async function panelRegistration() {
  return (
    (await navigator.serviceWorker.getRegistration("/admin/")) ??
    (await navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin/" }))
  );
}

// Turns push notifications about new inquiries on or off for this device.
export default function PushSettings() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState(ios && !standalone ? "ios-browser" : "unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      const reg = await panelRegistration();
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    };
    check().catch(() => setState("unsupported"));
  }, []);

  const enable = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error("Brak klucza powiadomień na serwerze");
      const reg = await panelRegistration();
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }));
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("Nie udało się zapisać urządzenia");
      setState("on");
      setMessage("Włączone. Wyślij test, żeby sprawdzić.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Nie udało się włączyć powiadomień");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await panelRegistration();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
      setMessage("Wyłączone na tym urządzeniu.");
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true);
    const res = await fetch("/api/push/test", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    setMessage(res.ok ? `Wysłano na ${body.sent} urządz. — powinno pojawić się za chwilę.` : "Nie udało się wysłać testu.");
    setBusy(false);
  };

  return (
    <div className="mt-8 p-5 rounded-xl bg-[#000000] border border-[#5c4716]">
      <h3 className="font-semibold flex items-center gap-2 mb-1">
        <Smartphone size={18} className="text-[#f5b52c]" /> Powiadomienia na telefon (push)
      </h3>
      <p className="text-sm text-[#e8dfcc] mb-4">
        Dzwonek na telefonie, gdy przyjdzie nowe zapytanie o wycenę lub wiadomość — także przy zablokowanym ekranie.
        Włącz osobno na każdym urządzeniu.
      </p>

      {state === "loading" && (
        <div className="flex items-center gap-2 text-sm text-[#e8dfcc]">
          <Loader2 size={16} className="animate-spin" /> Sprawdzanie...
        </div>
      )}
      {state === "unsupported" && (
        <p className="text-sm text-[#e8dfcc]">Ta przeglądarka nie obsługuje powiadomień push. Użyj Chrome, Edge lub Safari.</p>
      )}
      {state === "ios-browser" && (
        <p className="text-sm text-[#e8dfcc]">
          Na iPhonie powiadomienia działają tylko w zainstalowanej aplikacji: zainstaluj panel (przycisk „Zainstaluj” na
          górze), otwórz go z ikony na ekranie i wróć tutaj.
        </p>
      )}
      {state === "denied" && (
        <p className="text-sm text-red-400">
          Powiadomienia są zablokowane w ustawieniach przeglądarki dla tej strony. Odblokuj je (ikona kłódki przy adresie)
          i odśwież stronę.
        </p>
      )}
      {(state === "off" || state === "on") && (
        <div className="flex flex-wrap items-center gap-3">
          {state === "off" ? (
            <button
              onClick={enable}
              disabled={busy}
              className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold text-black flex items-center gap-2 disabled:opacity-60"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />} Włącz na tym urządzeniu
            </button>
          ) : (
            <>
              <span className="text-sm text-green-400 flex items-center gap-1.5">
                <BellRing size={16} /> Włączone na tym urządzeniu
              </span>
              <button
                onClick={test}
                disabled={busy}
                className="px-4 py-2 rounded-lg border border-[#5c4716] text-sm text-white hover:border-[#f5b52c] flex items-center gap-2 disabled:opacity-60"
              >
                <Send size={15} /> Wyślij test
              </button>
              <button
                onClick={disable}
                disabled={busy}
                className="px-4 py-2 rounded-lg border border-[#5c4716] text-sm text-[#e8dfcc] hover:text-red-400 flex items-center gap-2 disabled:opacity-60"
              >
                <BellOff size={15} /> Wyłącz
              </button>
            </>
          )}
        </div>
      )}
      {message && <p className="text-sm text-[#e8dfcc] mt-3">{message}</p>}
    </div>
  );
}
