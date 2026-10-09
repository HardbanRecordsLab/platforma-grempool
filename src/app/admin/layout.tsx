"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationBell from "@/components/admin/NotificationBell";
import InstallAppButton from "@/components/admin/InstallAppButton";
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
  Globe,
  Menu,
  X,
  Mail,
  Gavel,
  Receipt
} from "lucide-react";
import { useEffect, useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "CRM / Leady", href: "/admin/crm" },
  { icon: FileText, label: "Zlecenia", href: "/admin/zlecenia" },
  { icon: Package, label: "Ogłoszenia", href: "/admin/materialy" },
  { icon: LayoutGrid, label: "Nasze usługi", href: "/admin/uslugi" },
  { icon: Tags, label: "Cennik złomu", href: "/admin/cennik" },
  { icon: Receipt, label: "Skup — kwity", href: "/admin/skup" },
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
  const [user, setUser] = useState<{ login: string; label: string } | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin/" }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(() => setUser(null));
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.replace("/admin/login");
  };

  const pwaTags = (
    <>
      <link rel="manifest" href="/admin-manifest.json" />
      <link rel="apple-touch-icon" href="/icon-192.png" />
      <meta name="theme-color" content="#000000" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="GREMPOOL Panel" />
    </>
  );

  if (pathname === "/admin/login") {
    return (
      <>
        {pwaTags}
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] flex print:block print:bg-white">
      {pwaTags}
      {/* Sidebar */}
      <aside className={`print:hidden fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#0a0a0a] border-r border-[#5c4716] transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-[#5c4716]">
          <Link href="/admin/dashboard" className="flex items-center">
            <img src="/assets/logo-grempool-wide.png" alt="GREMPOOL" className="h-9 w-auto" />
          </Link>
          <p className="text-xs text-[#e8dfcc] mt-1">Panel Administracyjny</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-[#f5b52c]/10 text-[#f5b52c]"
                  : "text-[#e8dfcc] hover:bg-[#5c4716]"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#5c4716]">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-[#e8dfcc] hover:text-white transition-colors">
            <Globe size={20} />
            <span className="text-sm">Strona publiczna</span>
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[#e8dfcc] hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="text-sm">Wyloguj</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col min-h-screen">
        <div
          className="print:hidden fixed inset-0 lg:left-64 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1722695694560-f452b0919d3a?auto=format&fit=crop&w=1600&q=60')" }}
        />
        <div className="print:hidden fixed inset-0 lg:left-64 bg-[#000000]/93" />

        {/* Top Bar */}
        <header className="print:hidden relative z-10 h-16 bg-[#0a0a0a] border-b border-[#5c4716] flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4">
            <InstallAppButton />
            <NotificationBell />
            <div className="text-sm text-[#e8dfcc] hidden sm:block">
              Zalogowany jako: <span className="text-white font-semibold">{user ? `${user.login} (${user.label})` : "…"}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#f5b52c] flex items-center justify-center text-[#000000] font-bold text-sm uppercase">
              {user?.login.charAt(0) ?? ""}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative z-10 flex-1 p-6 overflow-auto print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
