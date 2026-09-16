"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Factory,
  Layers,
  Mail,
  Palette,
  Ruler,
  Scissors,
  Shirt,
  Sparkles,
  Truck,
} from "lucide-react";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import {
  useBrands,
  useGallery,
} from "../lib/hooks/useCollectionData";
import { formatDate, truncate } from "../lib/utils";

const CAPABILITIES = [
  {
    icon: Scissors,
    title: "Cut & Sew",
    description:
      "In-house cutting and stitching with tight tolerance control across every panel and seam.",
  },
  {
    icon: Ruler,
    title: "Sampling & Fit",
    description:
      "Rapid prototyping, graded size sets and fit iterations before bulk production begins.",
  },
  {
    icon: Layers,
    title: "Private Label",
    description:
      "Woven labels, tags and packaging branded to your specifications — end to end.",
  },
  {
    icon: Factory,
    title: "Bulk Production",
    description:
      "Scalable runs from 200 to 20,000 pieces with consistent quality at every stage.",
  },
  {
    icon: Award,
    title: "Quality Control",
    description:
      "Multi-stage QC at cut, sew and finish — with pre-shipment inspection reports.",
  },
  {
    icon: Truck,
    title: "Global Logistics",
    description:
      "Consolidated shipping, documentation and dispatch to your warehouse or forwarder.",
  },
];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80";

