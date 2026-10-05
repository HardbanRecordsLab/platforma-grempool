"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { BUSINESS } from "@/lib/site";

const navLinks = [
  { href: "/", label: "STRONA GŁÓWNA" },
  { href: "/#o-nas", label: "O NAS" },
  { href: "/uslugi/skup-zlomu", label: "SKUP ZŁOMU" },
  { href: "/uslugi", label: "USŁUGI" },
  { href: "/uslugi/transport", label: "TRANSPORT" },
  { href: "/uslugi/materialy", label: "OGŁOSZENIA" },
  { href: "/kontakt", label: "KONTAKT" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    return href === "/" ? pathname === "/" : pathname === href;
  };

  return (
    <header className="bg-[#000000] border-b border-[#5c4716]">
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
            <span>ul. Kolejowa 5a, 59-307 Raszówka</span>
          </div>
          <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-3 hover:text-[#f5b52c] transition-colors">
            <Phone size={15} className="text-[#f5b52c] shrink-0" />
            <span>{BUSINESS.phoneDisplay}</span>
          </a>
          <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-3 hover:text-[#f5b52c] transition-colors">
            <Mail size={15} className="text-[#f5b52c] shrink-0" />
            <span>{BUSINESS.email}</span>
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
              <div>ul. Kolejowa 5a, 59-307 Raszówka</div>
              <a href={`tel:${BUSINESS.phone}`} className="block hover:text-[#f5b52c]">{BUSINESS.phoneDisplay}</a>
              <a href={`mailto:${BUSINESS.email}`} className="block hover:text-[#f5b52c]">{BUSINESS.email}</a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
