// app/admin/products/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { PageHeader } from "../../../components/admin/PageHeader";
import { ProductForm } from "../../../components/admin/products/ProductForm";
import { ProductColors } from "../../../components/admin/products/ProductColors";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { ErrorState } from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";
import {
  deleteProduct,
  subscribeToProduct,
} from "../../../lib/firebase/products";
import { useBrands } from "../../../lib/hooks/useCollectionData";
import type { Product } from "../../../lib/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = params?.id;
  const router = useRouter();
  const toast = useToast();
  const brandsState = useBrands();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    const unsub = subscribeToProduct(
      productId,
      (data) => {
        setProduct(data);
        setLoading(false);
        setError(data ? null : "This product no longer exists.");
      },
      () => {
        setError("Could not load this product.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [productId]);

  const brand = product
    ? brandsState.data.find((b) => b.id === product.brandId)
    : null;

  const confirmDelete = async () => {
    if (!productId || !product) return;
    setDeleting(true);
    try {
      await deleteProduct(productId);
      toast.success("Product deleted", `${product.name} has been removed.`);
      router.push(brand ? `/admin/brands/${brand.id}` : "/admin/products");
    } catch {
      toast.error("Could not delete product", "Please try again.");
      setDeleting(false);
    }
  };

  if (loading || brandsState.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="rounded-lg border border-[#E5E5E5] p-5">
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product || !brand) {
    return (
      <>
        <Link
          href="/admin/products"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to products
        </Link>
        <div className="rounded-lg border border-[#E5E5E5] bg-white">
          <ErrorState message={error ?? "Product not found."} />
        </div>
      </>
    );
  }

  return (
    <>
      <Link
        href={`/admin/brands/${brand.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {brand.name}
      </Link>

      <PageHeader
        title={product.name}
        description={`${brand.name} · /${product.slug}`}
        actions={
          <Button
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => setConfirmOpen(true)}
          >
            Delete product
          </Button>
        }
      />

      <div className="space-y-6">
        <ProductForm product={product} brand={brand} />
        <ProductColors productId={product.id} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${product.name}?`}
        description="This removes the product, all its colours and every uploaded image."
        confirmLabel="Delete product"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}