// components/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Shirt,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/brands", label: "Brands", icon: Shirt, exact: false },
  { href: "/admin/gallery", label: "Gallery", icon: Images, exact: false },
  {
    href: "/admin/contact-requests",
    label: "Contact Requests",
    icon: Mail,
    exact: false,
  },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  mobileOpen,
  onClose,
  onLogout,
  userEmail,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userEmail?: string | null;
}) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center justify-between border-b border-[#E5E5E5] px-5">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#B80A0B] text-[12px] font-bold text-white">
            SS
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold tracking-tight text-black">
              SS Executive
            </span>
            <span className="block text-[11px] text-black/45">Admin Panel</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-md p-1.5 text-black/40 transition-colors hover:bg-[#F6F6F6] hover:text-black lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="admin-scroll flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.08em] text-black/35">
          Manage
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-[#F6F6F6] text-black"
                      : "text-black/60 hover:bg-[#F6F6F6] hover:text-black"
                  )}
                >
                  {active ? (
                    <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r bg-[#B80A0B]" />
                  ) : null}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-[#B80A0B]" : "text-black/35 group-hover:text-black/55"
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#E5E5E5] p-3">
        {userEmail ? (
          <p className="truncate px-2 pb-2 text-[11px] text-black/40" title={userEmail}>
            {userEmail}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-black/60 transition-colors hover:bg-[#F6F6F6] hover:text-black"
        >
          <LogOut className="h-4 w-4 shrink-0 text-black/35" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-[#E5E5E5] lg:block">
        {content}
      </aside>

      {/* Mobile */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 w-[272px] border-r border-[#E5E5E5]">
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}