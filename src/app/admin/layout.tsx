"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationBell from "@/components/admin/NotificationBell";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  Calendar,
  Truck,
  Wrench,
  Tags,
  Share2,
  LayoutGrid,
  Settings,
  LogOut,
  Menu,
  X,
  Mail,
  Gavel
} from "lucide-react";
import { useEffect, useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "CRM / Leady", href: "/admin/crm" },
  { icon: FileText, label: "Zlecenia", href: "/admin/zlecenia" },
  { icon: Package, label: "Materiały", href: "/admin/materialy" },
  { icon: LayoutGrid, label: "Nasze usługi", href: "/admin/uslugi" },
  { icon: Tags, label: "Cennik złomu", href: "/admin/cennik" },
  { icon: Share2, label: "Social media", href: "/admin/social" },
  { icon: Calendar, label: "Kalendarz", href: "/admin/kalendarz" },
  { icon: Truck, label: "Flota", href: "/admin/flota" },
  { icon: Wrench, label: "Maszyny", href: "/admin/maszyny" },
  { icon: Mail, label: "Wiadomości", href: "/admin/wiadomosci" },
  { icon: Gavel, label: "Przetargi", href: "/admin/przetargi" },
  { icon: Settings, label: "Ustawienia", href: "/admin/ustawienia" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin/" }).catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0a] flex">
      <link rel="manifest" href="/admin-manifest.json" />
      <link rel="apple-touch-icon" href="/icon-192.png" />
      <meta name="theme-color" content="#0b0b0a" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="GREMPOOL Panel" />
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#141210] border-r border-[#352c1d] transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-[#352c1d]">
          <Link href="/admin/dashboard" className="flex items-center">
            <img src="/assets/logo-grempool-wide.png" alt="GREMPOOL" className="h-9 w-auto" />
          </Link>
          <p className="text-xs text-[#c3b9a7] mt-1">Panel Administracyjny</p>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                pathname === item.href
                  ? "bg-[#d4a24a]/10 text-[#d4a24a]"
                  : "text-[#c3b9a7] hover:bg-[#352c1d]"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#352c1d]">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-[#c3b9a7] hover:text-white transition-colors">
            <LogOut size={20} />
            <span className="text-sm">Strona publiczna</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col min-h-screen">
        <div
          className="fixed inset-0 lg:left-64 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1722695694560-f452b0919d3a?auto=format&fit=crop&w=1600&q=60')" }}
        />
        <div className="fixed inset-0 lg:left-64 bg-[#0b0b0a]/93" />

        {/* Top Bar */}
        <header className="relative z-10 h-16 bg-[#141210] border-b border-[#352c1d] flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-sm text-[#c3b9a7] hidden sm:block">
              Zalogowany jako: <span className="text-white font-semibold">Właściciel</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#d4a24a] flex items-center justify-center text-[#0b0b0a] font-bold text-sm">
              W
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative z-10 flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
