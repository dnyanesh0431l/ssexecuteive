"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Factory,
  Layers,
  MessageCircle,
  Ruler,
  Scissors,
  Shirt,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Footer } from "../components/site/Footer";
import { Header } from "../components/site/Header";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { useBrands, useGallery } from "../lib/hooks/useCollectionData";
import { truncate } from "../lib/utils";

const WHATSAPP_NUMBER = "918087776060";
const HERO_BG =
  "https://i.pinimg.com/1200x/d7/60/6e/d7606ec1b41b5ae00d23e7191d21d2ec.jpg";

const CAPABILITIES = [
  {
    icon: Scissors,
    title: "Cut & Sew",
    description: "In-house cutting and stitching with tight tolerance control.",
  },
  {
    icon: Ruler,
    title: "Sampling & Fit",
    description: "Rapid prototyping and graded size sets before bulk runs.",
  },
  {
    icon: Layers,
    title: "Private Label",
    description: "Woven labels, tags and packaging built to your spec.",
  },
  {
    icon: Factory,
    title: "Bulk Production",
    description: "Scalable runs from 200 to 20,000 pieces per style.",
  },
  {
    icon: Award,
    title: "Quality Control",
    description: "Multi-stage QC with pre-shipment inspection reports.",
  },
  {
    icon: Truck,
    title: "Global Logistics",
    description: "Consolidated shipping, documentation and dispatch.",
  },
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
      { threshold: 0.06 },
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
        transform: visible ? "none" : "translateY(14px)",
        transition: `opacity .6s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .6s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function useCountUp(target: number, duration = 1100) {
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

  const allBrands = brands.data;
  const galleryStrip = gallery.data.slice(0, 8);

  const totalColors = useMemo(
    () => brands.data.reduce((sum, b) => sum + (b.colorCount || 0), 0),
    [brands.data],
  );

  const brandCount = useCountUp(brands.data.length);
  const colorCount = useCountUp(totalColors);

  return (
    <div className="bg-white">
      <style>{`
        @keyframes softPulse { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        @keyframes scrollHint { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
      `}</style>

      <Header />

      {/* ============================== HERO ============================== */}
      <section className="relative flex min-h-[28vh] items-center overflow-hidden bg-black lg:min-h-[32vh]">
        {/* Fixed background — steady on scroll */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${HERO_BG})` }}
          aria-hidden
        />
        {/* Overlay for legibility */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/80 backdrop-blur">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#B80A0B]"
                style={{ animation: "softPulse 2s ease-in-out infinite" }}
              />
              Executive Apparel Manufacturing
            </div>

            <h1 className="mt-3 text-2xl font-semibold leading-[1.08] tracking-tight text-white sm:text-3xl lg:text-4xl">
              Precision garments,
              <br />
              built for serious labels.
            </h1>

            <p className="mt-2 max-w-xl text-[13px] leading-6 text-white/70">
              Full-service apparel manufacturing. Pattern, sampling and bulk
              cut-and-sew — production-grade quality at scale.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link
                href="/brands"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#B80A0B] px-4 text-[12px] font-medium text-white transition-all hover:bg-[#9C0909] hover:-translate-y-px"
              >
                Explore brands <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/25 bg-white/5 px-4 text-[12px] font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </div>

            {/* Inline stats */}
            <dl className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-white/15 pt-4">
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
                  Brands
                </dt>
                <dd className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-white">
                  {brands.loading ? (
                    <Skeleton className="h-6 w-10" />
                  ) : (
                    brandCount
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
                  Colours
                </dt>
                <dd className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-white">
                  {brands.loading ? (
                    <Skeleton className="h-6 w-10" />
                  ) : (
                    colorCount
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
                  MOQ
                </dt>
                <dd className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-white">
                  200
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* scroll hint */}
        <div
          className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 text-white/50 lg:block"
          style={{ animation: "scrollHint 2s ease-in-out infinite" }}
          aria-hidden
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* ======================= ALL BRANDS (on home) ==================== */}
      <section className="border-b border-[#E5E5E5]">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                  Catalogue
                </p>
                <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                  Brands & products
                </h2>
              </div>
              {!brands.loading && allBrands.length > 0 ? (
                <span className="text-[12px] text-black/45">
                  {allBrands.length} brand{allBrands.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          </Reveal>

          <div className="mt-5">
            {brands.loading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="aspect-[4/5] w-full rounded-lg"
                  />
                ))}
              </div>
            ) : allBrands.length === 0 ? (
              <div className="rounded-lg border border-[#E5E5E5] bg-white">
                <EmptyState
                  icon={<Shirt className="h-5 w-5" />}
                  title="Brands will appear here"
                  description="Once the catalogue is populated, all styles show up in this section."
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {allBrands.map((brand, i) => (
                  <Reveal key={brand.id} delay={Math.min(i, 8) * 40}>
                    <Link
                      href={`/brands/${brand.slug}`}
                      className="group block overflow-hidden rounded-lg border border-[#E5E5E5] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-black"
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
                        <span className="absolute left-2.5 top-2.5 rounded-full border border-[#E5E5E5] bg-white/95 px-2 py-0.5 text-[10px] font-medium text-black backdrop-blur">
                          {brand.colorCount} colour
                          {brand.colorCount === 1 ? "" : "s"}
                        </span>
                        <span className="absolute bottom-2.5 right-2.5 flex h-7 w-7 translate-y-1 items-center justify-center rounded-full bg-black text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="px-3 py-2.5">
                        <h3 className="text-[13px] font-semibold tracking-tight text-black">
                          {brand.name}
                        </h3>
                        <p className="mt-0.5 text-[12px] leading-5 text-black/55">
                          {truncate(brand.description, 60)}
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
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <Reveal>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                Capabilities
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                Full-stack production
              </h2>
            </div>
          </Reveal>

          <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#E5E5E5] sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <Reveal key={cap.title} delay={i * 30}>
                  <div className="group h-full bg-white p-4 transition-colors hover:bg-[#FAFAFA]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F6F6F6] text-[#B80A0B] transition-colors group-hover:border-[#B80A0B]/25 group-hover:bg-[#B80A0B]/5">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="mt-3 text-[13px] font-semibold tracking-tight text-black">
                      {cap.title}
                    </h3>
                    <p className="mt-0.5 text-[12px] leading-5 text-black/55">
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
      <section id="gallery" className="scroll-mt-20 border-b border-[#E5E5E5]">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                  Studio
                </p>
                <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                  Inside the workshop
                </h2>
              </div>
              <span className="hidden text-[12px] text-black/45 sm:block">
                Scroll horizontally →
              </span>
            </div>
          </Reveal>

          <div className="mt-5">
            {gallery.loading ? (
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-64 shrink-0 rounded-lg" />
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
                    className="group relative h-48 w-64 shrink-0 snap-start overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F6F6F6]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="text-[12px] font-medium text-white">
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

      {/* ============================ WHATSAPP STRIP ============================ */}
      <section className="bg-black">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <p className="text-[14px] font-semibold text-white">
              Ready to start a production run?
            </p>
            <p className="mt-0.5 text-[13px] text-white/55">
              Share your style, quantities and timeline — we'll reply with
              sampling and pricing.
            </p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              "Hi SS Executive, I'd like to discuss a production enquiry.",
            )}`}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-[#25D366] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#1fb457]"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </section>

      <Footer />

      {/* Floating WhatsApp bubble — mobile only */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_28px_-8px_rgba(37,211,102,0.6)] transition-transform hover:scale-105 lg:hidden"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