export default function HomePage() {
  const brands = useBrands();
  const gallery = useGallery();

  const featured = brands.data.slice(0, 3);
  const galleryPreview = gallery.data.slice(0, 6);

  const totalColors = useMemo(
    () => brands.data.reduce((sum, brand) => sum + (brand.colorCount || 0), 0),
    [brands.data]
  );

  return (
    <div className="bg-white">
      <Header />

      {/* Hero */}
      <section className="border-b border-[#E5E5E5]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-24">
          <div className="lg:col-span-6 lg:pt-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-black/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B80A0B]" />
              Executive Apparel Manufacturing
            </div>

            <h1 className="mt-8 text-4xl font-semibold leading-[1.05] tracking-tight text-black sm:text-5xl lg:text-[56px]">
              Precision garments,
              <br />
              built for serious labels.
            </h1>

            <p className="mt-7 max-w-xl text-[15px] leading-7 text-black/60">
              SS Executive is a full-service apparel manufacturing partner.
              From pattern and sampling to bulk cut-and-sew, we deliver
              production-grade quality at scale — on time, every time.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/brands">
                <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                  Explore brands
                </Button>
              </Link>
              <Link href="/#contact">
                <Button size="lg" variant="outline">
                  Request a quote
                </Button>
              </Link>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-[#E5E5E5] pt-8">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
                  Brands
                </dt>
                <dd className="mt-2 text-2xl font-semibold tracking-tight text-black">
                  {brands.loading ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    brands.data.length
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
                  Colours
                </dt>
                <dd className="mt-2 text-2xl font-semibold tracking-tight text-black">
                  {brands.loading ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    totalColors
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
                  MOQ
                </dt>
                <dd className="mt-2 text-2xl font-semibold tracking-tight text-black">
                  200
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F6F6F6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HERO_IMAGE}
                  alt="SS Executive manufacturing studio"
                  className="aspect-[4/5] w-full object-cover lg:aspect-[5/6]"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 hidden max-w-[240px] rounded-lg border border-[#E5E5E5] bg-white p-5 sm:block">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#B80A0B]">
                  Since inception
                </p>
                <p className="mt-2 text-[13px] leading-6 text-black/65">
                  End-to-end apparel production for premium retail and
                  private-label partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <section className="border-b border-[#E5E5E5] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-6 sm:px-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/40">
            Trusted by emerging labels across retail & DTC
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[12px] font-medium uppercase tracking-[0.14em] text-black/60">
            <span>Retail</span>
            <span className="h-1 w-1 rounded-full bg-[#E5E5E5]" />
            <span>Private Label</span>
            <span className="h-1 w-1 rounded-full bg-[#E5E5E5]" />
            <span>DTC Brands</span>
            <span className="h-1 w-1 rounded-full bg-[#E5E5E5]" />
            <span>Uniforms</span>
          </div>
        </div>
      </section>

      {/* Featured brands */}
      <section className="border-b border-[#E5E5E5]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                Catalogue
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Featured brands
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-black/55">
                Each brand is a full style with its own colour range, size
                set and photography. Built once, produced repeatedly.
              </p>
            </div>
            <Link
              href="/brands"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
            >
              View all brands
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-12">
            {brands.loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
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
            ) : featured.length === 0 ? (
              <div className="rounded-lg border border-[#E5E5E5] bg-white">
                <EmptyState
                  icon={<Shirt className="h-5 w-5" />}
                  title="Brands will appear here"
                  description="Once the catalogue is populated, featured styles will show up in this section."
                />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((brand) => (
                  <Link
                    key={brand.id}
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
                        <h3 className="text-[15px] font-semibold tracking-tight text-black">
                          {brand.name}
                        </h3>
                        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-black/30 transition-colors group-hover:text-[#B80A0B]" />
                      </div>
                      <p className="mt-2 text-[13px] leading-6 text-black/55">
                        {truncate(brand.description, 110)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="scroll-mt-24 border-b border-[#E5E5E5] bg-[#F6F6F6]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
              Capabilities
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Full-stack apparel production.
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-black/55">
              From pattern development to finished garments, every stage is
              handled in-house or through vetted partner units.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#E5E5E5] sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="bg-white p-7">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F6F6F6] text-[#B80A0B]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-5 text-[14px] font-semibold tracking-tight text-black">
                    {cap.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-black/55">
                    {cap.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="scroll-mt-24 border-b border-[#E5E5E5]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
                Studio
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Inside the workshop
              </h2>
            </div>
          </div>

          <div className="mt-12">
            {gallery.loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
                ))}
              </div>
            ) : galleryPreview.length === 0 ? (
              <div className="rounded-lg border border-[#E5E5E5] bg-white">
                <EmptyState
                  icon={<Sparkles className="h-5 w-5" />}
                  title="Gallery coming soon"
                  description="Studio imagery will appear here once it's uploaded."
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryPreview.map((item, index) => (
                  <figure
                    key={item.id}
                    className={
                      "group relative overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F6F6F6] " +
                      (index === 0 ? "sm:col-span-2 sm:row-span-2" : "")
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className={
                        "w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] " +
                        (index === 0 ? "aspect-[4/3] sm:aspect-auto sm:h-full" : "aspect-[4/3]")
                      }
                    />
                    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-5 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-[13px] font-medium text-white">
                        {item.title}
                      </p>
                      {item.description ? (
                        <p className="mt-1 text-[12px] text-white/75">
                          {truncate(item.description, 80)}
                        </p>
                      ) : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="scroll-mt-24 bg-black">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-24">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B80A0B]">
              Get in touch
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Let's build your next production run.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-white/60">
              Share your style, quantities and timeline. We'll respond with
              sampling lead time, pricing and a production slot.
            </p>

            <ul className="mt-10 space-y-5 border-t border-white/10 pt-8">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                    Email
                  </p>
                  <a
                    href="mailto:hello@ssexecutive.com"
                    className="mt-1 block text-[13px] font-medium text-white hover:text-[#B80A0B]"
                  >
                    hello@ssexecutive.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Palette className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                    Enquiries
                  </p>
                  <p className="mt-1 text-[13px] text-white/75">
                    Quotes returned within 24–48 hours on business days.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Inline contact form — same Firestore `contactRequests` collection as admin */
/* -------------------------------------------------------------------------- */

import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase/config";
import { isValidEmail } from "../lib/utils";

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(form.email)) next.email = "Enter a valid email.";
    if (!form.message.trim()) next.message = "Please describe your enquiry.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    try {
      await addDoc(collection(db, "contactRequests"), {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        status: "new",
        createdAt: serverTimestamp(),
      });
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start gap-3 py-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#B80A0B]">
          <Sparkles className="h-4 w-4" />
        </span>
        <p className="text-[14px] font-medium text-white">
          Thanks — your enquiry has been received.
        </p>
        <p className="text-[13px] leading-6 text-white/55">
          We'll get back to you within 24–48 business hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 text-[12px] font-medium text-[#1845D6] hover:opacity-75"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <DarkField
          label="Name"
          required
          value={form.name}
          error={errors.name}
          onChange={(v) => setForm((p) => ({ ...p, name: v }))}
        />
        <DarkField
          label="Email"
          required
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(v) => setForm((p) => ({ ...p, email: v }))}
        />
      </div>
      <DarkField
        label="Phone (optional)"
        value={form.phone}
        onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
      />
      <DarkField
        label="Message"
        required
        textarea
        value={form.message}
        error={errors.message}
        onChange={(v) => setForm((p) => ({ ...p, message: v }))}
      />

      {status === "error" ? (
        <p className="rounded-md border border-[#B80A0B]/40 bg-[#B80A0B]/10 px-3 py-2 text-[12px] text-white">
          Could not send your enquiry. Please try again.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#B80A0B] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#9C0909] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}

function DarkField({
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
}) {
  const base =
    "w-full rounded-md border bg-white/[0.04] px-3 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-colors";
  const border = error
    ? "border-[#B80A0B] focus:border-[#B80A0B] focus:ring-[#B80A0B]/30"
    : "border-white/10 focus:border-white/30 focus:ring-white/10";

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
        {label}
        {required ? <span className="text-[#B80A0B]"> *</span> : null}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} ${border} min-h-[120px] resize-y py-2.5 leading-6`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} ${border} h-10`}
        />
      )}
      {error ? (
        <p className="mt-1.5 text-[11px] text-[#B80A0B]">{error}</p>
      ) : null}
    </div>
  );
}