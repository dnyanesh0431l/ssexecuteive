"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Palette,
  Ruler,
  Shirt,
} from "lucide-react";
import { Header } from "../../../components/site/Header";
import { Footer } from "../../../components/site/Footer";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ErrorState } from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import { subscribeToBrands, subscribeToColors } from "../../../lib/firebase/brands";
import type { Brand, BrandColor } from "../../../lib/types";
import { formatDate } from "../../../lib/utils";

export default function BrandDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [colors, setColors] = useState<BrandColor[]>([]);
  const [colorsLoading, setColorsLoading] = useState(false);

  // Resolve the brand by slug (small catalog — safe to filter client-side).
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    const unsubscribe = subscribeToBrands(
      (brands) => {
        const match = brands.find((b) => b.slug === slug) ?? null;
        setBrand(match);
        setNotFound(!match);
        setLoading(false);
      },
      () => {
        setNotFound(true);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [slug]);

  // Load colours once we know the brand id.
  useEffect(() => {
    if (!brand?.id) {
      setColors([]);
      return;
    }
    setColorsLoading(true);
    const unsubscribe = subscribeToColors(
      brand.id,
      (data) => {
        setColors(data);
        setColorsLoading(false);
      },
      () => setColorsLoading(false)
    );
    return () => unsubscribe();
  }, [brand?.id]);

  const totalSizes = useMemo(() => {
    const set = new Set<string>();
    colors.forEach((c) => c.availableSizes.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [colors]);

  return (
    <div className="bg-white">
      <Header />

      {loading ? (
        <BrandDetailSkeleton />
      ) : notFound || !brand ? (
        <section className="border-b border-[#E5E5E5]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
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
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to brands
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
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-4 text-[12px] text-black/45 sm:px-8">
              <Link href="/" className="hover:text-black">
                Home
              </Link>
              <span>/</span>
              <Link href="/brands" className="hover:text-black">
                Brands
              </Link>
              <span>/</span>
              <span className="text-black">{brand.name}</span>
            </div>
          </div>

          {/* Hero */}
          <section className="border-b border-[#E5E5E5]">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-20">
              <div className="lg:col-span-6">
                <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F6F6F6]">
                  {brand.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center text-black/25">
                      <Shirt className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6 lg:pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                  Brand
                </p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl">
                  {brand.name}
                </h1>
                <p className="mt-6 max-w-xl text-[15px] leading-7 text-black/60">
                  {brand.description}
                </p>

                <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-[#E5E5E5] pt-8">
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
                      Colours
                    </dt>
                    <dd className="mt-2 text-2xl font-semibold tracking-tight text-black">
                      {brand.colorCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
                      Sizes
                    </dt>
                    <dd className="mt-2 text-2xl font-semibold tracking-tight text-black">
                      {totalSizes.length || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
                      Added
                    </dt>
                    <dd className="mt-2 text-[13px] font-medium text-black">
                      {formatDate(brand.createdAt)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <Link
                    href="/#contact"
                    className="inline-flex h-11 items-center gap-1.5 rounded-md bg-[#B80A0B] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#9C0909]"
                  >
                    Enquire about this brand
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/brands"
                    className="inline-flex h-11 items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-5 text-[13px] font-medium text-black transition-colors hover:bg-[#F6F6F6]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    All brands
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Colours */}
          <section className="border-b border-[#E5E5E5] bg-[#F6F6F6]">
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                    Colourways
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                    Available colours & sizes
                  </h2>
                </div>
                <p className="text-[12px] text-black/45">
                  {brand.colorCount} colour
                  {brand.colorCount === 1 ? "" : "s"} in this style
                </p>
              </div>

              <div className="mt-10">
                {colorsLoading ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-44 w-full rounded-lg"
                      />
                    ))}
                  </div>
                ) : colors.length === 0 ? (
                  <div className="rounded-lg border border-[#E5E5E5] bg-white">
                    <EmptyState
                      icon={<Palette className="h-5 w-5" />}
                      title="Colourways coming soon"
                      description="Available colours for this brand will appear here once published."
                    />
                  </div>
                ) : (
                  <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {colors.map((color) => (
                      <li
                        key={color.id}
                        className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white"
                      >
                        <div className="relative aspect-[5/4] bg-[#F6F6F6]">
                          {color.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={color.image}
                              alt={color.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div
                              className="h-full w-full"
                              style={{ backgroundColor: color.code }}
                            />
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="h-4 w-4 rounded-full border border-black/10"
                                  style={{ backgroundColor: color.code }}
                                  aria-hidden
                                />
                                <h3 className="text-[14px] font-semibold tracking-tight text-black">
                                  {color.name}
                                </h3>
                              </div>
                              <p className="mt-1.5 font-mono text-[11px] text-black/40">
                                {color.code}
                              </p>
                            </div>
                            <Check
                              className="mt-0.5 h-3.5 w-3.5 text-[#1845D6]"
                              aria-hidden
                            />
                          </div>

                          <div className="mt-4 border-t border-[#E5E5E5] pt-4">
                            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
                              <Ruler className="h-3 w-3" />
                              Sizes
                            </p>
                            {color.availableSizes.length > 0 ? (
                              <div className="mt-2.5 flex flex-wrap gap-1.5">
                                {color.availableSizes.map((size) => (
                                  <span
                                    key={size}
                                    className="inline-flex h-7 min-w-[36px] items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F6F6F6] px-2 text-[11px] font-medium text-black"
                                  >
                                    {size}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-[12px] text-black/45">
                                Sizes on request
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-black">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-5 py-14 sm:px-8 lg:py-16">
              <div className="max-w-xl">
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Interested in {brand.name}?
                </h2>
                <p className="mt-3 text-[14px] leading-7 text-white/60">
                  Share your quantities and target delivery. We'll confirm
                  sampling, lead time and pricing.
                </p>
              </div>
              <Link
                href="/#contact"
                className="inline-flex h-11 items-center gap-1.5 rounded-md bg-[#B80A0B] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#9C0909]"
              >
                Request a quote
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function BrandDetailSkeleton() {
  return (
    <>
      <div className="border-b border-[#E5E5E5]">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-4 sm:px-8">
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-20">
        <div className="lg:col-span-6">
          <Skeleton className="aspect-[4/5] w-full rounded-lg" />
        </div>
        <div className="space-y-6 lg:col-span-6 lg:pt-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="grid grid-cols-3 gap-6 pt-8">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    </>
  );
}