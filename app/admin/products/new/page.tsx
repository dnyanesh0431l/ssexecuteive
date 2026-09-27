// app/admin/products/new/page.tsx
"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "../../../components/admin/PageHeader";
import { ProductForm } from "../../../components/admin/products/ProductForm";
import { ErrorState } from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useBrands } from "../../../lib/hooks/useCollectionData";

function NewProductInner() {
  const search = useSearchParams();
  const brandId = search.get("brandId") ?? "";
  const brandsState = useBrands();

  /* ---------- Loading ---------- */
  if (brandsState.loading) {
    return (
      <>
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="mb-6 h-8 w-56" />
        <div className="space-y-6">
          <div className="rounded-lg border border-[#E5E5E5] bg-white p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full sm:col-span-2" />
              <Skeleton className="h-56 w-full sm:col-span-2" />
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ---------- No brandId supplied ---------- */
  if (!brandId) {
    return (
      <>
        <Link
          href="/admin/brands"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to brands
        </Link>

        <PageHeader
          title="New product"
          description="Pick a brand first to add a product to it."
        />

        <div className="rounded-lg border border-[#E5E5E5] bg-white">
          <ErrorState message="Open a brand page and click 'Add product' to create a new product. Products always belong to a brand." />
        </div>
      </>
    );
  }

  /* ---------- Brand not found ---------- */
  const brand = brandsState.data.find((b) => b.id === brandId);
  if (!brand) {
    return (
      <>
        <Link
          href="/admin/brands"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to brands
        </Link>

        <PageHeader title="New product" />

        <div className="rounded-lg border border-[#E5E5E5] bg-white">
          <ErrorState message="This brand no longer exists. Please pick another brand." />
        </div>
      </>
    );
  }

  /* ---------- Ready ---------- */
  return (
    <>
      <Link
        href={`/admin/brands/${brand.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {brand.name}
      </Link>

      <PageHeader
        title="New product"
        description={`Add a product under ${brand.name}. You can add colours right after saving.`}
      />

      <ProductForm brand={brand} />
    </>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={null}>
      <NewProductInner />
    </Suspense>
  );
}