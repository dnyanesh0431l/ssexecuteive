"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  MessageCircle,
  Ruler,
  Shirt,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "../../../components/site/Footer";
import { Header } from "../../../components/site/Header";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  subscribeToBrands,
  subscribeToColors,
} from "../../../lib/firebase/brands";
import type { Brand, BrandColor } from "../../../lib/types";
import { cn, formatDate } from "../../../lib/utils";

/** Business WhatsApp — India */
const WHATSAPP_NUMBER = "918087776060";

function buildWhatsAppLink(brandName: string, colorName?: string) {
  const parts = [`Hi SS Executive, I'm interested in the "${brandName}" brand`];
  if (colorName) parts.push(`in ${colorName}`);
  parts.push("— please share pricing, MOQ and sampling lead time.");
  const message = parts.join(" ");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function BrandDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [colors, setColors] = useState<BrandColor[]>([]);
  const [colorsLoading, setColorsLoading] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    const unsub = subscribeToBrands(
      (brands) => {
        const match = brands.find((b) => b.slug === slug) ?? null;
        setBrand(match);
        setNotFound(!match);
        setLoading(false);
      },
      () => {
        setNotFound(true);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [slug]);

  useEffect(() => {
    if (!brand?.id) {
      setColors([]);
      return;
    }
    setColorsLoading(true);
    const unsub = subscribeToColors(
      brand.id,
      (data) => {
        setColors(data);
        setActiveColor((prev) => prev ?? data[0]?.id ?? null);
        setColorsLoading(false);
      },
      () => setColorsLoading(false),
    );
    return () => unsub();
  }, [brand?.id]);

  const totalSizes = useMemo(() => {
    const set = new Set<string>();
    colors.forEach((c) => c.availableSizes.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [colors]);

  const active = colors.find((c) => c.id === activeColor) ?? null;
  const activeImage = active?.image || brand?.image || "";

  const waLink = brand
    ? buildWhatsAppLink(brand.name, active?.name)
    : `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <div className="bg-white">
      <style>{`
        @keyframes fadeImg { from { opacity:.4; } to { opacity:1; } }
        @keyframes softPulse { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        @keyframes ringPop {
          0% { transform: scale(.9); opacity:.7; }
          100% { transform: scale(1.5); opacity:0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>

      <Header />

      {loading ? (
        <BrandSkeleton />
      ) : notFound || !brand ? (
        <section className="border-b border-[#E5E5E5]">
          <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-[#E5E5E5] bg-white">
              <EmptyState
                icon={<Shirt className="h-5 w-5" />}
                title="Brand not found"
                description="This brand may have been removed or the URL is incorrect."
                action={
                  <Link
                    href="/brands"
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-[#F6F6F6]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to brands
                  </Link>
                }
              />
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Breadcrumb */}
          <div className="border-b border-[#E5E5E5]">
            <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-2.5 text-[12px] text-black/45 sm:px-6 lg:px-8">
              <Link href="/" className="hover:text-black">
                Home
              </Link>
              <span>/</span>
              <Link href="/brands" className="hover:text-black">
                Brands
              </Link>
              <span>/</span>
              <span className="truncate text-black">{brand.name}</span>
            </div>
          </div>

          {/* MAIN SPLIT */}
          <section className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              {/* LEFT — image + swatches + CTA */}
              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F6F6F6]">
                  {activeImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={activeImage}
                      src={activeImage}
                      alt={brand.name}
                      className="h-[300px] w-full object-cover sm:h-[360px] lg:h-[420px]"
                      style={{ animation: "fadeImg .35s ease-out both" }}
                    />
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-black/25 sm:h-[360px] lg:h-[420px]">
                      <Shirt className="h-8 w-8" />
                    </div>
                  )}

                  {active ? (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white/95 px-3 py-1 text-[11px] font-medium text-black backdrop-blur">
                      <span
                        className="h-3 w-3 rounded-full border border-black/10"
                        style={{ backgroundColor: active.code }}
                      />
                      {active.name}
                    </div>
                  ) : null}
                </div>

                {/* Swatch strip — SELECT HERE ONLY */}
                {colors.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {colors.map((c) => {
                      const isActive = c.id === activeColor;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setActiveColor(c.id)}
                          onMouseEnter={() => setActiveColor(c.id)}
                          aria-label={c.name}
                          title={`${c.name} — ${c.code}`}
                          className={cn(
                            "relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border transition-all",
                            isActive
                              ? "scale-105 border-black ring-1 ring-black/10"
                              : "border-[#E5E5E5] hover:border-black/40",
                          )}
                          style={{ backgroundColor: c.code }}
                        >
                          {isActive ? (
                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/90 text-black">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {/* WhatsApp CTA + back */}
                <div className="mt-3 flex gap-2">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#B80A0B] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#9C0909]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enquire on WhatsApp
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                  <Link
                    href="/brands"
                    aria-label="Back to brands"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#E5E5E5] bg-white text-black transition-colors hover:bg-[#F6F6F6]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* RIGHT — info */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-[#B80A0B]"
                    style={{ animation: "softPulse 2s ease-in-out infinite" }}
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                    Brand
                  </p>
                  <span className="ml-auto hidden font-mono text-[11px] text-black/35 sm:block">
                    /{brand.slug}
                  </span>
                </div>

                <h1 className="mt-2 text-3xl font-semibold leading-[1.05] tracking-tight text-black sm:text-4xl lg:text-[46px]">
                  {brand.name}
                </h1>

                <p className="mt-3 max-w-2xl text-[14px] leading-6 text-black/60">
                  {brand.description}
                </p>

                {/* Stat strip */}
                <dl className="mt-5 grid grid-cols-3 divide-x divide-[#E5E5E5] overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F6F6F6]">
                  <div className="px-4 py-3">
                    <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-black/40">
                      Colours
                    </dt>
                    <dd className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-black">
                      {brand.colorCount}
                    </dd>
                  </div>
                  <div className="px-4 py-3">
                    <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-black/40">
                      Sizes
                    </dt>
                    <dd className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-black">
                      {totalSizes.length || "—"}
                    </dd>
                  </div>
                  <div className="px-4 py-3">
                    <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-black/40">
                      Added
                    </dt>
                    <dd className="mt-0.5 text-[13px] font-medium text-black">
                      {formatDate(brand.createdAt)}
                    </dd>
                  </div>
                </dl>

                {/* Colourways — PILLS (select) + ACTIVE DETAIL */}
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[13px] font-semibold tracking-tight text-black">
                      Colourways
                    </h2>
                    <span className="text-[11px] text-black/45">
                      {colors.length} available
                    </span>
                  </div>

                  {colorsLoading ? (
                    <div className="mt-3 flex gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-24 rounded-full" />
                      ))}
                    </div>
                  ) : colors.length === 0 ? (
                    <p className="mt-3 text-[12px] text-black/45">
                      Colourways coming soon.
                    </p>
                  ) : (
                    <>
                      {/* Pills — the ONLY selector besides the swatch strip */}
                      <div className="mt-3 -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                        {colors.map((c) => {
                          const isActive = c.id === activeColor;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setActiveColor(c.id)}
                              onMouseEnter={() => setActiveColor(c.id)}
                              className={cn(
                                "inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-2.5 pr-3 text-[12px] font-medium transition-colors",
                                isActive
                                  ? "border-black bg-black text-white"
                                  : "border-[#E5E5E5] bg-white text-black/70 hover:bg-[#F6F6F6] hover:text-black",
                              )}
                            >
                              <span
                                className="h-4 w-4 rounded-full border border-black/10"
                                style={{ backgroundColor: c.code }}
                              />
                              {c.name}
                            </button>
                          );
                        })}
                      </div>

                      {/* Active colour detail — STACKED on mobile, inline on desktop */}
                      {active ? (
                        <div className="mt-3 overflow-hidden rounded-lg border border-[#E5E5E5] bg-white">
                          {/* Header row — colour swatch + name + hex */}
                          <div className="flex items-center gap-2 border-b border-[#E5E5E5] bg-[#F6F6F6] px-3.5 py-2.5">
                            <span
                              className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                              style={{ backgroundColor: active.code }}
                            />
                            <span className="text-[13px] font-semibold text-black">
                              {active.name}
                            </span>
                            <span className="ml-auto font-mono text-[11px] text-black/40">
                              {active.code}
                            </span>
                          </div>

                          {/* Body — sizes */}
                          <div className="px-3.5 py-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-black/40">
                              <Ruler className="h-3 w-3" />
                              Available sizes
                            </div>

                            {active.availableSizes.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {active.availableSizes.map((s) => (
                                  <span
                                    key={s}
                                    className="inline-flex h-7 min-w-[34px] items-center justify-center rounded border border-[#E5E5E5] bg-white px-2 text-[12px] font-medium text-black"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-[12px] text-black/45">
                                Sizes on request
                              </p>
                            )}
                          </div>

                          {/* Footer — enquire button, full width on mobile */}
                          <div className="border-t border-[#E5E5E5] bg-[#FAFAFA] px-3.5 py-2.5">
                            <a
                              href={buildWhatsAppLink(brand.name, active.name)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#1845D6] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#1438B3] sm:w-auto"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Enquire about {active.name}
                              <ArrowUpRight className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ================= COLOUR GALLERY GRID — DISPLAY ONLY ================= */}
          {colors.length > 0 ? (
            <section className="border-t border-[#E5E5E5] bg-[#F6F6F6]">
              <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                      Gallery
                    </p>
                    <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                      {brand.name} in every colour
                    </h2>
                  </div>
                  <span className="text-[12px] text-black/45">
                    {colors.length} variant{colors.length === 1 ? "" : "s"}
                  </span>
                </div>

                {/* Grid: 2 cols mobile, 3 tablet, 4 desktop, 6 on xl */}
                <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {colors.map((c, i) => (
                    <li
                      key={c.id}
                      style={{
                        animation: `fadeUp .5s cubic-bezier(.16,1,.3,1) ${Math.min(i, 10) * 40}ms both`,
                      }}
                    >
                      <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white">
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#F6F6F6]">
                          {c.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.image}
                              alt={`${brand.name} — ${c.name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center"
                              style={{ backgroundColor: c.code }}
                            >
                              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/80">
                                {c.name}
                              </span>
                            </div>
                          )}

                          {/* Colour dot bottom-right */}
                          <span
                            className="absolute bottom-2 right-2 h-4 w-4 rounded-full border border-white/60 shadow-sm"
                            style={{ backgroundColor: c.code }}
                          />
                        </div>

                        <div className="px-2.5 py-2">
                          <p className="truncate text-[12px] font-semibold text-black">
                            {c.name}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[10px] text-black/40">
                            {c.code}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          {/* Slim CTA strip */}
          <section className="border-t border-[#E5E5E5] bg-black">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
              <p className="text-[14px] font-medium text-white">
                Interested in {brand.name}?{" "}
                <span className="font-normal text-white/55">
                  Share quantities — we'll confirm sampling and pricing.
                </span>
              </p>
              <a
                href={waLink}
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
        </>
      )}

      <Footer />
    </div>
  );
}

function BrandSkeleton() {
  return (
    <>
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-8">
        <div className="lg:col-span-5">
          <Skeleton className="h-[300px] w-full rounded-lg sm:h-[360px] lg:h-[420px]" />
          <div className="mt-2.5 flex gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-md" />
            ))}
          </div>
          <Skeleton className="mt-3 h-11 w-full rounded-md" />
        </div>
        <div className="space-y-4 lg:col-span-7">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-full" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>

      <div className="border-t border-[#E5E5E5] bg-[#F6F6F6]">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-2 h-8 w-64" />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
