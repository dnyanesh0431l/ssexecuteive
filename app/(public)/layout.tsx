// app/(public)/layout.tsx
import { Search, User } from "lucide-react";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F1F3F6]">
      {/* ---------- Top blue bar ---------- */}
      <header className="sticky top-0 z-40 bg-[#1845D6] shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white font-black leading-none shadow-sm">
              <span className="text-[14px] text-[#B80A0B]">S</span>
              <span className="text-[14px] text-[#1845D6]">S</span>
            </span>
            <span className="hidden text-base font-extrabold uppercase tracking-wide text-white sm:block sm:text-lg">
              SS Executive
            </span>
          </Link>

          {/* Search */}
          <div className="relative mx-1 min-w-0 flex-1 sm:mx-4 sm:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1845D6]" />
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="h-9 w-full rounded-sm border-0 bg-white pl-9 pr-3 text-[13px] text-black placeholder:text-black/40 focus:outline-none sm:h-10"
            />
          </div>

        
        </div>

        {/* Secondary nav strip */}
        <div className="hidden border-t border-white/10 bg-[#1845D6] sm:block">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2 text-[13px] font-medium text-white/85">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <Link href="/brands" className="transition-colors hover:text-white">
              All Brands
            </Link>
            <Link href="/brands" className="transition-colors hover:text-white">
              T-Shirts
            </Link>
            <Link href="/brands" className="transition-colors hover:text-white">
              Polo Shirts
            </Link>
            <Link href="/brands" className="transition-colors hover:text-white">
              Aprons
            </Link>
            <Link href="/brands" className="transition-colors hover:text-white">
              Hoodies
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Page ---------- */}
      <main className="flex-1">{children}</main>

      {/* ---------- Footer ---------- */}
      <footer className="mt-8 bg-[#1845D6]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-5 py-6 text-center sm:px-6">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-white">
            SS Executive
          </p>
          <p className="text-[12px] text-white/70">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
