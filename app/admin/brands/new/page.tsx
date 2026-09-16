// app/admin/brands/new/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { PageHeader } from "../../../components/admin/PageHeader";
import { BrandForm } from "../../../components/admin/brands/BrandForm";

export default function NewBrandPage() {
  return (
    <>
      <Link
        href="/admin/brands"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to brands
      </Link>

      <PageHeader
        title="New brand"
        description="Create the brand record first. Colour variants are added on the next step."
      />

      <BrandForm />

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-[#E5E5E5] bg-[#F6F6F6] px-5 py-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1845D6]" />
        <p className="text-[13px] leading-6 text-black/60">
          Colours are stored in the{" "}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-black">
            brands/&#123;brandId&#125;/colors
          </code>{" "}
          subcollection. Once this brand is saved you will be taken to its page,
          where you can add colours, hex codes, images and available sizes.
        </p>
      </div>
    </>
  );
}