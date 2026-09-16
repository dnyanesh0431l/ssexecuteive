"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Grid3x3, List, Search, Shirt } from "lucide-react";
import { Header } from "../../components/site/Header";
import { Footer } from "../../components/site/Footer";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useBrands } from "../../lib/hooks/useCollectionData";
import { cn, truncate } from "../../lib/utils";

type SortKey = "recent" | "name" | "colours";

export default function BrandsPage() {
  const { data: brands, loading, error } = useBrands();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = term
      ? brands.filter(
          (b) =>
            b.name.toLowerCase().includes(term) ||
            b.slug.toLowerCase().includes(term) ||
            b.description.toLowerCase().includes(term)
        )
      : [...brands];

    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "colours") return b.colorCount - a.colorCount;
      return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    });
    return list;
  }, [brands, search, sort]);

  const chipBase =
    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors";

  return (
    <div className="bg-white">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }
      `}</style>

      <Header />

      {/* compact hero band */}
      <section className="border-b border-[#E5E5E5]">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                Catalogue
              </p>
              <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Brands
              </h1>
            </div>
            <p className="text-[12px] text-black/45">
              {loading
                ? "Loading…"
                : `${filtered.length} brand${filtered.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      </section>

      {/* sticky toolbar */}
      <div className="sticky top-14 z-30 border-b border-[#E5E5E5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands…"
              aria-label="Search brands"
              className="h-9 w-full rounded-md border border-[#E5E5E5] bg-white pl-8 pr-3 text-[13px] text-black placeholder:text-black/35 transition-colors focus:border-[#1845D6] focus:outline-none focus:ring-2 focus:ring-[#1845D6]/15"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(
              [
                { key: "recent", label: "Recent" },
                { key: "name", label: "A–Z" },
                { key: "colours", label: "Colours" },
              ] as { key: SortKey; label: string }[]
            ).map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSort(s.key)}
                className={cn(
                  chipBase,
                  sort === s.key
                    ? "border-[#1845D6] bg-[rgba(24,69,214,0.06)] text-[#1845D6]"
                    : "border-[#E5E5E5] bg-white text-black/60 hover:bg-[#F6F6F6]"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="ml-auto hidden items-center gap-1 rounded-md border border-[#E5E5E5] bg-white p-0.5 sm:flex">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setView("grid")}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded transition-colors",
                view === "grid" ? "bg-[#F6F6F6] text-black" : "text-black/45 hover:text-black"
              )}
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setView("list")}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded transition-colors",
                view === "list" ? "bg-[#F6F6F6] text-black" : "text-black/45 hover:text-black"
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* grid / list */}
      <section className="border-b border-[#E5E5E5]">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] w-full rounded-lg" />
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
                title={search ? "No brands match your search" : "No brands yet"}
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
          ) : view === "grid" ? (
            <ul className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((brand, i) => (
                <li
                  key={brand.id}
                  style={{
                    animation: `fadeUp .55s cubic-bezier(.16,1,.3,1) ${Math.min(i, 8) * 40}ms both`,
                  }}
                >
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="group block overflow-hidden rounded-lg border border-[#E5E5E5] bg-white transition-all duration-300 hover:border-black hover:-translate-y-0.5"
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
                      <span className="absolute left-3 top-3 rounded-full border border-[#E5E5E5] bg-white/95 px-2 py-0.5 text-[11px] font-medium text-black backdrop-blur">
                        {brand.colorCount} colour{brand.colorCount === 1 ? "" : "s"}
                      </span>
                      <span className="absolute right-3 bottom-3 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div className="px-3.5 py-3">
                      <h2 className="text-[14px] font-semibold tracking-tight text-black">
                        {brand.name}
                      </h2>
                      <p className="mt-1 text-[12px] leading-5 text-black/55">
                        {truncate(brand.description, 70)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="divide-y divide-[#E5E5E5] rounded-lg border border-[#E5E5E5] bg-white">
              {filtered.map((brand, i) => (
                <li
                  key={brand.id}
                  style={{
                    animation: `fadeUp .4s ease-out ${Math.min(i, 10) * 30}ms both`,
                  }}
                >
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="group flex items-center gap-4 px-3 py-3 transition-colors hover:bg-[#F6F6F6]"
                  >
                    <span className="h-14 w-12 shrink-0 overflow-hidden rounded border border-[#E5E5E5] bg-[#F6F6F6]">
                      {brand.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={brand.image} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-[14px] font-semibold text-black">
                          {brand.name}
                        </h2>
                        <span className="shrink-0 rounded-full border border-[#E5E5E5] px-2 py-0.5 text-[11px] text-black/60">
                          {brand.colorCount} colour{brand.colorCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-black/55">
                        {truncate(brand.description, 120)}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-black/35 hidden sm:block">
                      /{brand.slug}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-black/25 transition-colors group-hover:text-[#B80A0B]" />
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