"use client";

import Link from "next/link";
import { Package, ArrowRight, ArrowUpRight, MapPin, Phone, Clock, Star } from "lucide-react";
import type { Material } from "@/types";
import { MATERIAL_CONDITIONS } from "@/lib/materials-store";
import { categoryOf } from "@/lib/listing-categories";
import { telHref } from "@/lib/site-settings";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

// Listing cards shared by the homepage board and the /ogloszenia page.

const conditionLabel = (value: Material["stan"]) =>
  MATERIAL_CONDITIONS.find((c) => c.value === value)?.label ?? value;

export const formatPrice = (price: number) =>
  price.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const inquiryHref = (item: Material) =>
  `/wycena?material=${encodeURIComponent(item.id_materialu)}&nazwa=${encodeURIComponent(item.nazwa)}`;

export function addedAgo(date?: string) {
  if (!date) return null;
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (Number.isNaN(days) || days < 0) return null;
  if (days === 0) return "dziś";
  if (days === 1) return "wczoraj";
  return `${days} dni temu`;
}

export function Price({ value, large = false }: { value?: number; large?: boolean }) {
  if (!value) {
    return <span className={`font-semibold text-[#f5b52c] ${large ? "text-lg" : "text-sm"}`}>Cena do uzgodnienia</span>;
  }
  return (
    <span className={`font-montserrat font-bold text-white leading-none ${large ? "text-4xl" : "text-2xl"}`}>
      {formatPrice(value)}
      <span className={`ml-1 font-semibold text-[#f5b52c] ${large ? "text-lg" : "text-sm"}`}>zł</span>
    </span>
  );
}

export function DemoChip() {
  const site = useSiteSettings();
  if (!site.demoListings) return null;
  return (
    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-[10px] font-bold tracking-[0.15em] text-white/80">
      DEMO
    </span>
  );
}

export function CategoryChip({ item }: { item: Material }) {
  const cat = categoryOf(item.kategoria);
  const Icon = cat?.icon ?? Package;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-[#f5b52c]/40 text-[11px] font-semibold text-[#f5b52c]">
      <Icon size={12} /> {cat?.label ?? item.kategoria}
    </span>
  );
}

export function Specs({ item, dense = false }: { item: Material; dense?: boolean }) {
  const specs = [
    { label: "Ilość", value: `${item.ilosc} szt.` },
    { label: "Stan", value: conditionLabel(item.stan) },
    { label: "Wymiary", value: item.wymiary || "—" },
  ];
  return (
    <dl className={`grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 ${dense ? "py-2.5" : "py-3"}`}>
      {specs.map((s) => (
        <div key={s.label} className="px-2 first:pl-0 last:pr-0 min-w-0">
          <dt className="text-[10px] uppercase tracking-[0.15em] text-[#e8dfcc]/50">{s.label}</dt>
          <dd className="mt-0.5 text-[13px] text-white truncate" title={s.value}>
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function FeaturedCard({ item }: { item: Material }) {
  const site = useSiteSettings();
  const ago = addedAgo(item.utworzone);
  return (
    <article className="group relative sm:col-span-2 lg:row-span-2 min-h-[460px] rounded-2xl overflow-hidden border border-[#f5b52c]/40 bg-black shadow-[0_30px_80px_-30px_rgba(245,181,44,0.35)]">
      {item.zdjecia?.[0] && (
        <img
          src={item.zdjecia[0]}
          alt={item.nazwa}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10" />
      <DemoChip />

      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5b52c] text-black text-[11px] font-bold tracking-[0.15em] uppercase">
          <Star size={12} fill="currentColor" /> Wyróżnione
        </span>
      </div>

      <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <CategoryChip item={item} />
          <span className="text-[11px] font-mono text-[#e8dfcc]/60">{item.id_materialu}</span>
          {ago && (
            <span className="flex items-center gap-1 text-[11px] text-[#e8dfcc]/60">
              <Clock size={11} /> {ago}
            </span>
          )}
        </div>
        <h3 className="font-montserrat font-bold text-2xl md:text-3xl text-white leading-tight mb-5 max-w-lg">
          {item.nazwa}
        </h3>
        <div className="max-w-lg mb-6">
          <Specs item={item} />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#e8dfcc]/50 mb-2">Cena</div>
            <Price value={item.cena} large />
          </div>
          <div className="flex gap-2">
            <Link
              href={inquiryHref(item)}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-black"
            >
              Zapytaj o ofertę <ArrowRight size={16} />
            </Link>
            <a
              href={telHref(site.phone)}
              aria-label="Zadzwoń"
              className="w-12 h-12 flex items-center justify-center rounded-full border border-white/25 text-white hover:border-[#f5b52c] hover:text-[#f5b52c] transition-colors"
            >
              <Phone size={18} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ListingCard({ item }: { item: Material }) {
  const cat = categoryOf(item.kategoria);
  const Icon = cat?.icon ?? Package;
  const ago = addedAgo(item.utworzone);
  return (
    <Link
      href={inquiryHref(item)}
      className="group flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d] hover:border-[#f5b52c]/60 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(245,181,44,0.5)] transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        {item.zdjecia?.[0] ? (
          <img
            src={item.zdjecia[0]}
            alt={item.nazwa}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="text-[#5c4716] size-12" strokeWidth={1.25} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <DemoChip />
        <div className="absolute bottom-3 left-3">
          <CategoryChip item={item} />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between text-[11px] text-[#e8dfcc]/50 mb-1.5">
          <span className="font-mono">{item.id_materialu}</span>
          {ago && <span>{ago}</span>}
        </div>
        <h3 className="font-montserrat font-semibold text-white leading-snug line-clamp-2 min-h-[2.75rem] mb-4">
          {item.nazwa}
        </h3>
        <Specs item={item} dense />
        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <div>
            <Price value={item.cena} />
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#e8dfcc]/50">
              <MapPin size={11} /> Raszówka
            </div>
          </div>
          <span className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-white/15 text-[#f5b52c] group-hover:bg-[#f5b52c] group-hover:border-[#f5b52c] group-hover:text-black transition-colors">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function SellBanner() {
  const site = useSiteSettings();
  return (
    <div className="relative sm:col-span-2 rounded-2xl overflow-hidden border border-[#f5b52c]/40">
      <img
        src="https://images.unsplash.com/photo-1578483006555-aa8ab7bb01e2?auto=format&fit=crop&w=1000&q=70"
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/50" />
      <div className="relative h-full flex flex-col justify-center p-7 md:p-8">
        <span className="text-[11px] font-bold tracking-[0.25em] text-[#f5b52c] uppercase mb-3">Skupujemy</span>
        <h3 className="font-montserrat font-bold text-2xl md:text-3xl text-white leading-tight mb-3">
          Masz coś na sprzedaż?
        </h3>
        <p className="text-sm text-[#e8dfcc] max-w-md mb-6">
          Złom, materiały z rozbiórek, maszyny i sprzęt. Wycenimy szybko i odbierzemy własnym transportem.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/wycena"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-black"
          >
            Zgłoś do wyceny <ArrowRight size={16} />
          </Link>
          <a
            href={telHref(site.phone)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border border-white/25 text-white hover:border-[#f5b52c] hover:text-[#f5b52c] transition-colors"
          >
            <Phone size={16} /> {site.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
