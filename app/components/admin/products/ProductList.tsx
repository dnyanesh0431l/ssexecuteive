// components/admin/products/ProductList.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, Plus, Package, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";
import { deleteProduct } from "../../../lib/firebase/products";
import type { Product } from "../../../lib/types";

export function ProductList({
  brandId,
  products,
  loading,
}: {
  brandId: string;
  products: Product[];
  loading: boolean;
}) {
  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const brandProducts = useMemo(
    () => products.filter((p) => p.brandId === brandId),
    [products, brandId]
  );

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
    <section className="rounded-lg border border-[#E5E5E5] bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E5E5] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-black">
            Products
          </h2>
          <p className="mt-0.5 text-[13px] text-black/50">
            Each product has its own images, sizes and colours.
          </p>
        </div>
        <Link href={`/admin/products/new?brandId=${brandId}`}>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Add product
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-md border border-[#E5E5E5] p-3"
            >
              <Skeleton className="h-14 w-14 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : brandProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="No products yet"
          description="Add the first product to this brand."
          action={
            <Link href={`/admin/products/new?brandId=${brandId}`}>
              <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                Add product
              </Button>
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-[#E5E5E5]">
          {brandProducts.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center gap-4 px-5 py-4 sm:flex-nowrap"
            >
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[#E5E5E5] bg-[#F6F6F6]">
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
                  className="text-[13px] font-medium text-black hover:text-[#1845D6]"
                >
                  {product.name}
                </Link>
                <p className="mt-0.5 font-mono text-[11px] text-black/40">
                  /{product.slug}
                </p>
                <p className="mt-1 text-xs text-black/50">
                  {product.colorCount} colour
                  {product.colorCount === 1 ? "" : "s"} ·{" "}
                  {product.sizes.join(" · ") || "No sizes"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/admin/products/${product.id}`}>
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
                  onClick={() => setPendingDelete(product)}
                >
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.name ?? "product"}?`}
        description="This removes the product, all its colours and every uploaded image."
        confirmLabel="Delete product"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}