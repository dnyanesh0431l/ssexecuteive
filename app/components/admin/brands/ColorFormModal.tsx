// components/admin/brands/ColorFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { ImageUploader } from "../../../components/ui/ImageUploader";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { createColor, updateColor } from "../../../lib/firebase/brands";
import type { BrandColor } from "../../../lib/types";
import { cn, contrastText, isValidHex, normalizeHex } from "../../../lib/utils";

interface ColorFormModalProps {
  open: boolean;
  brandId: string;
  color?: BrandColor | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  name: string;
  code: string;
  image: string;
}

interface FormErrors {
  name?: string;
  code?: string;
}

export function ColorFormModal({
  open,
  brandId,
  color,
  onClose,
  onSaved,
}: ColorFormModalProps) {
  const isEdit = Boolean(color?.id);
  const [form, setForm] = useState<FormState>({
    name: "",
    code: "#000000",
    image: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      name: color?.name ?? "",
      code: color?.code ?? "#000000",
      image: color?.image ?? "",
    });
  }, [open, color]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Colour name is required.";
    if (!isValidHex(form.code))
      next.code = "Enter a valid hex value, e.g. #1845D6.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: normalizeHex(form.code),
        image: form.image,
      };
      if (isEdit && color) await updateColor(brandId, color.id, payload);
      else await createColor(brandId, payload);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const previewCode = isValidHex(form.code)
    ? normalizeHex(form.code)
    : "#000000";

  return (
    <Modal
      open={open}
      onClose={saving ? () => undefined : onClose}
      title={isEdit ? "Edit colour" : "Add colour"}
      description="Colours are stored inside this brand."
      size="lg"
      dismissible={!saving}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="color-form" loading={saving}>
            {isEdit ? "Save colour" : "Add colour"}
          </Button>
        </>
      }
    >
      <form id="color-form" onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Colour name"
            required
            placeholder="e.g. Navy Blue"
            value={form.name}
            error={errors.name}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value }));
              setErrors((p) => ({ ...p, name: undefined }));
            }}
          />

          <div className="w-full">
            <label
              htmlFor="color-code-text"
              className="mb-1.5 block text-[13px] font-medium text-black"
            >
              Colour code<span className="text-[#B80A0B]"> *</span>
            </label>
            <div className="flex items-stretch gap-2">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#E5E5E5]"
                style={{ backgroundColor: previewCode }}
              />
              <input
                id="color-code-text"
                value={form.code}
                onChange={(e) => {
                  setForm((p) => ({
                    ...p,
                    code: e.target.value.toUpperCase(),
                  }));
                  setErrors((p) => ({ ...p, code: undefined }));
                }}
                placeholder="#1845D6"
                className={cn(
                  "h-10 w-full rounded-md border bg-white px-3 text-sm uppercase text-black transition-colors",
                  "placeholder:normal-case placeholder:text-black/35 focus:outline-none focus:ring-2",
                  errors.code
                    ? "border-[#B80A0B] focus:border-[#B80A0B] focus:ring-[#B80A0B]/15"
                    : "border-[#E5E5E5] focus:border-[#1845D6] focus:ring-[#1845D6]/15",
                )}
              />
              <input
                type="color"
                aria-label="Pick colour"
                value={
                  isValidHex(form.code) ? normalizeHex(form.code) : "#000000"
                }
                onChange={(e) => {
                  setForm((p) => ({
                    ...p,
                    code: e.target.value.toUpperCase(),
                  }));
                  setErrors((p) => ({ ...p, code: undefined }));
                }}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-[#E5E5E5] bg-white p-1"
              />
            </div>
            {errors.code ? (
              <p className="mt-1.5 text-xs leading-5 text-[#B80A0B]">
                {errors.code}
              </p>
            ) : null}
          </div>
        </div>

        <ImageUploader
          label="Colour image"
          folder={`brands/${brandId}/colors`}
          value={form.image}
          hint="Shown on the product detail page for this colour."
          onChange={(url) => setForm((p) => ({ ...p, image: url }))}
        />

        <div
          className="flex items-center justify-between rounded-md border border-[#E5E5E5] px-4 py-3"
          style={{
            backgroundColor: previewCode,
            color: contrastText(previewCode),
          }}
        >
          <span className="text-[13px] font-medium">
            {form.name.trim() || "Colour preview"}
          </span>
          <span className="text-xs opacity-80">{previewCode}</span>
        </div>
      </form>
    </Modal>
  );
}
