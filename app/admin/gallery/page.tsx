// app/admin/gallery/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Images,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "../../components/admin/PageHeader";
import { GalleryItemModal } from "./GalleryItemModal";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import {
  deleteGalleryImage,
  subscribeToGallery,
  swapGalleryOrder,
} from "../../lib/firebase/gallery";
import type { GalleryImage } from "../../lib/types";
import { formatDate, truncate } from "../../lib/utils";

export default function GalleryPage() {
  const toast = useToast();
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToGallery(
      (data) => {
        setItems(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Could not load gallery images.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length || reordering) return;

    setReordering(true);
    try {
      await swapGalleryOrder(items[index], items[target]);
    } catch {
      toast.error("Could not reorder images", "Please try again.");
    } finally {
      setReordering(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteGalleryImage(pendingDelete.id, pendingDelete.image);
      toast.success("Image deleted", "The gallery has been updated.");
      setPendingDelete(null);
    } catch {
      toast.error("Could not delete image", "Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Manage the imagery shown across the SS Executive website."
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Upload image
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-[#E5E5E5]"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white">
          <ErrorState message={error} />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white">
          <EmptyState
            icon={<Images className="h-5 w-5" />}
            title="Gallery is empty"
            description="Upload your first image to start building the visual catalogue."
            action={
              <Button
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                Upload image
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-[#E5E5E5] bg-white"
            >
              <div className="relative aspect-[4/3] bg-[#F6F6F6]">
                {/* eslint-disable-next-line ../..next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full border border-[#E5E5E5] bg-white px-2 py-0.5 text-[11px] font-medium text-black">
                  #{index + 1}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="text-[13px] font-medium text-black">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-1 text-xs leading-5 text-black/50">
                    {truncate(item.description, 90)}
                  </p>
                ) : null}
                <p className="mt-2 text-[11px] text-black/40">
                  {formatDate(item.createdAt)}
                </p>

                <div className="mt-4 flex items-center gap-1 border-t border-[#E5E5E5] pt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Move up"
                    disabled={index === 0 || reordering}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Move down"
                    disabled={index === items.length - 1 || reordering}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <span className="flex-1" />
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Edit ${item.title}`}
                    icon={<Pencil className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setEditing(item);
                      setModalOpen(true);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${item.title}`}
                    className="text-[#B80A0B] hover:bg-[rgba(184,10,11,0.06)] hover:text-[#B80A0B]"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => setPendingDelete(item)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <GalleryItemModal
        open={modalOpen}
        item={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() =>
          toast.success(
            editing ? "Image updated" : "Image added",
            "Changes are live immediately."
          )
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete "${pendingDelete?.title ?? "image"}"?`}
        description="The image and its uploaded file will be permanently removed."
        confirmLabel="Delete image"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}