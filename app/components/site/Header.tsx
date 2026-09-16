"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Brands", href: "/brands" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

const TICKER = [
  "Cut & Sew",
  "Private Label",
  "Sampling",
  "Bulk Production",
  "Quality Control",
  "Global Logistics",
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Red announcement strip */}
      <div className="relative overflow-hidden bg-[#B80A0B] text-white">
        <div className="flex animate-[marquee_38s_linear_infinite] whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-8 pr-8">
              {TICKER.concat(TICKER).map((item, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.22em] text-white/90"
                >
                  {item}
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition-[border-color,box-shadow] duration-500",
          scrolled
            ? "border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            : "border-transparent",
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8",
            "transition-[height] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
            scrolled ? "h-14" : "h-20 sm:h-24",
          )}
        >
          {/* LEFT — desktop nav / mobile menu button */}
          <nav className="hidden items-center gap-7 md:flex">
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
                    "group relative text-[13px] font-medium tracking-wide transition-colors",
                    active ? "text-black" : "text-black/55 hover:text-black",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-[2px] rounded-full bg-[#B80A0B] transition-all duration-300",
                      active ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="-ml-1 rounded-md p-2 text-black transition-colors hover:bg-[#F6F6F6] md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* CENTER — logo (grows big → shrinks small on scroll) */}
          <Link
            href="/"
            aria-label="SS Executive — Home"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Image
              src="/SSlogo.png"
              alt="SS Executive"
              width={320}
              height={120}
              priority
              sizes="(max-width: 640px) 160px, 240px"
              className={cn(
                "w-auto max-w-[56vw] object-contain",
                "transition-[height,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] will-change-transform",
                scrolled
                  ? "h-8 -translate-y-px sm:h-10"
                  : "h-11 translate-y-0 sm:h-16",
              )}
            />
          </Link>

          {/* RIGHT — CTA */}
          <Link
            href="/#contact"
            className="hidden h-9 items-center gap-1.5 rounded-md bg-black px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#B80A0B] md:inline-flex"
          >
            Start a project
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>

          {/* Balance spacer for mobile so the menu button aligns right */}
          <span className="h-9 w-9 md:hidden" aria-hidden />
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            "overflow-hidden border-[#E5E5E5] bg-white transition-[max-height,opacity,border-color] duration-300 md:hidden",
            open
              ? "max-h-96 border-t opacity-100"
              : "max-h-0 border-transparent opacity-0",
          )}
        >
          <nav className="mx-auto max-w-[1400px] space-y-0.5 px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-md px-3 py-2.5 text-[14px] font-medium text-black transition-colors hover:bg-[#F6F6F6]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#contact"
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-black text-[13px] font-medium text-white"
            >
              Start a project
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
