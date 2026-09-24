// app/(public)/brands/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useBrands, useCategories } from "../../lib/hooks/useCollectionData";

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
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-12 text-center sm:mb-16">
        <h1 className="text-[32px] font-bold tracking-tight text-foreground sm:text-[42px]">
          The full collection
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-6 text-foreground/55">
          Every house we carry, grouped by category.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-lg bg-light-gray" />
              <div className="mx-auto mt-3 h-3 w-20 rounded bg-light-gray" />
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <p className="py-20 text-center text-sm text-foreground/45">
          No products yet.
        </p>
      ) : (
        grouped.map(({ category, brands }) => (
          <section key={category.id} className="mb-14 sm:mb-16">
            <div className="mb-6 flex items-center gap-3 sm:mb-8">
              <span className="h-6 w-1.5 rounded-full bg-primary-red" />
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {category.name}
              </h2>
              <span className="text-xs font-medium text-primary-blue">
                {brands.length} {brands.length === 1 ? "house" : "houses"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group block"
                >
                  <div className="aspect-square overflow-hidden rounded-lg border border-border bg-light-gray">
                    {brand.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.images[0]}
                        alt={brand.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : null}
                  </div>
                  <p className="mt-3 text-center text-[13px] font-medium tracking-wide text-foreground group-hover:text-primary-blue sm:text-sm">
                    {brand.name}
                  </p>
                  <p className="text-center text-[12px] text-foreground/35">
                    {brand.colorCount} colour
                    {brand.colorCount === 1 ? "" : "s"}
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