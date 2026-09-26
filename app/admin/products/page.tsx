// app/admin/products/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/admin/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input, Select } from "../../components/ui/Input";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { deleteProduct } from "../../lib/firebase/products";
import {
  useBrands,
  useCategories,
  useProducts,
} from "../../lib/hooks/useCollectionData";
import type { Product } from "../../lib/types";
import { formatDate, truncate } from "../../lib/utils";

export default function ProductsPage() {
  const toast = useToast();
  const productsState = useProducts();
  const brandsState = useBrands();
  const categoriesState = useCategories();

  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const brandMap = useMemo(() => {
    const m = new Map<string, string>();
    brandsState.data.forEach((b) => m.set(b.id, b.name));
    return m;
  }, [brandsState.data]);

  const categoryMap = useMemo(() => {
    const m = new Map<string, string>();
    categoriesState.data.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categoriesState.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return productsState.data.filter((p) => {
      if (brandFilter && p.brandId !== brandFilter) return false;
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    });
  }, [productsState.data, search, brandFilter, categoryFilter]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(pendingDelete.id);
      toast.success("Product deleted", `${pendingDelete.name} has been removed.`);
      setPendingDelete(null);
    } catch {
      toast.error("Could not delete product", "Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="Every product belongs to a brand and holds its own colours."
        actions={
          <Link href="/admin/products/new">
            <Button icon={<Plus className="h-4 w-4" />}>Add product</Button>
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
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
        <Select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          aria-label="Filter by brand"
        >
          <option value="">All brands</option>
          {brandsState.data.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      <Card className="overflow-hidden">
        {productsState.loading ? (
          <TableSkeleton rows={5} />
        ) : productsState.error ? (
          <ErrorState message={productsState.error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Package className="h-5 w-5" />}
            title={
              search || brandFilter || categoryFilter
                ? "No products match your filters"
                : "No products yet"
            }
            description={
              search || brandFilter || categoryFilter
                ? "Try a different keyword or filter."
                : "Add your first product to begin building the catalogue."
            }
            action={
              search || brandFilter || categoryFilter ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setBrandFilter("");
                    setCategoryFilter("");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Link href="/admin/products/new">
                  <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                    Add product
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
                      Product
                    </th>
                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
                      Category
                    </th>
                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
                      Brand
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
                  {filtered.map((product) => (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-[#F6F6F6]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <span className="h-12 w-12 shrink-0 overflow-hidden rounded border border-[#E5E5E5] bg-[#F6F6F6]">
                            {product.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.images[0]}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </span>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="text-[13px] font-medium text-black hover:text-[#1845D6]"
                            >
                              {product.name}
                            </Link>
                            <p className="mt-0.5 font-mono text-[11px] text-black/40">
                              /{product.slug}
                            </p>
                            <p className="mt-1 max-w-md text-xs leading-5 text-black/50">
                              {truncate(product.description, 72)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top text-[12px] text-black/60">
                        {categoryMap.get(product.categoryId) ?? "—"}
                      </td>
                      <td className="px-5 py-4 align-top text-[12px] text-black/60">
                        {brandMap.get(product.brandId) ?? "—"}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span className="inline-flex items-center rounded-full border border-[#E5E5E5] bg-white px-2.5 py-0.5 text-[11px] font-medium text-black">
                          {product.colorCount}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top text-[12px] text-black/60">
                        {product.sizes.join(" · ") || "—"}
                      </td>
                      <td className="px-5 py-4 align-top text-[12px] text-black/60">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/products/${product.id}`}>
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
                            onClick={() => setPendingDelete(product)}
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
              {filtered.map((product) => (
                <li key={product.id} className="px-4 py-4">
                  <div className="flex gap-3">
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded border border-[#E5E5E5] bg-[#F6F6F6]">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-[13px] font-medium text-black"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-black/50">
                        {brandMap.get(product.brandId) ?? "—"} ·{" "}
                        {categoryMap.get(product.categoryId) ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link href={`/admin/products/${product.id}`} className="flex-1">
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
                      onClick={() => setPendingDelete(product)}
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
        title={`Delete ${pendingDelete?.name ?? "product"}?`}
        description="This removes the product, all its colours and every uploaded image."
        confirmLabel="Delete product"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}