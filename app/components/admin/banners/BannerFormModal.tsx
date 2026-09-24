// components/admin/banners/BannerFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { ImageUploader } from "../../../components/ui/ImageUploader";
import { Input, Textarea } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { createBanner, updateBanner } from "../../../lib/firebase/banners";
import type { Banner } from "../../../lib/types";

interface BannerFormModalProps {
  open: boolean;
  banner?: Banner | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  image: string;
  title: string;
  subtitle: string;
  link: string;
  active: boolean;
}

interface FormErrors {
  image?: string;
}

export function BannerFormModal({
  open,
  banner,
  onClose,
  onSaved,
}: BannerFormModalProps) {
  const isEdit = Boolean(banner?.id);
  const [form, setForm] = useState<FormState>({
    image: "",
    title: "",
    subtitle: "",
    link: "",
    active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      image: banner?.image ?? "",
      title: banner?.title ?? "",
      subtitle: banner?.subtitle ?? "",
      link: banner?.link ?? "",
      active: banner?.active ?? true,
    });
  }, [open, banner]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FormErrors = {};
    if (!form.image) next.image = "Banner image is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        image: form.image,
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        link: form.link.trim(),
        active: form.active,
      };
      if (isEdit && banner) await updateBanner(banner.id, payload);
      else await createBanner(payload);
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
      title={isEdit ? "Edit banner" : "Add banner"}
      description="Banners appear in the hero section of the public site."
      size="lg"
      dismissible={!saving}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="banner-form" loading={saving}>
            {isEdit ? "Save banner" : "Add banner"}
          </Button>
        </>
      }
    >
      <form id="banner-form" onSubmit={onSubmit} className="space-y-5">
        <ImageUploader
          label="Banner image"
          required
          folder="banners"
          value={form.image}
          error={errors.image}
          hint="Recommended 1920×720px or larger."
          onChange={(url) => setForm((p) => ({ ...p, image: url }))}
        />
        <Input
          label="Title"
          placeholder="e.g. SS Executive Offer's"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
        <Textarea
          label="Subtitle"
          placeholder="Short supporting line shown under the title."
          value={form.subtitle}
          onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
        />
        <Input
          label="Link"
          placeholder="https://... or /brands/us-polo"
          value={form.link}
          hint="Where should this banner go when clicked?"
          onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
        />
        <label className="flex items-center gap-2 text-[13px] text-black">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
            className="h-4 w-4 rounded border-[#E5E5E5]"
          />
          Show this banner on the public site
        </label>
      </form>
    </Modal>
  );
}