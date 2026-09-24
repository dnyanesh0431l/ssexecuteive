// app/admin/categories/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "../../components/admin/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import {
  deleteCategory,
  swapCategoryOrder,
} from "../../lib/firebase/categories";
import { useCategories } from "../../lib/hooks/useCollectionData";
import type { Category } from "../../lib/types";
import { formatDate, truncate } from "../../lib/utils";

export default function CategoriesPage() {
  const toast = useToast();
  const { data: categories, loading, error } = useCategories();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
    );
  }, [categories, search]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(pendingDelete.id);
      toast.success("Category deleted", `${pendingDelete.name} has been removed.`);
      setPendingDelete(null);
    } catch {
      toast.error("Could not delete category", "Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = filtered[index + direction];
    const current = filtered[index];
    if (!target || !current) return;
    try {
      await swapCategoryOrder(current, target);
    } catch {
      toast.error("Could not reorder", "Please try again.");
    }
  };

  return (
    <>
      <PageHeader
        title="Categories"
        description="Top-level groups such as T-Shirts and Aprons. Each category holds its own brands."
        actions={
          <Link href="/admin/categories/new">
            <Button icon={<Plus className="h-4 w-4" />}>Add category</Button>
          </Link>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search categories"
        />
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Layers className="h-5 w-5" />}
            title={
              search ? "No categories match your search" : "No categories yet"
            }
            description={
              search
                ? "Try a different keyword."
                : "Create your first category, then add brands to it."
            }
            action={
              search ? (
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              ) : (
                <Link href="/admin/categories/new">
                  <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                    Add category
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-[#E5E5E5]">
            {filtered.map((category, index) => (
              <li
                key={category.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4 sm:flex-nowrap"
              >
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => void move(index, -1)}
                    className="rounded p-0.5 text-black/35 hover:text-black disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === filtered.length - 1}
                    onClick={() => void move(index, 1)}
                    className="rounded p-0.5 text-black/35 hover:text-black disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <span className="h-14 w-14 shrink-0 overflow-hidden rounded border border-[#E5E5E5] bg-[#F6F6F6]">
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </span>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="text-[13px] font-medium text-black hover:text-[#1845D6]"
                  >
                    {category.name}
                  </Link>
                  <p className="mt-0.5 font-mono text-[11px] text-black/40">
                    /{category.slug}
                  </p>
                  <p className="mt-1 max-w-md text-xs leading-5 text-black/50">
                    {truncate(category.description, 96)}
                  </p>
                </div>

                <span className="hidden shrink-0 rounded-full border border-[#E5E5E5] px-2.5 py-0.5 text-[11px] font-medium text-black sm:inline-flex">
                  {category.brandCount} brand
                  {category.brandCount === 1 ? "" : "s"}
                </span>

                <span className="hidden shrink-0 text-[12px] text-black/50 md:block">
                  {formatDate(category.createdAt)}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <Link href={`/admin/categories/${category.id}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Pencil className="h-3.5 w-3.5" />}
                    >
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[#B80A0B] hover:bg-[rgba(184,10,11,0.06)] hover:text-[#B80A0B]"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => setPendingDelete(category)}
                  >
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.name ?? "category"}?`}
        description="Brands inside this category will be detached (not deleted)."
        confirmLabel="Delete category"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}