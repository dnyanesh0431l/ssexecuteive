// app/admin/brands/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { PageHeader } from "../../../components/admin/PageHeader";
import { BrandForm } from "../../../components/admin/brands/BrandForm";
import { ColorManager } from "../../../components/admin/brands/ColorManager";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { ErrorState } from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";
import { deleteBrand, subscribeToBrand } from "../../../lib/firebase/brands";
import { useRouter } from "next/navigation";
import type { Brand } from "../../../lib/types";

export default function EditBrandPage() {
  const params = useParams<{ id: string }>();
  const brandId = params?.id;
  const router = useRouter();
  const toast = useToast();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!brandId) return;
    setLoading(true);
    const unsubscribe = subscribeToBrand(
      brandId,
      (data) => {
        setBrand(data);
        setLoading(false);
        setError(data ? null : "This brand no longer exists.");
      },
      () => {
        setError("Could not load this brand.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [brandId]);

  const confirmDelete = async () => {
    if (!brandId || !brand) return;
    setDeleting(true);
    try {
      await deleteBrand(brandId);
      toast.success("Brand deleted", `${brand.name} has been removed.`);
      router.push("/admin/brands");
    } catch {
      toast.error("Could not delete brand", "Please try again.");
      setDeleting(false);
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
            <Skeleton className="h-56 w-full sm:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <>
        <Link
          href="/admin/brands"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to brands
        </Link>
        <div className="rounded-lg border border-[#E5E5E5] bg-white">
          <ErrorState message={error ?? "Brand not found."} />
        </div>
      </>
    );
  }

  return (
    <>
      <Link
        href="/admin/brands"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to brands
      </Link>

      <PageHeader
        title={brand.name}
        description={`/${brand.slug}`}
        actions={
          <Button
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => setConfirmOpen(true)}
          >
            Delete brand
          </Button>
        }
      />

      <div className="space-y-6">
        <BrandForm brand={brand} />
        <ColorManager brandId={brand.id} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${brand.name}?`}
        description="This removes the brand, all of its colours and every uploaded image."
        confirmLabel="Delete brand"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}