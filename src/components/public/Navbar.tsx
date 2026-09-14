"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "STRONA GŁÓWNA" },
    { href: "/#o-nas", label: "O NAS" },
    { href: "/uslugi/skup-zlomu", label: "SKUP ZŁOMU" },
    { href: "/uslugi", label: "USŁUGI" },
    { href: "/uslugi/materialy", label: "SKLEP" },
    { href: "/kontakt", label: "KONTAKT" },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#1a2332] py-2 text-sm">
        <div className="container mx-auto px-4 flex justify-end gap-6 text-[#b8c5d6]">
          <a href="https://maps.google.com" className="flex items-center gap-2 hover:text-[#f0a500] transition-colors">
            <MapPin size={14} />
            <span>ul. Kolejowa 5a, 59-307 Raszówka</span>
          </a>
          <a href="tel:+48123456789" className="flex items-center gap-2 hover:text-[#f0a500] transition-colors">
            <Phone size={14} />
            <span>+48 123 456 789</span>
          </a>
          <a href="mailto:biuro@grempool.pl" className="flex items-center gap-2 hover:text-[#f0a500] transition-colors">
            <Mail size={14} />
            <span>biuro@grempool.pl</span>
          </a>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-[#0f1419] sticky top-0 z-50 border-b border-[#2a3a4a]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="text-2xl font-montserrat font-bold">
                <span className="text-[#f0a500]">GREM</span>
                <span className="text-white">POOL</span>
              </div>
              <div className="text-[10px] text-[#b8c5d6] tracking-wider">
                ZŁOM • TRANSPORT • USŁUGI
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link text-sm font-medium text-[#b8c5d6] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/wycena"
                className="btn-primary px-6 py-2 rounded-lg text-sm font-semibold text-[#0f1419]"
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
          <div className="lg:hidden bg-[#1a2332] border-t border-[#2a3a4a]">
            <div className="container mx-auto px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 text-[#b8c5d6] hover:text-white border-b border-[#2a3a4a]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/wycena"
                className="block mt-4 btn-primary px-6 py-3 rounded-lg text-center font-semibold text-[#0f1419]"
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
