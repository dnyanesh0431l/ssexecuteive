// app/admin/brands/[id]/page.tsx
"use client";

import { ArrowLeft, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "../../../components/admin/PageHeader";
import { BrandForm } from "../../../components/admin/brands/BrandForm";
import { ProductList } from "../../../components/admin/products/ProductList";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { ErrorState } from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";
import {
  deleteBrand,
  subscribeToBrand,
  updateBrand,
} from "../../../lib/firebase/brands";
import { uploadImage, validateImageFile } from "../../../lib/firebase/storage";
import {
  useCategories,
  useProducts,
} from "../../../lib/hooks/useCollectionData";
import type { Brand } from "../../../lib/types";

export default function EditBrandPage() {
  const params = useParams<{ id: string }>();
  const brandId = params?.id;
  const router = useRouter();
  const toast = useToast();

  const categoriesState = useCategories();
  const productsState = useProducts();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Main image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMain, setUploadingMain] = useState(false);

  useEffect(() => {
    if (!brandId) return;
    setLoading(true);
    const unsub = subscribeToBrand(
      brandId,
      (data) => {
        setBrand(data);
        setLoading(false);
        setError(data ? null : "This brand no longer exists.");
      },
      () => {
        setError("Could not load this brand.");
        setLoading(false);
      },
    );
    return () => unsub();
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

  /* ---------- Main image handlers ---------- */
  const handlePickMain = () => fileInputRef.current?.click();

  const handleMainChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file || !brandId) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error("Invalid image", validationError);
      return;
    }

    setUploadingMain(true);
    try {
      const url = await uploadImage(file, `brands/${brandId}`);
      await updateBrand(brandId, { mainImage: url });
      toast.success("Main image updated", "Brand main image has been saved.");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed", "Please try again.");
    } finally {
      setUploadingMain(false);
    }
  };

  const handleRemoveMain = async () => {
    if (!brandId || !brand?.mainImage) return;
    setUploadingMain(true);
    try {
      await updateBrand(brandId, { mainImage: "" });
      toast.success("Main image removed");
    } catch {
      toast.error("Could not remove image");
    } finally {
      setUploadingMain(false);
    }
  };

  if (loading || categoriesState.loading) {
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
        {/* ---------- Main image card ---------- */}
        <div className="rounded-lg border border-[#E5E5E5] bg-white p-5">
          <div className="mb-4">
            <h3 className="text-[14px] font-semibold text-[#1A2340]">
              Main Image
            </h3>
            <p className="mt-0.5 text-[12px] text-black/50">
              Thumbnail shown on brand listings. Recommended 800×800, max 5 MB.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Preview */}
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F6F6F6]">
              {brand.mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.mainImage}
                  alt={brand.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-black/30">
                  <ImagePlus className="h-8 w-8" />
                </div>
              )}

              {uploadingMain ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              ) : null}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleMainChange}
              />
              <Button
                type="button"
                onClick={handlePickMain}
                disabled={uploadingMain}
                icon={<ImagePlus className="h-4 w-4" />}
              >
                {brand.mainImage ? "Replace image" : "Upload image"}
              </Button>

              {brand.mainImage ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRemoveMain}
                  disabled={uploadingMain}
                  icon={<X className="h-4 w-4" />}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* ---------- Existing form ---------- */}
        <BrandForm brand={brand} categories={categoriesState.data} />

        <ProductList
          brandId={brand.id}
          products={productsState.data}
          loading={productsState.loading}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${brand.name}?`}
        description="This removes the brand, all its products, colours and every uploaded image."
        confirmLabel="Delete brand"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
