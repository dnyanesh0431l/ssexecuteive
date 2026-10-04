// app/(public)/page.tsx
"use client";

import { ChevronRight } from "lucide-react";
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
    image:
      "https://i.pinimg.com/1200x/ad/89/12/ad891271ccf1262ac153bab88ca68c57.jpg",
    title: "SS Executive Offer's",
    subtitle: "",
    link: "",
    order: 0,
    active: true,
    createdAt: null,
  },
  {
    id: "f2",
    image: "https://picsum.photos/seed/ssexec-hero-2/1920/820",
    title: "",
    subtitle: "",
    link: "",
    order: 1,
    active: true,
    createdAt: null,
  },
  {
    id: "f3",
    image: "https://picsum.photos/seed/ssexec-hero-3/1920/820",
    title: "",
    subtitle: "",
    link: "",
    order: 2,
    active: true,
    createdAt: null,
  },
];

/* Stronger, more visible category tints */
const CATEGORY_BG = [
  "bg-[#DCE7FB]", // strong soft blue — logo blue
  "bg-[#FBDDDD]", // strong soft red — logo red
  "bg-[#FDF0C4]", // strong soft yellow — tape measure
  "bg-[#D9ECDD]", // strong soft green
  "bg-[#E6DCF7]", // strong soft lavender
  "bg-[#D2EFEF]", // strong soft cyan
  "bg-[#F8E1CC]", // strong soft peach
  "bg-[#E4E4E4]", // neutral grey
];

/* Matching header text accents */
const CATEGORY_ACCENT = [
  "text-[#1845D6]",
  "text-[#B80A0B]",
  "text-[#8A6800]",
  "text-[#2F6B3B]",
  "text-[#5A2FA8]",
  "text-[#0A5C5B]",
  "text-[#A0530F]",
  "text-[#1A2340]",
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
    <div className="pb-8">
      {/* ---------- Hero carousel ---------- */}
      {banners.length > 0 ? (
        <section className="mx-auto mt-3 max-w-7xl px-0 sm:px-6">
          <div className="bg-white shadow-sm">
            {/* 16:9 on mobile · 21:9 on desktop */}
            <div className="relative aspect-video overflow-hidden sm:aspect-[21/9]">
              {banners.map((b, i) => {
                const inner = (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.image}
                    alt={b.title || "SS Executive"}
                    className="h-full w-full object-cover"
                  />
                );
                return (
                  <div
                    key={b.id}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === slide ? 1 : 0 }}
                  >
                    {b.link ? (
                      <Link href={b.link} className="block h-full w-full">
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </div>
                );
              })}

              {/* Dots overlaid on banner */}
              {banners.length > 1 ? (
                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-4">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlide(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === slide
                          ? "w-5 bg-white"
                          : "w-1.5 bg-white/60 hover:bg-white/90"
                      }`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------- Category chips strip ---------- */}
      {categoriesState.data.length > 0 ? (
        <section className="mt-3 bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl items-start justify-start gap-4 overflow-x-auto px-4 py-3 scrollbar-hide sm:justify-center sm:gap-10 sm:px-6 sm:py-4">
            {categoriesState.data.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`#category-${cat.id}`}
                className="group flex w-[68px] shrink-0 flex-col items-center gap-1.5 sm:w-[84px]"
              >
                <div
                  className={`h-14 w-14 overflow-hidden  transition-transform group-hover:scale-105 sm:h-16 sm:w-16 ${
                    CATEGORY_BG[idx % CATEGORY_BG.length]
                  }`}
                >
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <span className="line-clamp-1 text-center text-[11px] font-medium text-[#1A2340] sm:text-[12px]">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------- Category sections ---------- */}
      <div className="mx-auto mt-3 max-w-7xl space-y-3 px-0 sm:px-6">
        {categoriesState.loading || brandsState.loading ? (
          <>
            {[1, 2].map((i) => (
              <section key={i} className="animate-pulse bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#F0F0F0] px-4 py-3 sm:px-5">
                  <div className="h-5 w-32 rounded bg-[#F0F0F0]" />
                  <div className="h-7 w-20 rounded bg-[#F0F0F0]" />
                </div>
                <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 md:grid-cols-4 lg:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="bg-white">
                      <div className="aspect-square bg-[#F6F6F6]" />
                      <div className="space-y-2 px-3 py-3">
                        <div className="mx-auto h-3 w-20 rounded bg-[#F6F6F6]" />
                        <div className="mx-auto h-2.5 w-14 rounded bg-[#F6F6F6]" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : categoriesState.data.length === 0 ? (
          <div className="bg-white p-16 text-center text-sm text-black/50 shadow-sm">
            No categories yet.
          </div>
        ) : (
          categoriesState.data.map((cat, idx) => {
            const brands = brandsByCategory.get(cat.id) ?? [];
            if (brands.length === 0) return null;

            const bgClass = CATEGORY_BG[idx % CATEGORY_BG.length];
            const accentClass = CATEGORY_ACCENT[idx % CATEGORY_ACCENT.length];

            return (
              <section
                key={cat.id}
                id={`category-${cat.id}`}
                className={`shadow-sm ${bgClass}`}
              >
                {/* Section header */}
                <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-5 w-1 bg-current ${accentClass}`}
                      aria-hidden
                    />
                    <h2
                      className={`text-[18px] font-extrabold uppercase tracking-tight sm:text-[20px] ${accentClass}`}
                    >
                      {cat.name}
                    </h2>
                  </div>
                </div>

                {/* Brand grid — flat white tiles on the tinted section */}
                <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 md:grid-cols-4 lg:grid-cols-5">
                  {brands.map((brand) => {
                    // Prefer the brand's main image; fall back to the first banner image
                    const cover =
                      brand.mainImage || brand.bannerImages[0] || "";

                    return (
                      <Link
                        key={brand.id}
                        href={`/brands/${brand.slug}`}
                        className="group flex flex-col overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex aspect-square w-full items-center justify-center overflow-hidden">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover}
                              alt={brand.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : null}
                        </div>
                        <div className="px-3 py-3 text-center">
                          <p className="line-clamp-2 text-[14px] font-bold text-[#1A2340] group-hover:text-[#1845D6] sm:text-[15px]">
                            {brand.name}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold text-[#388E3C]">
                            {brand.productCount}{" "}
                            {brand.productCount === 1 ? "Product" : "Products"}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* ---------- Bottom offer strip ---------- */}
      <section className="mx-auto mt-3 max-w-7xl px-0 sm:px-6">
        <div className="bg-white p-5 text-center shadow-sm sm:p-8">
          <h3 className="text-lg font-bold tracking-tight text-[#1A2340] sm:text-xl">
            Bulk Orders Welcome
          </h3>
          <p className="mt-2 text-[13px] text-black/60 sm:text-sm">
            Special pricing for teams, uniforms and corporate gifting.
          </p>
          <Link
            href="/brands"
            className="mt-4 inline-flex items-center gap-1.5 bg-[#B80A0B] px-5 py-2.5 text-[13px] font-bold uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-[#9C0909]"
          >
            Explore Catalogue
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
