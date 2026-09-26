// app/(public)/brands/[slug]/[productSlug]/page.tsx
"use client";

import {
  Check,
  ChevronRight,
  Phone,
  Share2,
  ShieldCheck,
  Truck,
} from "lucide-react";
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

/* ------------------------------------------------------------------ */
/* Contact constants — replace with the real numbers                  */
/* ------------------------------------------------------------------ */
const WHATSAPP_NUMBER = "919999999999"; // digits only, country code included
const WHATSAPP_DISPLAY = "+91 99999 99999"; // shown to the user
const EMAIL = "info@ssexecutive.com";

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

  const activeColor = colors.find((c) => c.id === activeColorId) ?? null;
  const displayImage =
    activeColor?.image ||
    product.images[activeImage] ||
    product.images[0] ||
    "";

  /* ---------- Contact links ---------- */
  const enquiryLine = `Hi SS Executive, I'm interested in ${brand.name} — ${product.name}${
    activeColor ? ` (Colour: ${activeColor.name})` : ""
  }${activeSize ? ` — Size ${activeSize}` : ""}. Please share pricing and availability.`;

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    enquiryLine,
  )}`;
  const callHref = `tel:+${WHATSAPP_NUMBER}`;
  const emailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(
    `Enquiry: ${brand.name} — ${product.name}`,
  )}&body=${encodeURIComponent(enquiryLine)}`;

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
            {/* ============ LEFT — Image gallery ============ */}
            <div className="lg:sticky lg:top-24 lg:self-start lg:border-r lg:border-[#F0F0F0]">
              <div className="flex flex-col-reverse gap-3 p-4 sm:flex-row sm:gap-4 sm:p-5">
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
                            "h-14 w-14 shrink-0 overflow-hidden border-2 transition-all sm:h-16 sm:w-16",
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
                  <div className="relative aspect-square overflow-hidden bg-white">
                    {displayImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={displayImage}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : null}
                  </div>

                  {/* Share */}
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
            <div className="border-t border-[#F0F0F0] p-5 sm:p-6 lg:border-t-0 lg:p-7">
              {/* Brand + title */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#1845D6]">
                {brand.name}
              </p>
              <h1 className="mt-1 text-xl font-medium text-[#1A2340] sm:text-2xl">
                {product.name}
              </h1>

              {/* ---------- Selected colour + size line ---------- */}
              {activeColor || activeSize ? (
                <p className="mt-3 text-[13px] text-black/60">
                  {activeColor ? (
                    <>
                      Colour:{" "}
                      <span className="font-medium text-[#1A2340]">
                        {activeColor.name}
                      </span>
                    </>
                  ) : null}
                  {activeColor && activeSize ? " · " : null}
                  {activeSize ? (
                    <>
                      Size:{" "}
                      <span className="font-medium text-[#1A2340]">
                        {activeSize}
                      </span>
                    </>
                  ) : null}
                </p>
              ) : null}

              {/* ---------- Size selector ---------- */}
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
                            "flex h-10 min-w-[52px] items-center justify-center border px-4 text-[13px] font-semibold uppercase tracking-wide transition-colors",
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

              {/* ---------- Compact trust line ---------- */}
              <ul className="mt-5 space-y-2 border-t border-[#F0F0F0] pt-4">
                <li className="flex items-center gap-2.5 text-[13px] text-[#1A2340]">
                  <Truck className="h-4 w-4 shrink-0 text-[#1845D6]" />
                  <span>Bulk orders welcome · Free shipping over 50 units</span>
                </li>
                <li className="flex items-center gap-2.5 text-[13px] text-[#1A2340]">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#1845D6]" />
                  <span>Quality guaranteed · 100% cotton, colourfast</span>
                </li>
              </ul>

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
                Or call / WhatsApp us directly at{" "}
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

              {/* ---------- Description ---------- */}
              {product.description ? (
                <div className="mt-5 border-t border-[#F0F0F0] pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-black/55">
                    Description
                  </p>
                  <p className="mt-2 text-[13px] leading-6 text-black/75">
                    {product.description}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* ---------- Available Colours — product-card grid ---------- */}
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
                    <div className="relative aspect-square w-full overflow-hidden bg-[#F6F6F6]">
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
