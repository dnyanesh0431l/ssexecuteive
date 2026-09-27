// app/admin/products/new/page.tsx
"use client";

import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PageHeader } from "../../../components/admin/PageHeader";
import { ProductForm } from "../../../components/admin/products/ProductForm";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { ErrorState } from "../../../components/ui/ErrorState";
import { Select } from "../../../components/ui/Input";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useBrands, useCategories } from "../../../lib/hooks/useCollectionData";

function NewProductInner() {
  const search = useSearchParams();
  const urlBrandId = search.get("brandId") ?? "";

  const brandsState = useBrands();
  const categoriesState = useCategories();

  /* Local state used only when no brand is provided in the URL */
  const [pickedCategoryId, setPickedCategoryId] = useState("");
  const [pickedBrandId, setPickedBrandId] = useState("");

  /* Brands filtered by the picked category (for the selector UI) */
  const brandsInPickedCategory = useMemo(
    () =>
      pickedCategoryId
        ? brandsState.data.filter((b) => b.categoryId === pickedCategoryId)
        : [],
    [brandsState.data, pickedCategoryId],
  );

  /* The brand we'll actually create the product under */
  const effectiveBrandId = urlBrandId || pickedBrandId;
  const brand = brandsState.data.find((b) => b.id === effectiveBrandId) ?? null;

  /* ---------- Loading ---------- */
  if (brandsState.loading || categoriesState.loading) {
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

  /* ---------- Brand provided in URL but missing ---------- */
  if (urlBrandId && !brand) {
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

  /* ---------- No brand in URL → show category + brand picker ---------- */
  if (!urlBrandId && !pickedBrandId) {
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
          description="Pick a category and a brand first, then fill in the product details."
        />

        <Card>
          <CardHeader
            title="Select category & brand"
            description="Products always belong to a brand, and brands belong to a category."
          />
          <CardBody className="grid gap-5 sm:grid-cols-2">
            {/* Category selector */}
            <Select
              label="Category"
              required
              value={pickedCategoryId}
              onChange={(e) => {
                setPickedCategoryId(e.target.value);
                setPickedBrandId(""); // reset brand when category changes
              }}
            >
              <option value="">Select a category…</option>
              {categoriesState.data.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>

            {/* Brand selector (disabled until a category is chosen) */}
            <Select
              label="Brand"
              required
              disabled={!pickedCategoryId}
              value={pickedBrandId}
              onChange={(e) => setPickedBrandId(e.target.value)}
              hint={
                !pickedCategoryId
                  ? "Choose a category first."
                  : brandsInPickedCategory.length === 0
                    ? "No brands in this category yet."
                    : undefined
              }
            >
              <option value="">Select a brand…</option>
              {brandsInPickedCategory.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </CardBody>
        </Card>

        {/* Empty-category guidance */}
        {pickedCategoryId && brandsInPickedCategory.length === 0 ? (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-[#E5E5E5] bg-[#F6F6F6] px-5 py-4">
            <Package className="mt-0.5 h-4 w-4 shrink-0 text-[#1845D6]" />
            <div className="flex-1">
              <p className="text-[13px] leading-6 text-black/70">
                This category has no brands yet. Create a brand under this
                category first, then come back to add a product.
              </p>
              <Link
                href={`/admin/brands/new?categoryId=${pickedCategoryId}`}
                className="mt-3 inline-block"
              >
                <Button size="sm" variant="secondary">
                  Add a brand to this category
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  /* ---------- Brand selected → show the product form ---------- */
  if (!brand) return null;

  const cameFromUrl = Boolean(urlBrandId);

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
        actions={
          !cameFromUrl ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPickedCategoryId("");
                setPickedBrandId("");
              }}
            >
              Change brand
            </Button>
          ) : null
        }
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
