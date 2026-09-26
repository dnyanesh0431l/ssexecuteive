// components/admin/products/ProductColors.tsx
"use client";

import { Pencil, Plus, Shirt, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ErrorState } from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";
import {
  deleteProductColor,
  subscribeToProductColors,
} from "../../../lib/firebase/products";
import type { ProductColor } from "../../../lib/types";
import { ColorFormModal } from "./ColorFormModal";

export function ProductColors({ productId }: { productId: string }) {
  const toast = useToast();
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductColor | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductColor | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToProductColors(
      productId,
      (data) => {
        setColors(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Could not load colours for this product.");
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [productId]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteProductColor(productId, pendingDelete.id);
      toast.success(
        "Colour deleted",
        `${pendingDelete.name} has been removed.`,
      );
      setPendingDelete(null);
    } catch {
      toast.error("Could not delete colour", "Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="rounded-lg border border-[#E5E5E5] bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E5E5] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-black">
            Colours
          </h2>
          <p className="mt-0.5 text-[13px] text-black/50">
            Each colour has its own hex code and image.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add colour
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
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
      ) : error ? (
        <ErrorState message={error} />
      ) : colors.length === 0 ? (
        <EmptyState
          icon={<Shirt className="h-5 w-5" />}
          title="No colours yet"
          description="Add the first colour variant for this product."
          action={
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Add colour
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-[#E5E5E5]">
          {colors.map((color) => (
            <li
              key={color.id}
              className="flex flex-wrap items-center gap-4 px-5 py-4 sm:flex-nowrap"
            >
              <span
                className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[#E5E5E5] bg-[#F6F6F6]"
                aria-hidden
              >
                {color.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={color.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span
                    className="block h-full w-full"
                    style={{ backgroundColor: color.code }}
                  />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: color.code }}
                    aria-hidden
                  />
                  <p className="truncate text-[13px] font-medium text-black">
                    {color.name}
                  </p>
                  <span className="shrink-0 font-mono text-[11px] text-black/40">
                    {color.code}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Pencil className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setEditing(color);
                    setModalOpen(true);
                  }}
                >
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[#B80A0B] hover:bg-[rgba(184,10,11,0.06)] hover:text-[#B80A0B]"
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={() => setPendingDelete(color)}
                >
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ColorFormModal
        open={modalOpen}
        productId={productId}
        color={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() =>
          toast.success(
            editing ? "Colour updated" : "Colour added",
            "Changes are live immediately.",
          )
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.name ?? "colour"}?`}
        description="This will permanently remove the colour and its uploaded image."
        confirmLabel="Delete colour"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
