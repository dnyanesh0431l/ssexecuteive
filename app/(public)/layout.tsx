// app/(public)/layout.tsx
import { Search } from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */
const WHATSAPP_NUMBER = "918087776060";
const WHATSAPP_MESSAGE =
  "Hi SS Executive, I would like to know more about your products.";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE,
  )}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#F1F3F6]">
      {/* ---------- Top blue bar ---------- */}
      <header className="sticky top-0 z-40 bg-[#1845D6] shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center bg-white">
            <img src="/SSlogo.png" alt="SS Executive" className="h-12 w-12" />
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

      {/* ---------- WhatsApp floating action button ---------- */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-105 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      >
        {/* Real WhatsApp icon */}
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 fill-white sm:h-8 sm:w-8"
          aria-hidden
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
