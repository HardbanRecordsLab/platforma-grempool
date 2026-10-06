"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

// Chrome/Edge fire this event when the panel can be installed; it is not in
// the standard DOM typings.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  // iPadOS reports itself as a Mac with touch support.
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export default function InstallAppButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);
  const [ios, setIos] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStandalone()) return;
    setHidden(false);
    setIos(isIOS());

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setHelpOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (hidden) return null;

  const install = async () => {
    if (!installEvent) {
      setHelpOpen((v) => !v);
      return;
    }
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === "accepted") setHidden(true);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={install}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#f5b52c] text-black text-sm font-bold hover:brightness-110 transition"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Zainstaluj aplikację</span>
        <span className="sm:hidden">Zainstaluj</span>
      </button>

      {helpOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-2 w-72 z-50 rounded-xl border border-[#5c4716] bg-[#0a0a0a] p-4 shadow-2xl text-sm text-[#e8dfcc]">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-white">Jak zainstalować panel</h3>
            <button onClick={() => setHelpOpen(false)} aria-label="Zamknij" className="text-[#e8dfcc] hover:text-white">
              <X size={16} />
            </button>
          </div>
          {ios ? (
            <ol className="space-y-2.5">
              <li className="flex gap-2">
                <span className="text-[#f5b52c] font-bold">1.</span>
                <span>
                  Otwórz panel w <strong className="text-white">Safari</strong>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#f5b52c] font-bold">2.</span>
                <span className="flex flex-wrap items-center gap-1">
                  Stuknij <Share size={14} className="text-[#f5b52c]" /> <strong className="text-white">Udostępnij</strong>{" "}
                  na dole ekranu.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#f5b52c] font-bold">3.</span>
                <span className="flex flex-wrap items-center gap-1">
                  Wybierz <SquarePlus size={14} className="text-[#f5b52c]" />{" "}
                  <strong className="text-white">Do ekranu początkowego</strong>.
                </span>
              </li>
            </ol>
          ) : (
            <ol className="space-y-2.5">
              <li className="flex gap-2">
                <span className="text-[#f5b52c] font-bold">1.</span>
                <span>
                  Otwórz panel w <strong className="text-white">Chrome</strong> lub{" "}
                  <strong className="text-white">Edge</strong>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#f5b52c] font-bold">2.</span>
                <span>
                  Otwórz menu przeglądarki <strong className="text-white">⋮</strong>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#f5b52c] font-bold">3.</span>
                <span>
                  Wybierz <strong className="text-white">Zainstaluj aplikację</strong> lub{" "}
                  <strong className="text-white">Dodaj do ekranu głównego</strong>.
                </span>
              </li>
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
