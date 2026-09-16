"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Factory,
  Layers,
  Mail,
  Palette,
  Ruler,
  Scissors,
  Shirt,
  Sparkles,
  Truck,
} from "lucide-react";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { useBrands, useGallery } from "../lib/hooks/useCollectionData";
import { isValidEmail, truncate } from "../lib/utils";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase/config";

const CAPABILITIES = [
  { icon: Scissors, title: "Cut & Sew", description: "In-house cutting and stitching with tight tolerance control." },
  { icon: Ruler, title: "Sampling & Fit", description: "Rapid prototyping and graded size sets before bulk runs." },
  { icon: Layers, title: "Private Label", description: "Woven labels, tags and packaging built to your spec." },
  { icon: Factory, title: "Bulk Production", description: "Scalable runs from 200 to 20,000 pieces per style." },
  { icon: Award, title: "Quality Control", description: "Multi-stage QC with pre-shipment inspection reports." },
  { icon: Truck, title: "Global Logistics", description: "Consolidated shipping, documentation and dispatch." },
];

/* ----------------------------- motion helpers ---------------------------- */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(18px)",
        transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* -------------------------------- the page ------------------------------- */

export default function HomePage() {
  const brands = useBrands();
  const gallery = useGallery();

  const featured = brands.data.slice(0, 8);
  const galleryStrip = gallery.data.slice(0, 8);

  const totalColors = useMemo(
    () => brands.data.reduce((sum, b) => sum + (b.colorCount || 0), 0),
    [brands.data]
  );

  const brandCount = useCountUp(brands.data.length);
  const colorCount = useCountUp(totalColors);

  return (
    <div className="bg-white">
      {/* keyframes */}
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes softPulse { 0%,100% { opacity: .6; } 50% { opacity: 1; } }
        @keyframes floatUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: none; } }
      `}</style>

      <Header />

      {/* ============================== HERO ============================== */}
      <section className="relative overflow-hidden border-b border-[#E5E5E5]">
        <div className="mx-auto grid max-w-[1400px] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-14">
          {/* left */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-black/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B80A0B]" style={{ animation: "softPulse 2s ease-in-out infinite" }} />
              Executive Apparel Manufacturing
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-tight text-black sm:text-5xl lg:text-[54px]">
              Precision garments,
              <br />
              built for serious labels.
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-7 text-black/60">
              Full-service apparel manufacturing. From pattern and sampling to
              bulk cut-and-sew — production-grade quality at scale.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                href="/brands"
                className="inline-flex h-11 items-center gap-1.5 rounded-md bg-[#B80A0B] px-5 text-[13px] font-medium text-white transition-all hover:bg-[#9C0909] hover:-translate-y-px"
              >
                Explore brands <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#contact"
                className="inline-flex h-11 items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-5 text-[13px] font-medium text-black transition-colors hover:bg-[#F6F6F6]"
              >
                Request a quote
              </Link>
            </div>

            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-[#E5E5E5] pt-6">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
                  Brands
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-black">
                  {brands.loading ? <Skeleton className="h-8 w-10" /> : brandCount}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
                  Colours
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-black">
                  {brands.loading ? <Skeleton className="h-8 w-10" /> : colorCount}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
                  MOQ
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-black">
                  200
                </dd>
              </div>
            </dl>
          </div>

          {/* right — collage of first brand images */}
          <div className="lg:col-span-6">
            <HeroCollage brands={featured} loading={brands.loading} />
          </div>
        </div>
      </section>

      {/* ============================ BRANDS ============================== */}
      <section className="border-b border-[#E5E5E5]">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                  Catalogue
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                  Brands & products
                </h2>
              </div>
              <Link
                href="/brands"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-6">
            {brands.loading ? (
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] w-full rounded-lg" />
                ))}
              </div>
            ) : featured.length === 0 ? (
              <div className="rounded-lg border border-[#E5E5E5] bg-white">
                <EmptyState
                  icon={<Shirt className="h-5 w-5" />}
                  title="Brands will appear here"
                  description="Once the catalogue is populated, featured styles show up in this section."
                />
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {featured.map((brand, i) => (
                  <Reveal key={brand.id} delay={i * 50}>
                    <Link
                      href={`/brands/${brand.slug}`}
                      className="group block overflow-hidden rounded-lg border border-[#E5E5E5] bg-white transition-all duration-300 hover:border-black hover:-translate-y-0.5"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-[#F6F6F6]">
                        {brand.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={brand.image}
                            alt={brand.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                          />
                        ) : null}
                        <span className="absolute left-3 top-3 rounded-full border border-[#E5E5E5] bg-white/95 px-2 py-0.5 text-[11px] font-medium text-black backdrop-blur">
                          {brand.colorCount} colour{brand.colorCount === 1 ? "" : "s"}
                        </span>
                        <span className="absolute right-3 bottom-3 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="px-3.5 py-3">
                        <h3 className="text-[14px] font-semibold tracking-tight text-black">
                          {brand.name}
                        </h3>
                        <p className="mt-1 text-[12px] leading-5 text-black/55">
                          {truncate(brand.description, 70)}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================= CAPABILITIES =========================== */}
      <section
        id="capabilities"
        className="scroll-mt-20 border-b border-[#E5E5E5] bg-[#F6F6F6]"
      >
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                  Capabilities
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                  Full-stack production
                </h2>
              </div>
            </div>
          </Reveal>

          <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#E5E5E5] sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <Reveal key={cap.title} delay={i * 40}>
                  <div className="group h-full bg-white p-5 transition-colors hover:bg-[#FAFAFA]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F6F6F6] text-[#B80A0B] transition-colors group-hover:border-[#B80A0B]/25 group-hover:bg-[#B80A0B]/5">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="mt-4 text-[14px] font-semibold tracking-tight text-black">
                      {cap.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-6 text-black/55">
                      {cap.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ GALLERY ============================= */}
      <section
        id="gallery"
        className="scroll-mt-20 border-b border-[#E5E5E5]"
      >
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                  Studio
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                  Inside the workshop
                </h2>
              </div>
              <span className="text-[12px] text-black/45 hidden sm:block">
                Scroll horizontally →
              </span>
            </div>
          </Reveal>

          <div className="mt-6">
            {gallery.loading ? (
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-56 w-72 shrink-0 rounded-lg"
                  />
                ))}
              </div>
            ) : galleryStrip.length === 0 ? (
              <div className="rounded-lg border border-[#E5E5E5] bg-white">
                <EmptyState
                  icon={<Sparkles className="h-5 w-5" />}
                  title="Gallery coming soon"
                  description="Studio imagery will appear here once it's uploaded."
                />
              </div>
            ) : (
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
                {galleryStrip.map((item) => (
                  <figure
                    key={item.id}
                    className="group relative h-56 w-72 shrink-0 snap-start overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F6F6F6]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="text-[13px] font-medium text-white">
                        {item.title}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================ CONTACT ============================= */}
      <section id="contact" className="scroll-mt-20 bg-black">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-16">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
              Get in touch
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Let's build your next production run.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-white/60">
              Share your style, quantities and timeline. We'll respond with
              sampling lead time, pricing and a production slot.
            </p>

            <ul className="mt-8 space-y-4 border-t border-white/10 pt-6">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                    Email
                  </p>
                  <a
                    href="mailto:hello@ssexecutive.com"
                    className="mt-0.5 block text-[13px] font-medium text-white hover:text-[#B80A0B]"
                  >
                    hello@ssexecutive.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Palette className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                    Response time
                  </p>
                  <p className="mt-0.5 text-[13px] text-white/75">
                    24–48 hours on business days
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ---------------------------- hero collage ------------------------------- */

function HeroCollage({
  brands,
  loading,
}: {
  brands: { id: string; image: string; name: string }[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="aspect-[4/5] w-full rounded-lg" />
        <Skeleton className="aspect-[4/5] w-full rounded-lg" />
      </div>
    );
  }

  const a = brands[0];
  const b = brands[1];

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-3">
        <Reveal delay={80}>
          <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F6F6F6]">
            {a?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.image}
                alt={a.name}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/5] w-full" />
            )}
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F6F6F6]">
            {b?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.image}
                alt={b.name}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/5] w-full" />
            )}
          </div>
        </Reveal>
      </div>

      <div className="absolute -bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-black/60 sm:flex sm:items-center sm:gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1845D6]" />
        Production-grade since day one
      </div>
    </div>
  );
}

/* ----------------------------- contact form ------------------------------ */

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!isValidEmail(form.email)) next.email = "Invalid email";
    if (!form.message.trim()) next.message = "Required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    try {
      await addDoc(collection(db, "contactRequests"), {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        status: "new",
        createdAt: serverTimestamp(),
      });
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start gap-3 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#B80A0B]">
          <Sparkles className="h-4 w-4" />
        </span>
        <p className="text-[14px] font-medium text-white">
          Thanks — your enquiry has been received.
        </p>
        <p className="text-[13px] leading-6 text-white/55">
          We'll reply within 24–48 business hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-[12px] font-medium text-[#1845D6] hover:opacity-75"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field
          label="Name"
          required
          value={form.name}
          error={errors.name}
          onChange={(v) => setForm((p) => ({ ...p, name: v }))}
        />
        <Field
          label="Email"
          required
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(v) => setForm((p) => ({ ...p, email: v }))}
        />
      </div>
      <Field
        label="Phone (optional)"
        value={form.phone}
        onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
      />
      <Field
        label="Message"
        required
        textarea
        value={form.message}
        error={errors.message}
        onChange={(v) => setForm((p) => ({ ...p, message: v }))}
      />

      {status === "error" ? (
        <p className="rounded-md border border-[#B80A0B]/40 bg-[#B80A0B]/10 px-3 py-2 text-[12px] text-white">
          Could not send. Please try again.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#B80A0B] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#9C0909] disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
}) {
  const base =
    "w-full rounded-md border bg-white/[0.04] px-3 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-colors";
  const border = error
    ? "border-[#B80A0B] focus:border-[#B80A0B] focus:ring-[#B80A0B]/30"
    : "border-white/10 focus:border-white/30 focus:ring-white/10";

  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
        {label}
        {required ? <span className="text-[#B80A0B]"> *</span> : null}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} ${border} min-h-[88px] resize-y py-2.5 leading-6`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} ${border} h-10`}
        />
      )}
      {error ? <p className="mt-1 text-[11px] text-[#B80A0B]">{error}</p> : null}
    </div>
  );
}