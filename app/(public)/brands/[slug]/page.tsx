// app/(public)/brands/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  useBrands,
  useCategories,
} from "../../../lib/hooks/useCollectionData";

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
    [categoriesState.data, brandsState.data]
  );

  const loading = brandsState.loading || categoriesState.loading;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#1845D6] sm:text-4xl">
        All Brands
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-xl bg-[#F6F6F6]" />
              <div className="mx-auto mt-3 h-3 w-20 rounded bg-[#F6F6F6]" />
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <p className="py-20 text-center text-sm text-black/50">
          No brands yet.
        </p>
      ) : (
        grouped.map(({ category, brands }) => (
          <section key={category.id} className="mb-12">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-[#B80A0B]" />
              <h2 className="text-xl font-extrabold tracking-tight text-[#1A2340] sm:text-2xl">
                {category.name}
              </h2>
              <span className="text-xs font-medium text-black/40">
                {brands.length} {brands.length === 1 ? "brand" : "brands"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group block"
                >
                  <div className="aspect-square overflow-hidden rounded-xl border border-[#E5E5E5] bg-[#F6F6F6]">
                    {brand.bannerImages[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.bannerImages[0]}
                        alt={brand.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <p className="mt-2.5 text-center text-sm font-extrabold uppercase tracking-wide text-[#1A2340] group-hover:text-[#1845D6]">
                    {brand.name}
                  </p>
                  <p className="text-center text-[11px] text-black/40">
                    {brand.productCount} product
                    {brand.productCount === 1 ? "" : "s"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}