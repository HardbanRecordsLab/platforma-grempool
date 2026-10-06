"use client";

import { useState } from "react";
import { Loader2, Lock, User } from "lucide-react";

export default function AdminLoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Nie udało się zalogować");
        return;
      }
      // Only follow links back into the panel.
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.replace(next?.startsWith("/admin") ? next : "/admin/dashboard");
    } catch {
      setError("Brak połączenia z serwerem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#0a0a0a] border border-[#5c4716] rounded-2xl p-8"
      >
        <img src="/assets/logo-grempool-wide.png" alt="GREMPOOL" className="h-10 w-auto mx-auto mb-2" />
        <p className="text-center text-xs text-[#e8dfcc] mb-8">Panel Administracyjny</p>

        <label htmlFor="login" className="block text-sm text-[#e8dfcc] mb-2">
          Login
        </label>
        <div className="relative mb-4">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c4716]" />
          <input
            id="login"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoFocus
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full bg-[#000000] border border-[#5c4716] focus:border-[#f5b52c] rounded-lg pl-9 pr-3 py-3 text-white outline-none"
          />
        </div>

        <label htmlFor="password" className="block text-sm text-[#e8dfcc] mb-2">
          Hasło
        </label>
        <div className="relative mb-4">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c4716]" />
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#000000] border border-[#5c4716] focus:border-[#f5b52c] rounded-lg pl-9 pr-3 py-3 text-white outline-none"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !login || !password}
          className="w-full btn-primary py-3 rounded-lg font-semibold text-[#000000] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 size={18} className="animate-spin" />} Zaloguj
        </button>
      </form>
    </div>
  );
}
