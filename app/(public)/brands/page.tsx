// app/(public)/brands/[slug]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  useBrands,
  useProducts,
} from "../../lib/hooks/useCollectionData";

export default function BrandDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const brandsState = useBrands();
  const productsState = useProducts();

  const brand = useMemo(
    () => brandsState.data.find((b) => b.slug === slug),
    [brandsState.data, slug],
  );

  const products = useMemo(
    () => productsState.data.filter((p) => p.brandId === brand?.id),
    [productsState.data, brand?.id],
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

  if (brandsState.loading || productsState.loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="mx-auto h-8 w-40 animate-pulse rounded bg-[#F6F6F6]" />
        <div className="mt-6 aspect-[16/9] animate-pulse rounded-3xl bg-[#F6F6F6]" />
      </div>
    );
  }

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
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <Link
        href="/brands"
        className="inline-block text-sm font-medium text-[#1845D6] transition-opacity hover:opacity-75"
      >
        ← Back to brands
      </Link>

      <h1 className="mt-4 text-center text-3xl font-extrabold uppercase tracking-tight text-[#1845D6] sm:text-4xl">
        {brand.name}
      </h1>

      {/* Banner carousel */}
      {banners.length > 0 ? (
        <section className="mt-6">
          <div className="relative overflow-hidden rounded-3xl border border-[#E5E5E5] bg-[#F6F6F6]">
            <div className="relative aspect-[16/9]">
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
            </div>
          </div>

          {banners.length > 1 ? (
            <div className="mt-3 flex items-center justify-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`Banner ${i + 1}`}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === slide ? "bg-[#1845D6]" : "bg-black/15"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Description */}
      {brand.description ? (
        <p className="mt-6 text-center text-sm leading-7 text-black/70">
          {brand.description}
        </p>
      ) : null}

      {/* Products */}
      <section className="mt-10">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-[#1845D6] sm:text-3xl">
          Our Products
        </h2>

        {products.length === 0 ? (
          <p className="mt-6 text-center text-sm text-black/50">
            No products yet.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/brands/${brand.slug}/${product.slug}`}
                className="group block"
              >
                <div className="aspect-square overflow-hidden rounded-2xl border border-[#E5E5E5] bg-[#F6F6F6]">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <p className="mt-2.5 text-center text-sm font-extrabold uppercase tracking-wide text-[#1A2340] group-hover:text-[#1845D6]">
                  {product.name}
                </p>
                <p className="text-center text-[11px] text-black/40">
                  {product.colorCount} colour
                  {product.colorCount === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
