"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, Shirt } from "lucide-react";
import { Header } from "../../components/site/Header";
import { Footer } from "../../components/site/Footer";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useBrands } from "../../lib/hooks/useCollectionData";
import { cn, truncate } from "../../lib/utils";

export default function BrandsPage() {
  const { data: brands, loading, error } = useBrands();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return brands;
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.slug.toLowerCase().includes(term) ||
        b.description.toLowerCase().includes(term)
    );
  }, [brands, search]);

  return (
    <div className="bg-white">
      <Header />

      {/* Page header */}
      <section className="border-b border-[#E5E5E5]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
            Catalogue
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
            Brands
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-black/55">
            Every SS Executive brand is a fully manufactured style with its
            own colour range, size set and photography.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brands…"
                aria-label="Search brands"
                className="h-11 w-full rounded-md border border-[#E5E5E5] bg-white pl-9 pr-3 text-[13px] text-black placeholder:text-black/35 transition-colors focus:border-[#1845D6] focus:outline-none focus:ring-2 focus:ring-[#1845D6]/15"
              />
            </div>
            <p className="text-[12px] text-black/45">
              {loading
                ? "Loading…"
                : `${filtered.length} brand${filtered.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="border-b border-[#E5E5E5]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-[#E5E5E5]"
                >
                  <Skeleton className="aspect-[4/5] w-full rounded-none" />
                  <div className="space-y-2 p-5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-[#E5E5E5] bg-white">
              <ErrorState message={error} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-[#E5E5E5] bg-white">
              <EmptyState
                icon={<Shirt className="h-5 w-5" />}
                title={
                  search ? "No brands match your search" : "No brands yet"
                }
                description={
                  search
                    ? "Try a different name, slug or keyword."
                    : "Brands will appear here once the catalogue is populated."
                }
                action={
                  search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="inline-flex h-9 items-center rounded-md border border-[#E5E5E5] bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-[#F6F6F6]"
                    >
                      Clear search
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((brand) => (
                <li key={brand.id}>
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="group block overflow-hidden rounded-lg border border-[#E5E5E5] bg-white transition-colors hover:border-black"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#F6F6F6]">
                      {brand.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : null}
                      <span className="absolute left-4 top-4 rounded-full border border-[#E5E5E5] bg-white/95 px-2.5 py-0.5 text-[11px] font-medium text-black backdrop-blur">
                        {brand.colorCount} colour
                        {brand.colorCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-[15px] font-semibold tracking-tight text-black">
                          {brand.name}
                        </h2>
                        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-black/30 transition-colors group-hover:text-[#B80A0B]" />
                      </div>
                      <p className="mt-2 text-[13px] leading-6 text-black/55">
                        {truncate(brand.description, 120)}
                      </p>
                      <p
                        className={cn(
                          "mt-4 font-mono text-[11px] text-black/35"
                        )}
                      >
                        /{brand.slug}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}