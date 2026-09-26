// components/site/SearchBar.tsx
"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useBrands,
  useCategories,
  useProducts,
} from "../lib/hooks/useCollectionData";

interface Result {
  key: string;
  type: "category" | "brand" | "product";
  name: string;
  subtitle: string;
  href: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const categoriesState = useCategories();
  const brandsState = useBrands();
  const productsState = useProducts();

  const results = useMemo<Result[]>(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const out: Result[] = [];

    /* --- Categories --- */
    categoriesState.data.forEach((c) => {
      if (
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term)
      ) {
        out.push({
          key: `cat-${c.id}`,
          type: "category",
          name: c.name,
          subtitle: "Category",
          href: `/brands#category-${c.id}`,
        });
      }
    });

    /* --- Brands --- */
    brandsState.data.forEach((b) => {
      if (
        b.name.toLowerCase().includes(term) ||
        b.slug.toLowerCase().includes(term)
      ) {
        const cat = categoriesState.data.find((c) => c.id === b.categoryId);
        out.push({
          key: `brand-${b.id}`,
          type: "brand",
          name: b.name,
          subtitle: cat ? `Brand · ${cat.name}` : "Brand",
          href: `/brands/${b.slug}`,
        });
      }
    });

    /* --- Products --- */
    productsState.data.forEach((p) => {
      if (
        p.name.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term)
      ) {
        const brand = brandsState.data.find((b) => b.id === p.brandId);
        out.push({
          key: `prod-${p.id}`,
          type: "product",
          name: p.name,
          subtitle: brand ? `Product · ${brand.name}` : "Product",
          href: brand ? `/brands/${brand.slug}/${p.slug}` : "/brands",
        });
      }
    });

    return out.slice(0, 12);
  }, [
    query,
    categoriesState.data,
    brandsState.data,
    productsState.data,
  ]);

  /* Close on outside click */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const showDropdown = open && query.trim().length > 0;

  return (
    <div
      ref={containerRef}
      className="relative mx-1 min-w-0 flex-1 sm:mx-4 sm:max-w-xl"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1845D6]" />

      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search for products, brands and more"
        className="h-9 w-full rounded-sm border-0 bg-white pl-9 pr-9 text-[13px] text-black placeholder:text-black/40 focus:outline-none sm:h-10"
      />

      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-black/40 transition-colors hover:text-black"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto bg-white shadow-lg ring-1 ring-black/10">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] font-medium text-[#1A2340]">
                No results found
              </p>
              <p className="mt-1 text-[12px] text-black/50">
                Nothing matches &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F0F0F0]">
              {results.map((r) => (
                <li key={r.key}>
                  <Link
                    href={r.href}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-[#F1F3F6]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[#1A2340]">
                        {r.name}
                      </p>
                      <p className="truncate text-[11px] text-black/50">
                        {r.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#1845D6]">
                      {r.type}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}