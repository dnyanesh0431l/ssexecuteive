import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Brands", href: "/brands" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
  { label: "Capabilities", href: "/#capabilities" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E5E5E5] bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-[#B80A0B] text-[11px] font-bold text-white">
                SS
              </span>
              <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-black">
                SS Executive
              </span>
            </div>
            <p className="mt-4 max-w-md text-[13px] leading-6 text-black/55">
              Premium apparel manufacturing for modern labels. Cut, sew and
              finish — engineered with precision, delivered on schedule.
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
              Navigate
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-y-2.5">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-black/65 transition-colors hover:text-[#B80A0B]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
              Reach us
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href="mailto:hello../../..ssexecutive.com"
                  className="inline-flex items-center gap-2 text-[13px] text-black/70 transition-colors hover:text-[#B80A0B]"
                >
                  <Mail className="h-3.5 w-3.5 text-black/40" />
                  hello../../..ssexecutive.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+910000000000"
                  className="inline-flex items-center gap-2 text-[13px] text-black/70 transition-colors hover:text-[#B80A0B]"
                >
                  <Phone className="h-3.5 w-3.5 text-black/40" />
                  +91 00000 00000
                </a>
              </li>
              <li className="pt-1">
                <Link
                  href="/#contact"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-black px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#B80A0B]"
                >
                  Start a project
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[#E5E5E5] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-black/45">
            © {year} SS Executive. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-[12px] text-black/45">
            <Link href="/#contact" className="hover:text-black">
              Privacy
            </Link>
            <Link href="/#contact" className="hover:text-black">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}