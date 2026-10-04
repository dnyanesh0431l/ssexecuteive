// app/(public)/brands/[slug]/page.tsx
"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  useBrands,
  useCategories,
  useProducts,
} from "../../../lib/hooks/useCollectionData";

export default function BrandDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const brandsState = useBrands();
  const productsState = useProducts();
  const categoriesState = useCategories();

  const brand = useMemo(
    () => brandsState.data.find((b) => b.slug === slug),
    [brandsState.data, slug],
  );

  const products = useMemo(() => {
    const list = productsState.data.filter((p) => p.brandId === brand?.id);

    // "Pehle dala wala pehle" -> createdAt ascending (oldest first)
    return [...list].sort((a, b) => {
      const aT =
        a.createdAt?.toMillis?.() ?? new Date(a.createdAt ?? 0).getTime();
      const bT =
        b.createdAt?.toMillis?.() ?? new Date(b.createdAt ?? 0).getTime();
      return aT - bT;
    });
  }, [productsState.data, brand?.id]);

  const category = useMemo(
    () => categoriesState.data.find((c) => c.id === brand?.categoryId),
    [categoriesState.data, brand?.categoryId],
  );

  const banners = brand?.bannerImages ?? [];
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    setSlide(0);
  }, [brand?.id]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = window.setInterval(() => {
      setSlide((s) => (s + 1) % banners.length);
    }, 4500);
    return () => window.clearInterval(t);
  }, [banners.length]);

  /* ---------- Loading ---------- */
  if (brandsState.loading || productsState.loading) {
    return (
      <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-6">
        <div className="animate-pulse bg-white shadow-sm sm:rounded">
          <div className="aspect-[21/9] bg-[#F6F6F6] sm:aspect-[3/1]" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-4 shadow-sm sm:rounded">
              <div className="aspect-square animate-pulse rounded bg-[#F6F6F6]" />
              <div className="mx-auto mt-3 h-3 w-24 animate-pulse rounded bg-[#F6F6F6]" />
              <div className="mx-auto mt-2 h-2.5 w-16 animate-pulse rounded bg-[#F6F6F6]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Not found ---------- */
  if (!brand) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-lg font-bold text-[#1A2340]">Brand not found</p>
        <Link
          href="/brands"
          className="mt-4 inline-block text-sm font-medium text-[#1845D6] underline"
        >
          Browse all brands
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-7xl px-0 sm:px-6">
        {/* ---------- Breadcrumb ---------- */}
        <nav className="hidden items-center gap-1 bg-white px-5 py-3 text-[12px] text-black/55 shadow-sm sm:flex sm:rounded sm:px-5">
          <Link href="/" className="transition-colors hover:text-[#1845D6]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-black/30" />
          {category ? (
            <>
              <Link
                href="/brands"
                className="transition-colors hover:text-[#1845D6]"
              >
                {category.name}
              </Link>
              <ChevronRight className="h-3 w-3 text-black/30" />
            </>
          ) : null}
          <span className="font-medium text-black/80">{brand.name}</span>
        </nav>

        {/* ---------- Banner carousel ---------- */}
        {banners.length > 0 ? (
          <section className="mt-3 bg-white shadow-sm sm:rounded">
            <div className="relative aspect-video overflow-hidden">
              {banners.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: i === slide ? 1 : 0 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${brand.name} banner ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}

              {banners.length > 1 ? (
                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlide(i)}
                      aria-label={`Banner ${i + 1}`}
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
          </section>
        ) : null}

        {/* ---------- Brand info card ---------- */}
        <section className="mt-3 bg-white shadow-sm sm:rounded">
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#1A2340] sm:text-3xl">
                {brand.name}
              </h1>
              {category ? (
                <p className="mt-1 text-[12px] font-medium uppercase tracking-widest text-[#1845D6]">
                  {category.name}
                </p>
              ) : null}
              {brand.description ? (
                <p className="mt-2 max-w-2xl text-[13px] leading-6 text-black/60 sm:text-sm">
                  {brand.description}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="rounded-full bg-[#F1F3F6] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#1A2340]">
                {products.length}{" "}
                {products.length === 1 ? "Product" : "Products"}
              </span>
            </div>
          </div>
        </section>

        {/* ---------- Products section ---------- */}
        <section className="mt-3 bg-white shadow-sm sm:rounded">
          {/* Section header */}
          <div className="flex items-center justify-between border-b border-[#F0F0F0] px-5 py-3.5 sm:px-6">
            <h2 className="text-[15px] font-bold uppercase tracking-tight text-[#1A2340] sm:text-[17px]">
              Our Products
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-black/50">
              No products yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 divide-x divide-y divide-[#F0F0F0] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/brands/${brand.slug}/${product.slug}`}
                  className="group flex flex-col p-4 transition-colors hover:bg-[#F8F9FB]"
                >
                  <div className="flex aspect-square w-full items-center justify-center overflow-hidden">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <p className="mt-3 line-clamp-2 text-center text-[18px] font-bold text-[#1A2340] group-hover:text-[#1845D6]">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-center text-[11px] font-semibold text-[#388E3C]">
                    {product.colorCount}{" "}
                    {product.colorCount === 1 ? "Colour" : "Colours"}
                  </p>
                  {product.sizes.length > 0 ? (
                    <p className="mt-0.5 line-clamp-1 text-center text-[10px] uppercase tracking-wider text-black/45">
                      {product.sizes.join(" · ")}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
