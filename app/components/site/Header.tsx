"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Brands", href: "/brands" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white/90 backdrop-blur",
        scrolled ? "border-[#E5E5E5]" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-20">
        <Link href="/" className="flex items-center gap-2.5" aria-label="SS Executive home">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#B80A0B] text-[13px] font-bold tracking-tight text-white">
            SS
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold uppercase tracking-[0.14em] text-black">
              SS Executive
            </span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-black/45">
              Apparel Manufacturing
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : !item.href.includes("#") && pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative text-[13px] font-medium tracking-wide transition-colors",
                  active ? "text-black" : "text-black/55 hover:text-black"
                )}
              >
                {item.label}
                {active ? (
                  <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-[#B80A0B]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/#contact"
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-black px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#B80A0B]"
          >
            Start a project
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="-mr-2 rounded-md p-2 text-black md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#E5E5E5] bg-white md:hidden">
          <nav className="mx-auto max-w-7xl px-5 py-4">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-3 text-[14px] font-medium text-black transition-colors hover:bg-[#F6F6F6]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/#contact"
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md bg-black text-[13px] font-medium text-white transition-colors hover:bg-[#B80A0B]"
            >
              Start a project
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}