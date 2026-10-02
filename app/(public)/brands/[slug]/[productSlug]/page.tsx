// app/(public)/brands/[slug]/[productSlug]/page.tsx
"use client";

import { ChevronLeft, ChevronRight, Phone, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { subscribeToProductColors } from "../../../../lib/firebase/products";
import {
  useBrands,
  useCategories,
  useProducts,
} from "../../../../lib/hooks/useCollectionData";
import type { ProductColor } from "../../../../lib/types";

/* ------------------------------------------------------------------ */
/* Contact constants                                                   */
/* ------------------------------------------------------------------ */
const WHATSAPP_NUMBER = "918087776060";
const WHATSAPP_DISPLAY = "+91 8087776060";
const EMAIL = "ss.executivecsn@gmail.com";

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
  const [copied, setCopied] = useState(false);

  /* ---------- Touch swipe tracking ---------- */
  const touchStartX = useRef<number | null>(null);

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
  }, [product?.id]);

  /* ---------- Slider ---------- */
  const imageCount = product?.images?.length ?? 0;

  const goNext = useCallback(() => {
    if (imageCount <= 1) return;
    setActiveImage((i) => (i + 1) % imageCount);
  }, [imageCount]);

  const goPrev = useCallback(() => {
    if (imageCount <= 1) return;
    setActiveImage((i) => (i - 1 + imageCount) % imageCount);
  }, [imageCount]);

  /* Keyboard arrows */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  /* Clamp index if images array changes */
  useEffect(() => {
    if (activeImage > imageCount - 1) setActiveImage(0);
  }, [imageCount, activeImage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const handleShare = async () => {
    if (!brand || !product) return;
    const url = window.location.href;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `${brand.name} — ${product.name}`,
          text: `Check out ${product.name} from ${brand.name}`,
          url,
        });
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
        <div className="grid gap-3 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6">
          <div className="aspect-square animate-pulse bg-[#F6F6F6]" />
          <div className="space-y-3">
            <div className="h-4 w-40 animate-pulse bg-[#F6F6F6]" />
            <div className="h-7 w-56 animate-pulse bg-[#F6F6F6]" />
            <div className="h-3 w-full animate-pulse bg-[#F6F6F6]" />
            <div className="h-3 w-3/4 animate-pulse bg-[#F6F6F6]" />
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

  /* ---------- Contact links ---------- */
  const colourList = colors.map((c) => c.name).join(", ");
  const sizeList = product.sizes.join(", ");

  const enquiryLine = `Hi SS Executive, I'm interested in ${brand.name} — ${product.name}.${
    colourList ? `\n\nAvailable colours: ${colourList}.` : ""
  }${sizeList ? `\nAvailable sizes: ${sizeList}.` : ""}\n\nPlease share pricing and availability.`;

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    enquiryLine,
  )}`;
  const callHref = `tel:+${WHATSAPP_NUMBER}`;
  const emailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(
    `Enquiry: ${brand.name} — ${product.name}`,
  )}&body=${encodeURIComponent(enquiryLine)}`;

  const images = product.images ?? [];

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-7xl px-0 sm:px-6">
        {/* ---------- Breadcrumb ---------- */}
        <nav className="hidden items-center gap-1 bg-white px-5 py-3 text-[12px] text-black/55 shadow-sm sm:flex">
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
        <section className="mt-3 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            {/* ============ LEFT — Product image slider ============ */}
            <div className="lg:sticky lg:top-24 lg:self-start lg:border-r lg:border-[#F0F0F0]">
              <div className="p-4 sm:p-5">
                <div className="relative">
                  {/* Slider viewport */}
                  <div
                    className="relative aspect-square overflow-hidden bg-white"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    {images.length > 0 ? (
                      <div
                        className="flex h-full w-full transition-transform duration-300 ease-out"
                        style={{
                          transform: `translateX(-${activeImage * 100}%)`,
                        }}
                      >
                        {images.map((url, i) => (
                          <div
                            key={`${url}-${i}`}
                            className="h-full w-full shrink-0"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={`${product.name} — view ${i + 1}`}
                              className="h-full w-full object-contain"
                              draggable={false}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#F6F6F6] text-[12px] uppercase tracking-widest text-black/35">
                        No image
                      </div>
                    )}

                    {/* Prev / Next arrows */}
                    {images.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={goPrev}
                          aria-label="Previous image"
                          className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/5 transition-colors hover:bg-[#F1F3F6] active:scale-95"
                        >
                          <ChevronLeft className="h-5 w-5 text-black/70" />
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          aria-label="Next image"
                          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/5 transition-colors hover:bg-[#F1F3F6] active:scale-95"
                        >
                          <ChevronRight className="h-5 w-5 text-black/70" />
                        </button>
                      </>
                    ) : null}

                    {/* Counter */}
                    {images.length > 1 ? (
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#1A2340]/70 px-2.5 py-1 text-[11px] font-semibold text-white">
                        {activeImage + 1} / {images.length}
                      </span>
                    ) : null}

                    {/* Share */}
                    <div className="absolute right-2 top-2 z-10">
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

                  {/* Dots */}
                  {images.length > 1 ? (
                    <div className="mt-3 flex items-center justify-center gap-1.5">
                      {images.map((url, i) => (
                        <button
                          key={`dot-${url}-${i}`}
                          type="button"
                          onClick={() => setActiveImage(i)}
                          aria-label={`Go to image ${i + 1}`}
                          className={
                            "h-1.5 rounded-full transition-all " +
                            (activeImage === i
                              ? "w-5 bg-[#1845D6]"
                              : "w-1.5 bg-black/20 hover:bg-black/40")
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* ============ RIGHT — Product info ============ */}
            <div className="border-t border-[#F0F0F0] p-5 sm:p-6 lg:border-t-0 lg:p-7">
              {/* Brand + title */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#1845D6]">
                {brand.name}
              </p>
              <h1 className="mt-1 text-xl font-medium text-[#1A2340] sm:text-2xl">
                {product.name}
              </h1>

              {/* ---------- Available Colours — inline display only ---------- */}
              {colors.length > 0 ? (
                <div className="mt-5">
                  <p className="text-[12px] font-bold uppercase tracking-widest text-black/55">
                    Available Colours
                  </p>
                  <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {colors.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center gap-2 text-[13px] font-medium text-[#1A2340]"
                      >
                        <span
                          className="h-5 w-5 shrink-0 rounded-full border border-black/15"
                          style={{ backgroundColor: c.code }}
                          aria-hidden
                        />
                        {c.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* ---------- Available Sizes — display only ---------- */}
              {product.sizes.length > 0 ? (
                <div className="mt-5">
                  <p className="text-[12px] font-bold uppercase tracking-widest text-black/55">
                    Available Sizes
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <li
                        key={size}
                        className="flex h-9 min-w-[48px] items-center justify-center border border-[#E5E5E5] bg-white px-3 text-[13px] font-semibold uppercase tracking-wide text-[#1A2340]"
                      >
                        {size}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* ---------- Description section ---------- */}
              {product.description ? (
                <section className="mt-3 bg-white shadow-sm">
                  <div className="px-5 py-5 sm:px-6 sm:py-6">
                    <p className="text-[13px] leading-7 text-black/75 sm:text-sm">
                      {product.description}
                    </p>
                  </div>
                </section>
              ) : null}

              {/* ---------- WhatsApp + Call CTAs ---------- */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] px-4 py-3 text-[13px] font-bold uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-[#1FBE5B]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-current"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={callHref}
                  className="flex items-center justify-center gap-2 bg-[#1845D6] px-4 py-3 text-[13px] font-bold uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-[#1438B3]"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              </div>

              <p className="mt-3 text-center text-[12px] text-black/55">
                Or reach us at{" "}
                <strong className="text-[#1A2340]">{WHATSAPP_DISPLAY}</strong>
              </p>

              <p className="mt-1 text-center text-[12px]">
                <a
                  href={emailHref}
                  className="font-medium text-[#1845D6] underline underline-offset-2"
                >
                  {EMAIL}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Available Colours — display-only cards ---------- */}
        {colors.length > 0 ? (
          <section className="mt-3 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] px-5 py-3.5 sm:px-6">
              <h2 className="text-[15px] font-bold uppercase tracking-tight text-[#1A2340] sm:text-[17px]">
                Available Colours
              </h2>
              <span className="text-[11px] font-medium uppercase tracking-widest text-black/45">
                {colors.length} {colors.length === 1 ? "option" : "options"}
              </span>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-[#F0F0F0] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {colors.map((c) => (
                <div key={c.id} className="flex flex-col p-4">
                  {/* Colour swatch only — no product images */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[#F6F6F6]">
                    <span
                      className="block h-full w-full"
                      style={{ backgroundColor: c.code }}
                    />
                  </div>

                  {/* Colour name + code */}
                  <p className="mt-3 line-clamp-1 text-[13px] font-medium text-[#1A2340]">
                    {c.name}
                  </p>
                  <span className="mt-0.5 font-mono text-[10px] uppercase text-black/40">
                    {c.code}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
