"use client";

import { useState } from "react";
import { 
  Save, 
  User, 
  Building, 
  Bell, 
  Shield, 
  Globe,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

export default function UstawieniaPage() {
  const [activeTab, setActiveTab] = useState("firma");

  const tabs = [
    { id: "firma", label: "Firma", icon: Building },
    { id: "powiadomienia", label: "Powiadomienia", icon: Bell },
    { id: "uzytkownicy", label: "Użytkownicy", icon: User },
    { id: "bezpieczenstwo", label: "Bezpieczeństwo", icon: Shield },
  ];

  return (
    <div>
      <h1 className="text-2xl font-montserrat font-bold mb-6">Ustawienia</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#f0a500]/10 text-[#f0a500]"
                    : "text-[#b8c5d6] hover:bg-[#2a3a4a]"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "firma" && (
            <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
              <h2 className="text-xl font-montserrat font-bold mb-6">Informacje o firmie</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">Nazwa firmy</label>
                    <input type="text" defaultValue="GREMPOOL" className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">NIP</label>
                    <input type="text" defaultValue="123-456-78-90" className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-2">Adres</label>
                  <input type="text" defaultValue="ul. Kolejowa 5a, 59-307 Raszówka" className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">Telefon</label>
                    <input type="tel" defaultValue="+48 123 456 789" className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">Email</label>
                    <input type="email" defaultValue="grempool@proton.me" className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-2">Opis firmy</label>
                  <textarea rows={4} defaultValue="GREMPOOL - Złom, Transport, Usługi. Solidnie. Terminowo. Na lata." className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white" />
                </div>

                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-2">Godziny otwarcia</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#b8c5d6]">Poniedziałek - Piątek</label>
                      <input type="text" defaultValue="7:00 - 17:00" className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-[#b8c5d6]">Sobota</label>
                      <input type="text" defaultValue="8:00 - 14:00" className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white text-sm" />
                    </div>
                  </div>
                </div>

                <button className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419] flex items-center gap-2">
                  <Save size={18} /> Zapisz zmiany
                </button>
              </div>
            </div>
          )}

          {activeTab === "powiadomienia" && (
            <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
              <h2 className="text-xl font-montserrat font-bold mb-6">Powiadomienia</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg">
                  <div>
                    <h3 className="font-semibold">Nowy lead</h3>
                    <p className="text-sm text-[#b8c5d6]">Powiadomienie o nowym zapytaniu</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#2a3a4a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f0a500]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg">
                  <div>
                    <h3 className="font-semibold">Zmiana statusu zlecenia</h3>
                    <p className="text-sm text-[#b8c5d6]">Powiadomienie przy zmianie statusu</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#2a3a4a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f0a500]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg">
                  <div>
                    <h3 className="font-semibold">Przegląd pojazdu</h3>
                    <p className="text-sm text-[#b8c5d6]">Przypomnienie o zbliżającym się przeglądzie</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#2a3a4a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f0a500]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg">
                  <div>
                    <h3 className="font-semibold">Nowa opinia</h3>
                    <p className="text-sm text-[#b8c5d6]">Powiadomienie o nowej opinii klienta</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#2a3a4a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f0a500]"></div>
                  </label>
                </div>

                <button className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419] flex items-center gap-2">
                  <Save size={18} /> Zapisz zmiany
                </button>
              </div>
            </div>
          )}

          {activeTab === "uzytkownicy" && (
            <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat font-bold">Użytkownicy</h2>
                <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419]">
                  + Dodaj użytkownika
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f0a500] flex items-center justify-center text-[#0f1419] font-bold">W</div>
                    <div>
                      <h3 className="font-semibold">Właściciel</h3>
                      <p className="text-sm text-[#b8c5d6]">wlasciciel@grempool.pl</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f0a500]/20 text-[#f0a500]">Właściciel</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">M</div>
                    <div>
                      <h3 className="font-semibold">Marek Nowak</h3>
                      <p className="text-sm text-[#b8c5d6]">marek@grempool.pl</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">Koordynator</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">P</div>
                    <div>
                      <h3 className="font-semibold">Piotr Kowalczyk</h3>
                      <p className="text-sm text-[#b8c5d6]">piotr@grempool.pl</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">Pracownik</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bezpieczenstwo" && (
            <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
              <h2 className="text-xl font-montserrat font-bold mb-6">Bezpieczeństwo</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-[#0f1419] rounded-lg">
                  <h3 className="font-semibold mb-2">Zmiana hasła</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="password" placeholder="Aktualne hasło" className="bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white" />
                    <input type="password" placeholder="Nowe hasło" className="bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg">
                  <div>
                    <h3 className="font-semibold">Weryfikacja dwuskładnikowa</h3>
                    <p className="text-sm text-[#b8c5d6]">Dodatkowe zabezpieczenie konta</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#2a3a4a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f0a500]"></div>
                  </label>
                </div>

                <div className="p-4 bg-[#0f1419] rounded-lg">
                  <h3 className="font-semibold mb-2">Aktywne sesje</h3>
                  <div className="text-sm text-[#b8c5d6]">
                    <p>Ostatnie logowanie: 13.09.2026, 10:30</p>
                    <p>IP: 192.168.1.100</p>
                  </div>
                </div>

                <button className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419] flex items-center gap-2">
                  <Save size={18} /> Zapisz zmiany
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
