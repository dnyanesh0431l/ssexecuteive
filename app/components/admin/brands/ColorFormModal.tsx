// components/admin/brands/ColorFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { ImageUploader } from "../../../components/ui/ImageUploader";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { createColor, updateColor } from "../../../lib/firebase/brands";
import { SIZE_OPTIONS, type BrandColor } from "../../../lib/types";
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
  availableSizes: string[];
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
    availableSizes: [],
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
      availableSizes: color?.availableSizes ?? [],
    });
  }, [open, color]);

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      availableSizes: prev.availableSizes.includes(size)
        ? prev.availableSizes.filter((item) => item !== size)
        : [...prev.availableSizes, size],
    }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Colour name is required.";
    if (!isValidHex(form.code))
      nextErrors.code = "Enter a valid hex value, e.g. #1845D6.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: normalizeHex(form.code),
        image: form.image,
        availableSizes: SIZE_OPTIONS.filter((size) =>
          form.availableSizes.includes(size),
        ),
      };

      if (isEdit && color) {
        await updateColor(brandId, color.id, payload);
      } else {
        await createColor(brandId, payload);
      }

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
      description="Colours and their available sizes are stored inside this brand."
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
            onChange={(event) => {
              setForm((prev) => ({ ...prev, name: event.target.value }));
              setErrors((prev) => ({ ...prev, name: undefined }));
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
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    code: event.target.value.toUpperCase(),
                  }));
                  setErrors((prev) => ({ ...prev, code: undefined }));
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
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    code: event.target.value.toUpperCase(),
                  }));
                  setErrors((prev) => ({ ...prev, code: undefined }));
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

        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-black">
            Available sizes
          </span>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((size) => {
              const selected = form.availableSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  aria-pressed={selected}
                  className={cn(
                    "h-9 min-w-[52px] rounded-md border px-3 text-[13px] font-medium transition-colors",
                    selected
                      ? "border-[#1845D6] bg-[rgba(24,69,214,0.06)] text-[#1845D6]"
                      : "border-[#E5E5E5] bg-white text-black/60 hover:bg-[#F6F6F6]",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-black/45">
            {form.availableSizes.length > 0
              ? form.availableSizes.join(", ")
              : "No sizes selected yet."}
          </p>
        </div>

        <ImageUploader
          label="Colour image"
          folder={`brands/${brandId}/colors`}
          value={form.image}
          hint="Shown on the product detail page for this colour."
          onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
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
