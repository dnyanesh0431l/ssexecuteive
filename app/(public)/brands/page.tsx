// app/(public)/brands/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useBrands, useCategories } from "../../lib/hooks/useCollectionData";

/* Same palette as home page for visual consistency */
const CATEGORY_BG = [
  "bg-[#DCE7FB]", // strong soft blue
  "bg-[#FBDDDD]", // strong soft red
  "bg-[#FDF0C4]", // strong soft yellow
  "bg-[#D9ECDD]", // strong soft green
  "bg-[#E6DCF7]", // strong soft lavender
  "bg-[#D2EFEF]", // strong soft cyan
  "bg-[#F8E1CC]", // strong soft peach
  "bg-[#E4E4E4]", // neutral grey
];

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

export default function BrandsPage() {
  const brandsState = useBrands();
  const categoriesState = useCategories();

  const grouped = useMemo(
    () =>
      categoriesState.data
        .map((cat) => ({
          category: cat,
          brands: brandsState.data.filter((b) => b.categoryId === cat.id),
        }))
        .filter((g) => g.brands.length > 0),
    [categoriesState.data, brandsState.data],
  );

  const loading = brandsState.loading || categoriesState.loading;

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-7xl px-0 sm:px-6">
        {/* ---------- Page heading ---------- */}
        <div className="mt-3 bg-white px-5 py-5 shadow-sm sm:px-6 sm:py-6">
          <h1 className="text-[22px] font-extrabold uppercase tracking-tight text-[#1A2340] sm:text-[26px]">
            All Brands
          </h1>
          <p className="mt-1 text-[13px] text-black/55 sm:text-sm">
            Browse every brand across our categories.
          </p>
        </div>

        {/* ---------- Loading skeletons ---------- */}
        {loading ? (
          <div className="mt-3 space-y-3">
            {[1, 2].map((i) => (
              <section key={i} className="animate-pulse bg-white shadow-sm">
                <div className="border-b border-[#F0F0F0] px-4 py-3 sm:px-5">
                  <div className="h-5 w-32 rounded bg-[#F0F0F0]" />
                </div>
                <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 md:grid-cols-4 lg:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="bg-white shadow-sm">
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
          </div>
        ) : grouped.length === 0 ? (
          <div className="mt-3 bg-white p-16 text-center text-sm text-black/50 shadow-sm">
            No brands yet.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {grouped.map(({ category, brands }, idx) => {
              const bgClass = CATEGORY_BG[idx % CATEGORY_BG.length];
              const accentClass = CATEGORY_ACCENT[idx % CATEGORY_ACCENT.length];

              return (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
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
                        {category.name}
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-black/45 sm:text-[12px]">
                      {brands.length} {brands.length === 1 ? "brand" : "brands"}
                    </span>
                  </div>

                  {/* Brand cards */}
                  <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 md:grid-cols-4 lg:grid-cols-5">
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/brands/${brand.slug}`}
                        className="group flex flex-col overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex aspect-square w-full items-center justify-center overflow-hidden">
                          {brand.bannerImages[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={brand.bannerImages[0]}
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
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
