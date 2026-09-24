// app/admin/brands/page.tsx
"use client";

import { Pencil, Plus, Shirt, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "../../components/admin/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input, Select } from "../../components/ui/Input";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { deleteBrand } from "../../lib/firebase/brands";
import { useBrands, useCategories } from "../../lib/hooks/useCollectionData";
import type { Brand } from "../../lib/types";
import { formatDate, truncate } from "../../lib/utils";

export default function BrandsPage() {
  const toast = useToast();
  const { data: brands, loading, error } = useBrands();
  const categoriesState = useCategories();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categoriesState.data.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categoriesState.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return brands.filter((b) => {
      if (categoryFilter && b.categoryId !== categoryFilter) return false;
      if (!term) return true;
      return (
        b.name.toLowerCase().includes(term) ||
        b.slug.toLowerCase().includes(term) ||
        b.description.toLowerCase().includes(term)
      );
    });
  }, [brands, search, categoryFilter]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteBrand(pendingDelete.id);
      toast.success("Brand deleted", `${pendingDelete.name} has been removed.`);
      setPendingDelete(null);
    } catch {
      toast.error("Could not delete brand", "Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Brands"
        description="Every brand belongs to a category and holds its own colours."
        actions={
          <Link href="/admin/brands/new">
            <Button icon={<Plus className="h-4 w-4" />}>Add brand</Button>
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_240px]">
        <Input
          placeholder="Search brands…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search brands"
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categoriesState.data.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Shirt className="h-5 w-5" />}
            title={
              search || categoryFilter
                ? "No brands match your filters"
                : "No brands yet"
            }
            description={
              search || categoryFilter
                ? "Try a different keyword or category."
                : "Add your first brand to begin building the catalogue."
            }
            action={
              search || categoryFilter ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Link href="/admin/brands/new">
                  <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                    Add brand
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E5E5E5] bg-[#F6F6F6]">
                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
                      Brand
                    </th>
                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
                      Category
                    </th>
                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
                      Colours
                    </th>
                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
                      Sizes
                    </th>
                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
                      Created
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {filtered.map((brand) => (
                    <tr
                      key={brand.id}
                      className="transition-colors hover:bg-[#F6F6F6]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <span className="h-14 w-12 shrink-0 overflow-hidden rounded border border-[#E5E5E5] bg-[#F6F6F6]">
                            {brand.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={brand.images[0]}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </span>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/brands/${brand.id}`}
                              className="text-[13px] font-medium text-black hover:text-[#1845D6]"
                            >
                              {brand.name}
                            </Link>
                            <p className="mt-0.5 font-mono text-[11px] text-black/40">
                              /{brand.slug}
                            </p>
                            <p className="mt-1 max-w-md text-xs leading-5 text-black/50">
                              {truncate(brand.description, 96)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top text-[13px] text-black/70">
                        {categoryMap.get(brand.categoryId) ?? (
                          <span className="text-black/35">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span className="inline-flex items-center rounded-full border border-[#E5E5E5] bg-white px-2.5 py-0.5 text-[11px] font-medium text-black">
                          {brand.colorCount} colour
                          {brand.colorCount === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top text-[12px] text-black/60">
                        {brand.sizes.join(" · ") || "—"}
                      </td>
                      <td className="px-5 py-4 align-top text-[13px] text-black/60">
                        {formatDate(brand.createdAt)}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/brands/${brand.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<Pencil className="h-3.5 w-3.5" />}
                            >
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#B80A0B] hover:bg-[rgba(184,10,11,0.06)] hover:text-[#B80A0B]"
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={() => setPendingDelete(brand)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-[#E5E5E5] md:hidden">
              {filtered.map((brand) => (
                <li key={brand.id} className="px-4 py-4">
                  <div className="flex gap-3">
                    <span className="h-16 w-14 shrink-0 overflow-hidden rounded border border-[#E5E5E5] bg-[#F6F6F6]">
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
                        className="text-[13px] font-medium text-black"
                      >
                        {brand.name}
                      </Link>
                      <p className="mt-0.5 font-mono text-[11px] text-black/40">
                        /{brand.slug}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-black/50">
                        {truncate(brand.description, 80)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-black/45">
                        <span className="rounded-full border border-[#E5E5E5] px-2 py-0.5 text-black">
                          {brand.colorCount} colour
                          {brand.colorCount === 1 ? "" : "s"}
                        </span>
                        {categoryMap.get(brand.categoryId) ? (
                          <span>{categoryMap.get(brand.categoryId)}</span>
                        ) : null}
                        <span>{formatDate(brand.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link href={`/admin/brands/${brand.id}`} className="flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        icon={<Pencil className="h-3.5 w-3.5" />}
                      >
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setPendingDelete(brand)}
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.name ?? "brand"}?`}
        description="This removes the brand, all of its colours and every uploaded image."
        confirmLabel="Delete brand"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
