"use client";

import { useState } from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import type { Material } from "@/types";
import { CLASSIFIEDS_PORTALS, buildListingText } from "@/lib/classifieds-portals";

export default function PromoteMaterialModal({
  material,
  onClose,
}: {
  material: Material;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const text = buildListingText({
    nazwa: material.nazwa,
    opis: material.notatki,
    cena: material.cena,
    wymiary: material.wymiary,
    ilosc: material.ilosc,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied - user can still select the text manually
    }
  };

  const openPortal = (url: string) => {
    handleCopy();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const grouped = CLASSIFIEDS_PORTALS.reduce<Record<string, typeof CLASSIFIEDS_PORTALS>>((acc, p) => {
    (acc[p.scope] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#0a0a0a] border border-[#5c4716] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#5c4716] sticky top-0 bg-[#0a0a0a]">
          <h2 className="text-xl font-montserrat font-bold">Wystaw na innych portalach</h2>
          <button onClick={onClose} className="text-[#e8dfcc] hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-[#e8dfcc]">Gotowy tekst ogłoszenia</label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-xs font-semibold text-[#f5b52c] hover:underline"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Skopiowano" : "Kopiuj"}
              </button>
            </div>
            <textarea
              readOnly
              value={text}
              rows={9}
              className="w-full bg-[#000000] border border-[#5c4716] rounded-lg p-3 text-sm text-white font-mono"
              onFocus={(e) => e.target.select()}
            />
          </div>

          <p className="text-xs text-[#e8dfcc]">
            Kliknięcie portalu poniżej skopiuje tekst i otworzy stronę w nowej karcie — wklej treść w formularzu
            dodawania ogłoszenia. Żaden z tych portali nie udostępnia darmowego automatycznego publikowania, więc
            każde ogłoszenie trzeba wkleić i wysłać ręcznie.
          </p>

          {Object.entries(grouped).map(([scope, portals]) => (
            <div key={scope}>
              <h3 className="text-xs font-semibold text-[#e8dfcc] uppercase tracking-wide mb-2">{scope}</h3>
              <div className="grid grid-cols-2 gap-2">
                {portals.map((portal) => (
                  <button
                    key={portal.name}
                    onClick={() => openPortal(portal.url)}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#000000] border border-[#5c4716] text-sm hover:border-[#f5b52c] hover:text-[#f5b52c] transition-colors text-left"
                  >
                    <span className="truncate">{portal.name}</span>
                    <ExternalLink size={14} className="shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
