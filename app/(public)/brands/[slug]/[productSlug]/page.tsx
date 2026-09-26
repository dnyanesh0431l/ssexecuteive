// app/(public)/brands/[slug]/[productSlug]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  useBrands,
  useProducts,
} from "../../../../lib/hooks/useCollectionData";
import { subscribeToProductColors } from "../../../../lib/firebase/products";
import type { ProductColor } from "../../../../lib/types";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string; productSlug: string }>();
  const brandSlug = params?.slug;
  const productSlug = params?.productSlug;

  const brandsState = useBrands();
  const productsState = useProducts();

  const brand = useMemo(
    () => brandsState.data.find((b) => b.slug === brandSlug),
    [brandsState.data, brandSlug]
  );

  const product = useMemo(
    () => productsState.data.find((p) => p.slug === productSlug),
    [productsState.data, productSlug]
  );

  const [colors, setColors] = useState<ProductColor[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [activeColorId, setActiveColorId] = useState<string | null>(null);

  useEffect(() => {
    if (!product?.id) return;
    const unsub = subscribeToProductColors(product.id, setColors, () => undefined);
    return () => unsub();
  }, [product?.id]);

  useEffect(() => {
    setActiveImage(0);
    setActiveColorId(null);
  }, [product?.id]);

  if (brandsState.loading || productsState.loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="mx-auto h-8 w-40 animate-pulse rounded bg-[#F6F6F6]" />
        <div className="mt-8 aspect-square animate-pulse rounded-3xl bg-[#F6F6F6]" />
      </div>
    );
  }

  if (!brand || !product) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-lg font-bold text-[#1A2340]">Product not found</p>
        <Link
          href="/brands"
          className="mt-4 inline-block text-sm font-medium text-[#1845D6] underline"
        >
          Browse all brands
        </Link>
      </div>
    );
  }

  const activeColor = colors.find((c) => c.id === activeColorId) ?? null;
  const displayImage =
    activeColor?.image || product.images[activeImage] || product.images[0] || "";

  const contactHref = `mailto:info@ssexecutive.com?subject=${encodeURIComponent(
    `Enquiry: ${brand.name} — ${product.name}`
  )}`;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6">
      <Link
        href={`/brands/${brand.slug}`}
        className="inline-block text-sm font-medium text-[#1845D6] transition-opacity hover:opacity-75"
      >
        ← Back to {brand.name}
      </Link>

      <h1 className="mt-4 text-center text-3xl font-extrabold uppercase tracking-tight text-[#1845D6] sm:text-4xl">
        {product.name}
      </h1>

      {/* Main image */}
      <div className="mt-6 aspect-square overflow-hidden rounded-3xl border border-[#E5E5E5] bg-[#F6F6F6]">
        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      {/* Thumbnails */}
      {product.images.length > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
          {product.images.map((url, i) => {
            const selected = activeImage === i && !activeColorId;
            return (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => {
                  setActiveImage(i);
                  setActiveColorId(null);
                }}
                className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                  selected ? "border-[#1845D6]" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Colours */}
      {colors.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-[#1845D6] sm:text-3xl">
            Available Patterns And Colors
          </h2>

          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-4">
            {colors.map((c) => {
              const selected = c.id === activeColorId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveColorId(selected ? null : c.id)}
                  className={`flex w-[76px] flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-colors ${
                    selected
                      ? "border-[#1845D6] bg-[rgba(24,69,214,0.05)]"
                      : "border-[#E5E5E5] bg-white hover:border-black/20"
                  }`}
                >
                  <span
                    className="h-10 w-10 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: c.code }}
                  />
                  <span className="line-clamp-1 text-[11px] font-semibold text-[#1A2340]">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Details */}
      <section className="mt-10 rounded-3xl border-2 border-[#1A2340] px-6 py-6 sm:px-8">
        <dl className="space-y-3 text-[#1A2340]">
          <DetailRow label="NAME" value={product.name} />
          <DetailRow
            label="COLOR"
            value={activeColor ? activeColor.name : "All available"}
          />
          <DetailRow
            label="SIZE"
            value={product.sizes.length > 0 ? product.sizes.join(" , ") : "—"}
          />
        </dl>

        <div className="mt-5 border-t border-[#E5E5E5] pt-4">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1A2340]">
            Description
          </p>
          <p className="mt-1.5 text-sm leading-6 text-black/75">
            {product.description}
          </p>
        </div>

        <a
          href={contactHref}
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#1A2340] py-3.5 text-sm font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-[#0F1729]"
        >
          Contact Now
        </a>
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3">
      <dt className="text-[11px] font-extrabold uppercase tracking-wider text-[#1A2340]">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-[#1A2340]">{value}</dd>
    </div>
  );
}