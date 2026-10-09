"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Phone, Mail, MapPin, Megaphone } from "lucide-react";
import ScrapPriceTicker from "./ScrapPriceTicker";
import { telHref } from "@/lib/site-settings";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

const navLinks = [
  { href: "/", label: "STRONA GŁÓWNA" },
  { href: "/#o-nas", label: "O NAS" },
  { href: "/uslugi/skup-zlomu", label: "SKUP ZŁOMU" },
  { href: "/uslugi", label: "USŁUGI" },
  { href: "/uslugi/transport", label: "TRANSPORT" },
  { href: "/ogloszenia", label: "OGŁOSZENIA" },
  { href: "/kontakt", label: "KONTAKT" },
];

export default function Navbar() {
  const site = useSiteSettings();
  const siteAddress = `${site.streetAddress}, ${site.postalCode} ${site.addressLocality}`;
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    return href === "/" ? pathname === "/" : pathname === href;
  };

  return (
    <header className="bg-[#000000] border-b border-[#5c4716]">
      {site.announcement.enabled && site.announcement.text && (
        <div className="bg-[#f5b52c] text-black text-sm font-semibold">
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center">
            <Megaphone size={16} className="shrink-0" />
            {site.announcement.link ? (
              <a href={site.announcement.link} className="hover:underline underline-offset-2">
                {site.announcement.text} →
              </a>
            ) : (
              <span>{site.announcement.text}</span>
            )}
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/assets/logo-grempool.png"
            alt="GREMPOOL — Złom, Transport, Usługi"
            className="h-20 md:h-24 w-auto"
          />
        </Link>

        <div className="hidden md:flex flex-col gap-2 border border-[#f5b52c]/50 rounded-lg px-5 py-3 text-sm text-[#e8dfcc]">
          <div className="flex items-center gap-3">
            <MapPin size={15} className="text-[#f5b52c] shrink-0" />
            <span>{siteAddress}</span>
          </div>
          <a href={telHref(site.phone)} className="flex items-center gap-3 hover:text-[#f5b52c] transition-colors">
            <Phone size={15} className="text-[#f5b52c] shrink-0" />
            <span>{site.phone}</span>
          </a>
          <a href={`mailto:${site.email}`} className="flex items-center gap-3 hover:text-[#f5b52c] transition-colors">
            <Mail size={15} className="text-[#f5b52c] shrink-0" />
            <span>{site.email}</span>
          </a>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2" aria-label="Menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <nav className="hidden md:block border-t border-[#5c4716]">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-10 h-14">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`whitespace-nowrap text-sm font-semibold tracking-wide transition-colors pb-1 border-b-2 ${
                    isActive(link.href)
                      ? "text-[#f5b52c] border-[#f5b52c]"
                      : "text-[#e8dfcc] border-transparent hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {isOpen && (
        <nav className="md:hidden bg-[#0a0a0a] border-t border-[#5c4716]">
          <ul className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-sm font-semibold text-[#e8dfcc] hover:text-[#f5b52c]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-[#5c4716] text-sm text-[#e8dfcc] space-y-2">
              <div>{siteAddress}</div>
              <a href={telHref(site.phone)} className="block hover:text-[#f5b52c]">{site.phone}</a>
              <a href={`mailto:${site.email}`} className="block hover:text-[#f5b52c]">{site.email}</a>
            </li>
          </ul>
        </nav>
      )}

      <ScrapPriceTicker />
    </header>
  );
}
