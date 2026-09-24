// app/(public)/brands/[slug]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { subscribeToColors } from "../../../lib/firebase/brands";
import { useBrands } from "../../../lib/hooks/useCollectionData";
import type { BrandColor } from "../../../lib/types";

export default function BrandDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const brandsState = useBrands();

  const brand = useMemo(
    () => brandsState.data.find((b) => b.slug === slug),
    [brandsState.data, slug],
  );

  const [colors, setColors] = useState<BrandColor[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [activeColorId, setActiveColorId] = useState<string | null>(null);

  useEffect(() => {
    if (!brand?.id) return;
    const unsub = subscribeToColors(brand.id, setColors, () => undefined);
    return () => unsub();
  }, [brand?.id]);

  useEffect(() => {
    setActiveImage(0);
    setActiveColorId(null);
  }, [brand?.id]);

  if (brandsState.loading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <div className="mx-auto h-7 w-40 animate-pulse rounded bg-light-gray" />
        <div className="mt-8 aspect-square animate-pulse rounded-2xl bg-light-gray" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-center">
        <p className="text-xl font-semibold text-foreground">
          We couldn&apos;t find that product
        </p>
        <Link
          href="/brands"
          className="mt-4 inline-block text-sm font-medium text-primary-blue underline underline-offset-4"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  const activeColor = colors.find((c) => c.id === activeColorId) ?? null;
  const displayImage =
    activeColor?.image || brand.images[activeImage] || brand.images[0] || "";

  const contactHref = `mailto:info@ssexecutive.com?subject=${encodeURIComponent(
    `Enquiry: ${brand.name}`,
  )}`;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-20 pt-8 sm:px-8">
      <Link
        href="/brands"
        className="inline-flex items-center text-[13px] font-medium text-foreground/55 transition-colors hover:text-primary-blue"
      >
        ← Back to collection
      </Link>

      <h1 className="mt-5 text-center text-[30px] font-bold tracking-tight text-foreground sm:text-[38px]">
        {brand.name}
      </h1>

      {/* Main image */}
      <div className="mt-7 aspect-square overflow-hidden rounded-2xl border border-border bg-light-gray">
        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage}
            alt={brand.name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      {/* Image thumbnails */}
      {brand.images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
          {brand.images.map((url, i) => {
            const selected = activeImage === i && !activeColorId;
            return (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => {
                  setActiveImage(i);
                  setActiveColorId(null);
                }}
                className={`aspect-square overflow-hidden rounded-md border transition-colors ${
                  selected
                    ? "border-primary-blue"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Available Patterns And Colors */}
      {colors.length > 0 ? (
        <section className="mt-12">
          <div className="flex flex-col items-center">
            <h2 className="text-center text-[21px] font-semibold tracking-tight text-foreground sm:text-[24px]">
              Patterns and colours
            </h2>
            <span className="mt-2 h-[3px] w-8 rounded-full bg-primary-blue" />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
            {colors.map((c) => {
              const selected = c.id === activeColorId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveColorId(selected ? null : c.id)}
                  className={`flex w-[76px] flex-col items-center gap-2 rounded-lg border p-2.5 transition-colors ${
                    selected
                      ? "border-primary-blue bg-light-gray"
                      : "border-border bg-background hover:border-foreground/25"
                  }`}
                >
                  <span
                    className="h-9 w-9 rounded-full border border-border shadow-inner"
                    style={{ backgroundColor: c.code }}
                  />
                  <span className="line-clamp-1 text-[11px] font-medium text-foreground/80">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Product details card */}
      <section className="mt-12 rounded-2xl border border-border px-6 py-7 sm:px-8">
        <dl className="divide-y divide-border">
          <DetailRow label="Name" value={brand.name} />
          <DetailRow
            label="Colour"
            value={activeColor ? activeColor.name : "All available"}
          />
          <DetailRow
            label="Size"
            value={brand.sizes.length > 0 ? brand.sizes.join(" , ") : "—"}
          />
        </dl>

        <div className="mt-5 border-t border-border pt-5">
          <p className="text-[13px] font-semibold text-foreground">
            Description
          </p>
          <p className="mt-1.5 text-sm leading-6 text-foreground/60">
            {brand.description}
          </p>
        </div>

        <a
          href={contactHref}
          className="mt-7 flex w-full items-center justify-center rounded-lg bg-foreground py-3.5 text-[13px] font-medium tracking-wide text-background transition-colors hover:bg-primary-blue"
        >
          Enquire about this piece
        </a>
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-x-3 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-[13px] text-foreground/50">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}