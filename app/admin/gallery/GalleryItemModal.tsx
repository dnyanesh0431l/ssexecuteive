// components/admin/gallery/GalleryItemModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { Input, Textarea } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import {
  createGalleryImage,
  updateGalleryImage,
} from "../../lib/firebase/gallery";
import type { GalleryImage } from "../../lib/types";

interface GalleryItemModalProps {
  open: boolean;
  item?: GalleryImage | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  image: string;
  title: string;
  description: string;
}

export function GalleryItemModal({
  open,
  item,
  onClose,
  onSaved,
}: GalleryItemModalProps) {
  const isEdit = Boolean(item?.id);
  const [form, setForm] = useState<FormState>({
    image: "",
    title: "",
    description: "",
  });
  const [errors, setErrors] = useState<{ image?: string; title?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      image: item?.image ?? "",
      title: item?.title ?? "",
      description: item?.description ?? "",
    });
  }, [open, item]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: { image?: string; title?: string } = {};
    if (!form.image) nextErrors.image = "An image is required.";
    if (!form.title.trim()) nextErrors.title = "A title is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        image: form.image,
        title: form.title.trim(),
        description: form.description.trim(),
      };

      if (isEdit && item) {
        await updateGalleryImage(item.id, payload);
      } else {
        await createGalleryImage(payload);
      }

      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? () => undefined : onClose}
      title={isEdit ? "Edit gallery image" : "Add gallery image"}
      size="lg"
      dismissible={!saving}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="gallery-form" loading={saving}>
            {isEdit ? "Save changes" : "Add image"}
          </Button>
        </>
      }
    >
      <form id="gallery-form" onSubmit={onSubmit} className="space-y-5">
        <ImageUploader
          label="Image"
          required
          folder="gallery"
          value={form.image}
          error={errors.image}
          onChange={(url) => {
            setForm((prev) => ({ ...prev, image: url }));
            setErrors((prev) => ({ ...prev, image: undefined }));
          }}
        />
        <Input
          label="Title"
          required
          placeholder="e.g. Signature stitching detail"
          value={form.title}
          error={errors.title}
          onChange={(event) => {
            setForm((prev) => ({ ...prev, title: event.target.value }));
            setErrors((prev) => ({ ...prev, title: undefined }));
          }}
        />
        <Textarea
          label="Description"
          placeholder="Optional context for this image."
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
        />
      </form>
    </Modal>
  );
}
