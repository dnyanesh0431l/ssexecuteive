import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const LINK_GROUPS = [
  {
    title: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "Brands", href: "/brands" },
      { label: "Gallery", href: "/#gallery" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Capabilities",
    links: [
      { label: "Cut & Sew", href: "/#capabilities" },
      { label: "Sampling", href: "/#capabilities" },
      { label: "Private Label", href: "/#capabilities" },
      { label: "Bulk Production", href: "/#capabilities" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E5E5E5] bg-[#F6F6F6]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#B80A0B] text-[13px] font-bold text-white">
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
            <p className="mt-6 max-w-sm text-[13px] leading-6 text-black/55">
              Premium apparel manufacturing for modern labels. Cut, sew, and
              finish — engineered with precision, delivered on schedule.
            </p>

            <ul className="mt-7 space-y-3 text-[13px]">
              <li>
                <a
                  href="mailto:hello@ssexecutive.com"
                  className="inline-flex items-center gap-2.5 text-black/70 transition-colors hover:text-[#B80A0B]"
                >
                  <Mail className="h-3.5 w-3.5 text-black/40" />
                  hello@ssexecutive.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+910000000000"
                  className="inline-flex items-center gap-2.5 text-black/70 transition-colors hover:text-[#B80A0B]"
                >
                  <Phone className="h-3.5 w-3.5 text-black/40" />
                  +91 00000 00000
                </a>
              </li>
              <li className="inline-flex items-start gap-2.5 text-black/70">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-black/40" />
                <span>Manufacturing unit — India</span>
              </li>
            </ul>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.title} className="lg:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                {group.title}
              </p>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-black/70 transition-colors hover:text-[#B80A0B]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
              Newsletter
            </p>
            <p className="mt-5 text-[13px] leading-6 text-black/55">
              Occasional updates on new brands, capabilities and openings.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-4 text-[13px] font-medium text-black transition-colors hover:border-black"
            >
              Get in touch
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[#E5E5E5] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-black/45">
            © {year} SS Executive. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[12px] text-black/45">
            <Link
              href="/#contact"
              className="transition-colors hover:text-black"
            >
              Privacy
            </Link>
            <Link
              href="/#contact"
              className="transition-colors hover:text-black"
            >
              Terms
            </Link>
            <Link
              href="/#contact"
              className="transition-colors hover:text-black"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
