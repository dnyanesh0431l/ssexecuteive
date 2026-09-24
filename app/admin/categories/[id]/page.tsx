// app/admin/categories/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../../../components/admin/PageHeader";
import { CategoryForm } from "../../../components/admin/categories/CategoryForm";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ErrorState } from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";
import {
  deleteCategory,
  subscribeToCategory,
} from "../../../lib/firebase/categories";
import { deleteBrand } from "../../../lib/firebase/brands";
import { useBrands } from "../../../lib/hooks/useCollectionData";
import type { Brand, Category } from "../../../lib/types";
import { formatDate } from "../../../lib/utils";

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const categoryId = params?.id;
  const router = useRouter();
  const toast = useToast();

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingBrandDelete, setPendingBrandDelete] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState(false);

  const brandsState = useBrands();

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    const unsubscribe = subscribeToCategory(
      categoryId,
      (data) => {
        setCategory(data);
        setLoading(false);
        setError(data ? null : "This category no longer exists.");
      },
      () => {
        setError("Could not load this category.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [categoryId]);

  const categoryBrands = useMemo(
    () => brandsState.data.filter((b) => b.categoryId === categoryId),
    [brandsState.data, categoryId]
  );

  const confirmDelete = async () => {
    if (!categoryId || !category) return;
    setDeleting(true);
    try {
      await deleteCategory(categoryId);
      toast.success("Category deleted", `${category.name} has been removed.`);
      router.push("/admin/categories");
    } catch {
      toast.error("Could not delete category", "Please try again.");
      setDeleting(false);
    }
  };

  const confirmBrandDelete = async () => {
    if (!pendingBrandDelete) return;
    setDeletingBrand(true);
    try {
      await deleteBrand(pendingBrandDelete.id);
      toast.success("Brand deleted", `${pendingBrandDelete.name} has been removed.`);
      setPendingBrandDelete(null);
    } catch {
      toast.error("Could not delete brand", "Please try again.");
    } finally {
      setDeletingBrand(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="rounded-lg border border-[#E5E5E5] p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full sm:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <>
        <Link
          href="/admin/categories"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to categories
        </Link>
        <div className="rounded-lg border border-[#E5E5E5] bg-white">
          <ErrorState message={error ?? "Category not found."} />
        </div>
      </>
    );
  }

  return (
    <>
      <Link
        href="/admin/categories"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to categories
      </Link>

      <PageHeader
        title={category.name}
        description={`/${category.slug}`}
        actions={
          <Button
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => setConfirmOpen(true)}
          >
            Delete category
          </Button>
        }
      />

      <div className="space-y-6">
        <CategoryForm category={category} />

        <section className="rounded-lg border border-[#E5E5E5] bg-white">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E5E5] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-black">
                Brands in this category
              </h2>
              <p className="mt-0.5 text-[13px] text-black/50">
                Add, edit or remove the brands shown on this category page.
              </p>
            </div>
            <Link href={`/admin/brands/new?categoryId=${category.id}`}>
              <Button
                size="sm"
                variant="secondary"
                icon={<Plus className="h-3.5 w-3.5" />}
              >
                Add brand
              </Button>
            </Link>
          </div>

          {brandsState.loading ? (
            <div className="space-y-3 px-5 py-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-md border border-[#E5E5E5] p-3"
                >
                  <Skeleton className="h-14 w-14 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : brandsState.error ? (
            <ErrorState message={brandsState.error} />
          ) : categoryBrands.length === 0 ? (
            <EmptyState
              title="No brands yet"
              description="Add the first brand to this category."
              action={
                <Link href={`/admin/brands/new?categoryId=${category.id}`}>
                  <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                    Add brand
                  </Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-[#E5E5E5]">
              {categoryBrands.map((brand) => (
                <li
                  key={brand.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-4 sm:flex-nowrap"
                >
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded border border-[#E5E5E5] bg-[#F6F6F6]">
                    {brand.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/brands/${brand.id}`}
                      className="text-[13px] font-medium text-black hover:text-[#1845D6]"
                    >
                      {brand.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-[11px] text-black/40">
                      /{brand.slug}
                    </p>
                    <p className="mt-1 text-xs text-black/50">
                      {brand.colorCount} colour
                      {brand.colorCount === 1 ? "" : "s"} ·{" "}
                      {brand.sizes.join(" · ") || "No sizes"}
                    </p>
                  </div>
                  <span className="hidden shrink-0 text-[11px] text-black/40 md:block">
                    {formatDate(brand.createdAt)}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link href={`/admin/brands/${brand.id}`}>
                      <Button size="sm" variant="ghost">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#B80A0B] hover:bg-[rgba(184,10,11,0.06)] hover:text-[#B80A0B]"
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => setPendingBrandDelete(brand)}
                    >
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${category.name}?`}
        description="Brands inside this category will be detached (not deleted)."
        confirmLabel="Delete category"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={Boolean(pendingBrandDelete)}
        title={`Delete ${pendingBrandDelete?.name ?? "brand"}?`}
        description="This removes the brand, all of its colours and every uploaded image."
        confirmLabel="Delete brand"
        loading={deletingBrand}
        onCancel={() => setPendingBrandDelete(null)}
        onConfirm={confirmBrandDelete}
      />
    </>
  );
}