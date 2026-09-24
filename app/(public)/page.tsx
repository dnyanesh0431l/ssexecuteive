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
    <div className="bg-background pb-20">
      {/* ---------- Hero carousel ---------- */}
      <section className="mx-auto max-w-3xl px-5 pt-8 sm:pt-12">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-light-gray p-2 sm:p-3">
          <div className="relative aspect-[16/11] overflow-hidden rounded-xl">
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

        {/* Indicators */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-[3px] rounded-full transition-all duration-300 ${
                i === slide
                  ? "w-8 bg-primary-blue"
                  : "w-4 bg-border hover:bg-foreground/25"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ---------- Intro ---------- */}
      <div className="mx-auto mt-12 max-w-3xl px-5 text-center sm:mt-16">
        <h1 className="text-[32px] font-bold leading-[1.15] tracking-tight text-foreground sm:text-[42px]">
          The SS Executive collection
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-6 text-foreground/55">
          Fine shirting and formal wear, organised by house and by style.
        </p>
      </div>

      {/* ---------- Categories ---------- */}
      <section className="mx-auto mt-10 max-w-3xl space-y-7 px-5 sm:mt-12">
        {categoriesState.loading || brandsState.loading ? (
          <div className="space-y-7">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-foreground px-6 py-10"
              >
                <div className="mx-auto h-6 w-44 rounded bg-background/10" />
                <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-background/10">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-12 bg-foreground" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : categoriesState.data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-foreground/45">
            No categories yet.
          </div>
        ) : (
          categoriesState.data.map((cat) => {
            const brands = brandsByCategory.get(cat.id) ?? [];
            return (
              <div
                key={cat.id}
                className="rounded-2xl bg-foreground px-6 py-9 sm:px-9 sm:py-11"
              >
                <div className="flex flex-col items-center">
                  <h2 className="text-center text-[26px] font-semibold tracking-tight text-background sm:text-[32px]">
                    {cat.name}
                  </h2>
                  <span className="mt-3 h-[3px] w-10 rounded-full bg-primary-blue" />
                </div>

                {brands.length === 0 ? (
                  <p className="mt-6 text-center text-sm text-background/40">
                    No brands in this category yet.
                  </p>
                ) : (
                  <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-background/10">
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/brands/${brand.slug}`}
                        className="flex min-h-[60px] items-center justify-center bg-foreground px-3 py-3 text-center text-[13px] font-medium tracking-wide text-background/90 transition-colors hover:bg-background/[0.06] hover:text-primary-blue sm:text-sm"
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