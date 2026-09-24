// app/admin/brands/new/page.tsx
"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "../../../components/admin/PageHeader";
import { BrandForm } from "../../../components/admin/brands/BrandForm";
import { ErrorState } from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useCategories } from "../../../lib/hooks/useCollectionData";

function NewBrandInner() {
  const search = useSearchParams();
  const defaultCategoryId = search.get("categoryId") ?? undefined;
  const { data: categories, loading, error } = useCategories();

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
        description="Create the brand, then add colours to it."
      />

      {loading ? (
        <div className="rounded-lg border border-[#E5E5E5] p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full sm:col-span-2" />
            <Skeleton className="h-56 w-full sm:col-span-2" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white">
          <ErrorState message={error} />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white">
          <ErrorState message="Create a category first before adding a brand." />
        </div>
      ) : (
        <BrandForm
          categories={categories}
          defaultCategoryId={defaultCategoryId}
        />
      )}
    </>
  );
}

export default function NewBrandPage() {
  return (
    <Suspense fallback={null}>
      <NewBrandInner />
    </Suspense>
  );
}
