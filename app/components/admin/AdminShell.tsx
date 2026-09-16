// components/admin/AdminShell.tsx
"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "../../lib/hooks/useAdminAuth";
import { AdminLogin } from "./AdminLogin";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    setMobileOpen(false);
  }, [logout]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[#B80A0B]" />
          <p className="text-[13px] text-black/45">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
        userEmail={user.email}
      />
      <div className="lg:pl-[260px]">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}