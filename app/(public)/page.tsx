// app/(public)/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useBanners,
  useBrands,
  useCategories,
} from "../lib/hooks/useCollectionData";
import type { Banner } from "../lib/types";

const FALLBACK_BANNERS: Banner[] = [
  {
    id: "f1",
    image: "https://picsum.photos/seed/ssexec-hero-1/1200/750",
    title: "SS Executive Offer's",
    subtitle: "",
    link: "",
    order: 0,
    active: true,
    createdAt: null,
  },
  {
    id: "f2",
    image: "https://picsum.photos/seed/ssexec-hero-2/1200/750",
    title: "",
    subtitle: "",
    link: "",
    order: 1,
    active: true,
    createdAt: null,
  },
  {
    id: "f3",
    image: "https://picsum.photos/seed/ssexec-hero-3/1200/750",
    title: "",
    subtitle: "",
    link: "",
    order: 2,
    active: true,
    createdAt: null,
  },
];

export default function HomePage() {
  const bannersState = useBanners();
  const categoriesState = useCategories();
  const brandsState = useBrands();

  const banners = useMemo(() => {
    const active = bannersState.data.filter((b) => b.active);
    return active.length > 0 ? active : FALLBACK_BANNERS;
  }, [bannersState.data]);

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlide((s) => (s + 1) % banners.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (slide >= banners.length) setSlide(0);
  }, [slide, banners.length]);

  const brandsByCategory = useMemo(() => {
    const map = new Map<string, typeof brandsState.data>();
    categoriesState.data.forEach((c) => map.set(c.id, []));
    brandsState.data.forEach((b) => {
      const list = map.get(b.categoryId);
      if (list) list.push(b);
    });
    return map;
  }, [categoriesState.data, brandsState.data]);

  return (
    <div className="bg-white pb-16">
      {/* Hero carousel */}
      <section className="mx-auto max-w-3xl px-4 pt-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-3xl border-[6px] border-[#1845D6] bg-[#F1F3F8]">
          <div className="relative aspect-[16/11]">
            {banners.map((b, i) => (
              <div
                key={b.id}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: i === slide ? 1 : 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image}
                  alt={b.title || "SS Executive"}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2.5">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === slide ? "bg-[#1845D6]" : "bg-black/15 hover:bg-black/30"
              }`}
            />
          ))}
        </div>
      </section>

      <h1 className="mx-auto mt-8 max-w-3xl px-4 text-center text-3xl font-extrabold leading-tight tracking-tight text-[#1845D6] sm:text-4xl">
        SS EXECUTIVE OFFER&apos;S
      </h1>

      <section className="mx-auto mt-8 max-w-3xl space-y-8 px-4">
        {categoriesState.loading || brandsState.loading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl bg-[#1A2340]/90 px-6 py-10"
              >
                <div className="mx-auto h-7 w-40 rounded bg-white/10" />
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-12 rounded-md bg-white/10" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : categoriesState.data.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#E5E5E5] py-16 text-center text-sm text-black/50">
            No categories yet.
          </div>
        ) : (
          categoriesState.data.map((cat) => {
            const brands = brandsByCategory.get(cat.id) ?? [];
            return (
              <div
                key={cat.id}
                className="rounded-3xl bg-[#1A2340] px-5 py-8 shadow-[0_10px_30px_-18px_rgba(26,35,64,0.6)] sm:px-8 sm:py-10"
              >
                <h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {cat.name}
                </h2>

                {brands.length === 0 ? (
                  <p className="mt-6 text-center text-sm text-white/50">
                    No brands in this category yet.
                  </p>
                ) : (
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/brands/${brand.slug}`}
                        className="flex min-h-[56px] items-center justify-center rounded-md bg-[#F4F3EE] px-3 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-[#1A2340] transition-all hover:bg-white hover:shadow-lg sm:text-base"
                      >
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}