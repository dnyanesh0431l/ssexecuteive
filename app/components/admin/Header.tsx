// components/admin/Header.tsx
"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const TITLES: Array<{ match: string; title: string }> = [
  { match: "/admin/brands/new", title: "New Brand" },
  { match: "/admin/brands", title: "Brands" },
  { match: "/admin/gallery", title: "Gallery" },
  { match: "/admin/contact-requests", title: "Contact Requests" },
  { match: "/admin", title: "Dashboard" },
];

function resolveTitle(pathname: string) {
  const found = TITLES.find(
    (item) => pathname === item.match || pathname.startsWith(`${item.match}/`)
  );
  return found?.title ?? "Dashboard";
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#E5E5E5] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="-ml-1 rounded-md p-2 text-black/60 transition-colors hover:bg-[#F6F6F6] hover:text-black lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h2 className="truncate text-[13px] font-medium text-black/60">
        {resolveTitle(pathname)}
      </h2>

      <div className="ml-auto flex items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden text-[13px] font-medium text-[#1845D6] transition-opacity hover:opacity-75 sm:block"
        >
          View site ↗
        </a>
      </div>
    </header>
  );
}