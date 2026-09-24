// app/admin/banners/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "../../components/admin/PageHeader";
import { BannerFormModal } from "../../components/admin/banners/BannerFormModal";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import {
  deleteBanner,
  swapBannerOrder,
  updateBanner,
} from "../../lib/firebase/banners";
import { useBanners } from "../../lib/hooks/useCollectionData";
import type { Banner } from "../../lib/types";
import { cn } from "../../lib/utils";

export default function BannersPage() {
  const toast = useToast();
  const { data: banners, loading, error } = useBanners();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = useMemo(
    () => [...banners].sort((a, b) => a.order - b.order),
    [banners]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteBanner(pendingDelete.id, pendingDelete.image);
      toast.success("Banner deleted", "The banner has been removed.");
      setPendingDelete(null);
    } catch {
      toast.error("Could not delete banner", "Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = sorted[index + direction];
    const current = sorted[index];
    if (!target || !current) return;
    try {
      await swapBannerOrder(current, target);
    } catch {
      toast.error("Could not reorder", "Please try again.");
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await updateBanner(banner.id, { active: !banner.active });
    } catch {
      toast.error("Could not update banner", "Please try again.");
    }
  };

  return (
    <>
      <PageHeader
        title="Banners"
        description="Hero images shown at the top of the public site."
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Add banner
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-4 px-5 py-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={<ImageIcon className="h-5 w-5" />}
            title="No banners yet"
            description="Add your first banner image to show on the homepage."
            action={
              <Button
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                Add banner
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-[#E5E5E5]">
            {sorted.map((banner, index) => (
              <li
                key={banner.id}
                className="flex flex-wrap items-start gap-4 px-5 py-4 sm:flex-nowrap"
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
                    disabled={index === sorted.length - 1}
                    onClick={() => void move(index, 1)}
                    className="rounded p-0.5 text-black/35 hover:text-black disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <span className="h-24 w-40 shrink-0 overflow-hidden rounded-md border border-[#E5E5E5] bg-[#F6F6F6]">
                  {banner.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={banner.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-black">
                      {banner.title || "Untitled banner"}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        banner.active
                          ? "border-[#1845D6]/25 bg-[rgba(24,69,214,0.07)] text-[#1845D6]"
                          : "border-[#E5E5E5] bg-white text-black/45"
                      )}
                    >
                      {banner.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  {banner.subtitle ? (
                    <p className="mt-1 max-w-md text-xs leading-5 text-black/55">
                      {banner.subtitle}
                    </p>
                  ) : null}
                  {banner.link ? (
                    <p className="mt-1 truncate font-mono text-[11px] text-black/45">
                      {banner.link}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={
                      banner.active ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )
                    }
                    onClick={() => void toggleActive(banner)}
                  >
                    <span className="hidden sm:inline">
                      {banner.active ? "Hide" : "Show"}
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Pencil className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setEditing(banner);
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
                    onClick={() => setPendingDelete(banner)}
                  >
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <BannerFormModal
        open={modalOpen}
        banner={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() =>
          toast.success(
            editing ? "Banner updated" : "Banner added",
            "Changes are live immediately."
          )
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this banner?"
        description="This will permanently remove the banner image."
        confirmLabel="Delete banner"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}