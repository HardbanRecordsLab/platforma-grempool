"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Globe, Camera } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a2332] border-t border-[#2a3a4a]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Info */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="text-2xl font-montserrat font-bold">
                <span className="text-[#f0a500]">GREM</span>
                <span className="text-white">POOL</span>
              </div>
            </Link>
            <p className="text-[#b8c5d6] text-sm mb-4">
              Złom • Transport • Usługi
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#b8c5d6] hover:text-[#f0a500] transition-colors">
                <Globe size={20} />
              </a>
              <a href="#" className="text-[#b8c5d6] hover:text-[#f0a500] transition-colors">
                <Camera size={20} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-montserrat font-semibold mb-4">USŁUGI</h4>
            <ul className="space-y-2 text-[#b8c5d6] text-sm">
              <li><Link href="/uslugi/skup-zlomu" className="hover:text-[#f0a500] transition-colors">Skup Złomu</Link></li>
              <li><Link href="/uslugi/transport" className="hover:text-[#f0a500] transition-colors">Transport</Link></li>
              <li><Link href="/uslugi/koparki" className="hover:text-[#f0a500] transition-colors">Usługi Koparką</Link></li>
              <li><Link href="/uslugi/rozbiorki" className="hover:text-[#f0a500] transition-colors">Rozbiórki</Link></li>
              <li><Link href="/uslugi/materialy" className="hover:text-[#f0a500] transition-colors">Materiały Budowlane</Link></li>
              <li><Link href="/uslugi/klimatyzacja" className="hover:text-[#f0a500] transition-colors">Klimatyzacja Aut</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-montserrat font-semibold mb-4">NAWIGACJA</h4>
            <ul className="space-y-2 text-[#b8c5d6] text-sm">
              <li><Link href="/" className="hover:text-[#f0a500] transition-colors">Strona Główna</Link></li>
              <li><Link href="/#o-nas" className="hover:text-[#f0a500] transition-colors">O Nas</Link></li>
              <li><Link href="/wycena" className="hover:text-[#f0a500] transition-colors">Szybka Wycena</Link></li>
              <li><Link href="/realizacje" className="hover:text-[#f0a500] transition-colors">Realizacje</Link></li>
              <li><Link href="/kontakt" className="hover:text-[#f0a500] transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-montserrat font-semibold mb-4">KONTAKT</h4>
            <ul className="space-y-3 text-[#b8c5d6] text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-[#f0a500] size-5 shrink-0" />
                <span>ul. Kolejowa 5a<br />59-307 Raszówka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[#f0a500] size-5 shrink-0" />
                <a href="tel:+48123456789" className="hover:text-[#f0a500] transition-colors">
                  +48 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[#f0a500] size-5 shrink-0" />
                <a href="mailto:biuro@grempool.pl" className="hover:text-[#f0a500] transition-colors">
                  biuro@grempool.pl
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2a3a4a] mt-8 pt-8 text-center text-[#b8c5d6] text-sm">
          <p>&copy; {new Date().getFullYear()} GREMPOOL. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}
