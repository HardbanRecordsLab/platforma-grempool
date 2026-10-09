"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Package, X } from "lucide-react";

export default function ListingGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const count = photos.length;

  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed, count]);

  if (count === 0) {
    return (
      <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-[#0d0d0d] flex items-center justify-center">
        <Package className="text-[#5c4716] size-16" strokeWidth={1.25} />
      </div>
    );
  }

  const arrows = (large: boolean) =>
    count > 1 && (
      <>
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label="Poprzednie zdjęcie"
          className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-[#f5b52c] hover:text-black transition-colors ${
            large ? "w-12 h-12" : "w-10 h-10"
          }`}
        >
          <ChevronLeft size={large ? 24 : 20} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          aria-label="Następne zdjęcie"
          className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-[#f5b52c] hover:text-black transition-colors ${
            large ? "w-12 h-12" : "w-10 h-10"
          }`}
        >
          <ChevronRight size={large ? 24 : 20} />
        </button>
      </>
    );

  return (
    <div>
      <div
        className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black cursor-zoom-in"
        onClick={() => setZoomed(true)}
      >
        <img src={photos[index]} alt={`${alt} — zdjęcie ${index + 1}`} className="w-full h-full object-cover" />
        {arrows(false)}
        {count > 1 && (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-xs text-white">
            {index + 1} / {count}
          </span>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIndex(i)}
              aria-label={`Zdjęcie ${i + 1}`}
              className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === index ? "border-[#f5b52c]" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoomed && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setZoomed(false)}>
          <button
            onClick={() => setZoomed(false)}
            aria-label="Zamknij"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <img
            src={photos[index]}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {arrows(true)}
        </div>
      )}
    </div>
  );
}
