"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { BUSINESS } from "@/lib/site";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "STRONA GŁÓWNA" },
    { href: "/uslugi/skup-zlomu", label: "SKUP ZŁOMU" },
    { href: "/uslugi", label: "USŁUGI" },
    { href: "/uslugi/materialy", label: "SKLEP" },
    { href: "/kontakt", label: "KONTAKT" },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#141210] border-b border-[#352c1d] py-2 text-xs sm:text-sm">
        <div className="container mx-auto px-4 flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-1 text-[#c3b9a7]">
          <a href="https://maps.google.com" className="hidden md:flex items-center gap-2 hover:text-[#d4a24a] transition-colors">
            <MapPin size={14} />
            <span>ul. Kolejowa 5a, 59-307 Raszówka</span>
          </a>
          <a href="tel:+48663288533" className="flex items-center gap-2 hover:text-[#d4a24a] transition-colors">
            <Phone size={14} className="shrink-0" />
            <span>+48 663 288 533</span>
          </a>
          <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-2 hover:text-[#d4a24a] transition-colors">
            <Mail size={14} className="shrink-0" />
            <span>{BUSINESS.email}</span>
          </a>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-[#0b0b0a] sticky top-0 z-50 border-b border-[#352c1d]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img src="/assets/logo-grempool-wide.png" alt="GREMPOOL — Złom, Transport, Usługi" className="h-11 md:h-14 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link text-sm font-medium text-[#c3b9a7] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/wycena"
                className="btn-primary px-6 py-2 rounded-lg text-sm font-semibold text-[#0b0b0a]"
              >
                SZYBKA WYCENA
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-[#141210] border-t border-[#352c1d]">
            <div className="container mx-auto px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 text-[#c3b9a7] hover:text-white border-b border-[#352c1d]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/wycena"
                className="block mt-4 btn-primary px-6 py-3 rounded-lg text-center font-semibold text-[#0b0b0a]"
                onClick={() => setIsOpen(false)}
              >
                SZYBKA WYCENA
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
