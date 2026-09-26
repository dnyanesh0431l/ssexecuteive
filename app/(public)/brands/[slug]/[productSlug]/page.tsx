// app/(public)/brands/[slug]/[productSlug]/page.tsx
"use client";

import { Check, ChevronRight, Share2, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { subscribeToProductColors } from "../../../../lib/firebase/products";
import {
  useBrands,
  useCategories,
  useProducts,
} from "../../../../lib/hooks/useCollectionData";
import type { ProductColor } from "../../../../lib/types";
import { cn } from "../../../../lib/utils";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string; productSlug: string }>();
  const brandSlug = params?.slug;
  const productSlug = params?.productSlug;

  const brandsState = useBrands();
  const productsState = useProducts();
  const categoriesState = useCategories();

  const brand = useMemo(
    () => brandsState.data.find((b) => b.slug === brandSlug),
    [brandsState.data, brandSlug],
  );

  const product = useMemo(
    () => productsState.data.find((p) => p.slug === productSlug),
    [productsState.data, productSlug],
  );

  const category = useMemo(
    () => categoriesState.data.find((c) => c.id === product?.categoryId),
    [categoriesState.data, product?.categoryId],
  );

  const [colors, setColors] = useState<ProductColor[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [activeColorId, setActiveColorId] = useState<string | null>(null);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    const unsub = subscribeToProductColors(
      product.id,
      setColors,
      () => undefined,
    );
    return () => unsub();
  }, [product?.id]);

  useEffect(() => {
    setActiveImage(0);
    setActiveColorId(null);
    setActiveSize(null);
  }, [product?.id]);

  const handleShare = async () => {
    if (!brand || !product) return;
    const url = window.location.href;
    const shareData = {
      title: `${brand.name} — ${product.name}`,
      text: `Check out ${product.name} from ${brand.name}`,
      url,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled or clipboard blocked — fail silently */
    }
  };

  /* ---------- Loading ---------- */
  if (brandsState.loading || productsState.loading) {
    return (
      <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-6">
        <div className="grid gap-3 bg-white p-4 shadow-sm sm:grid-cols-2 sm:rounded sm:p-6">
          <div className="aspect-square animate-pulse rounded bg-[#F6F6F6]" />
          <div className="space-y-3">
            <div className="h-4 w-40 animate-pulse rounded bg-[#F6F6F6]" />
            <div className="h-7 w-56 animate-pulse rounded bg-[#F6F6F6]" />
            <div className="h-3 w-full animate-pulse rounded bg-[#F6F6F6]" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-[#F6F6F6]" />
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Not found ---------- */
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
    activeColor?.image ||
    product.images[activeImage] ||
    product.images[0] ||
    "";

  const contactHref = `mailto:info@ssexecutive.com?subject=${encodeURIComponent(
    `Enquiry: ${brand.name} — ${product.name}${
      activeColor ? ` (${activeColor.name})` : ""
    }${activeSize ? ` — Size ${activeSize}` : ""}`,
  )}`;

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-7xl px-0 sm:px-6">
        {/* ---------- Breadcrumb ---------- */}
        <nav className="hidden items-center gap-1 bg-white px-5 py-3 text-[12px] text-black/55 shadow-sm sm:flex sm:rounded">
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
          <Link
            href={`/brands/${brand.slug}`}
            className="transition-colors hover:text-[#1845D6]"
          >
            {brand.name}
          </Link>
          <ChevronRight className="h-3 w-3 text-black/30" />
          <span className="truncate font-medium text-black/80">
            {product.name}
          </span>
        </nav>

        {/* ---------- Main two-column card ---------- */}
        <section className="mt-3 bg-white shadow-sm sm:rounded">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            {/* ============ LEFT — Image gallery ============ */}
            <div className="lg:sticky lg:top-24 lg:self-start lg:border-r lg:border-[#F0F0F0]">
              <div className="flex flex-col-reverse gap-3 p-4 sm:flex-row sm:gap-4 sm:p-6">
                {/* Thumbnails */}
                {product.images.length > 1 ? (
                  <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
                    {product.images.map((url, i) => {
                      const selected = activeImage === i && !activeColorId;
                      return (
                        <button
                          key={`${url}-${i}`}
                          type="button"
                          onMouseEnter={() => {
                            setActiveImage(i);
                            setActiveColorId(null);
                          }}
                          onClick={() => {
                            setActiveImage(i);
                            setActiveColorId(null);
                          }}
                          className={cn(
                            "h-14 w-14 shrink-0 overflow-hidden rounded border-2 transition-all sm:h-16 sm:w-16",
                            selected
                              ? "border-[#1845D6]"
                              : "border-[#E5E5E5] hover:border-[#1845D6]/50",
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {/* Main image */}
                <div className="relative flex-1">
                  <div className="relative aspect-square overflow-hidden rounded bg-white">
                    {displayImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={displayImage}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : null}
                  </div>

                  {/* Share icon (works) */}
                  <div className="absolute right-2 top-2">
                    <button
                      type="button"
                      onClick={() => void handleShare()}
                      aria-label="Share"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-[#F1F3F6]"
                    >
                      <Share2 className="h-4 w-4 text-black/65" />
                    </button>
                    {copied ? (
                      <span className="absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-[#1A2340] px-2 py-1 text-[11px] font-medium text-white shadow-md">
                        Link copied
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* ============ RIGHT — Product info ============ */}
            <div className="border-t border-[#F0F0F0] p-5 sm:p-6 lg:border-t-0 lg:p-8">
              {/* Brand + title */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#1845D6]">
                {brand.name}
              </p>
              <h1 className="mt-1 text-xl font-medium text-[#1A2340] sm:text-2xl">
                {product.name}
              </h1>

              {/* Rating + Assured */}
              <div className="mt-3 flex items-center gap-3">
                 
                <span className="text-[12px] text-black/50">
                  Premium Quality
                </span>
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-[#F0F0F0]" />

              

              {/* Size selection */}
              {product.sizes.length > 0 ? (
                <div className="mt-5">
                  <div className="flex items-baseline gap-2">
                    <p className="text-[12px] font-bold uppercase tracking-widest text-black/55">
                      Size
                    </p>
                    <p className="text-[13px] font-medium text-[#1A2340]">
                      {activeSize ?? "Select a size"}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const selected = size === activeSize;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setActiveSize(selected ? null : size)}
                          className={cn(
                            "flex h-10 min-w-[52px] items-center justify-center rounded-full border px-4 text-[13px] font-semibold uppercase tracking-wide transition-colors",
                            selected
                              ? "border-[#1845D6] bg-[rgba(24,69,214,0.06)] text-[#1845D6]"
                              : "border-[#E5E5E5] bg-white text-[#1A2340] hover:border-black/30",
                          )}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Divider */}
              <div className="my-6 border-t border-[#F0F0F0]" />

              {/* Features */}
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-[13px] text-[#1A2340]">
                  <Truck className="h-4 w-4 shrink-0 text-[#1845D6]" />
                  <span>Bulk orders welcome · Free shipping over 50 units</span>
                </li>
                <li className="flex items-center gap-3 text-[13px] text-[#1A2340]">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#1845D6]" />
                  <span>Quality guaranteed · 100% cotton, colourfast</span>
                </li>
              </ul>

              {/* Contact Now button — main CTA */}
              <div className="mt-6">
                <a
                  href={contactHref}
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#B80A0B] px-6 py-3.5 text-[14px] font-bold uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-[#9C0909]"
                >
                  Contact Now
                </a>
                <p className="mt-3 text-center text-[11px] text-black/45">
                  We&apos;ll respond within 24 hours · info@ssexecutive.com
                </p>
              </div>

              {/* Details */}
              <div className="mt-6 rounded border border-[#F0F0F0] bg-[#FAFAFB] p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-black/55">
                  Product Details
                </p>
                <dl className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-2 text-[13px]">
                  <dt className="text-black/55">Name</dt>
                  <dd className="font-medium text-[#1A2340]">{product.name}</dd>

                  <dt className="text-black/55">Brand</dt>
                  <dd className="font-medium text-[#1A2340]">{brand.name}</dd>

                  <dt className="text-black/55">Colour</dt>
                  <dd className="font-medium text-[#1A2340]">
                    {activeColor ? activeColor.name : "All available"}
                  </dd>

                  <dt className="text-black/55">Sizes</dt>
                  <dd className="font-medium text-[#1A2340]">
                    {product.sizes.join(" , ") || "—"}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Description card ---------- */}
        <section className="mt-3 bg-white shadow-sm sm:rounded">
          <div className="border-b border-[#F0F0F0] px-5 py-3.5 sm:px-6">
            <h2 className="text-[15px] font-bold uppercase tracking-tight text-[#1A2340] sm:text-[17px]">
              Description
            </h2>
          </div>
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-[13px] leading-7 text-black/75 sm:text-sm">
              {product.description}
            </p>
          </div>
        </section>

        {/* ---------- Available Colours — product-card grid ---------- */}
        {colors.length > 0 ? (
          <section className="mt-3 bg-white shadow-sm sm:rounded">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] px-5 py-3.5 sm:px-6">
              <h2 className="text-[15px] font-bold uppercase tracking-tight text-[#1A2340] sm:text-[17px]">
                Available Colours
              </h2>
              <span className="text-[11px] font-medium uppercase tracking-widest text-black/45">
                {colors.length} {colors.length === 1 ? "option" : "options"}
              </span>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-[#F0F0F0] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {colors.map((c) => {
                const selected = c.id === activeColorId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveColorId(selected ? null : c.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={cn(
                      "group relative flex flex-col p-4 text-left transition-colors",
                      selected ? "bg-[#F8F9FB]" : "hover:bg-[#F8F9FB]",
                    )}
                  >
                    {/* Selected tick */}
                    {selected ? (
                      <span className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#1845D6] text-white shadow-md">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    ) : null}

                    {/* Colour swatch card */}
                    <div className="relative aspect-square w-full overflow-hidden rounded bg-[#F6F6F6]">
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.image}
                          alt={c.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span
                          className="block h-full w-full"
                          style={{ backgroundColor: c.code }}
                        />
                      )}
                    </div>

                    {/* Colour name + code */}
                    <p
                      className={cn(
                        "mt-3 line-clamp-1 text-[13px] font-medium",
                        selected
                          ? "text-[#1845D6]"
                          : "text-[#1A2340] group-hover:text-[#1845D6]",
                      )}
                    >
                      {c.name}
                    </p>
                    <span className="mt-0.5 font-mono text-[10px] uppercase text-black/40">
                      {c.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
