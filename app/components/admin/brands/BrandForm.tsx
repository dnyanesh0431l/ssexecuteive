// components/admin/brands/BrandForm.tsx
"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { Input, Select, Textarea } from "../../../components/ui/Input";
import { MultiImageUploader } from "../../../components/ui/MultiImageUploader";
import { useToast } from "../../../components/ui/Toast";
import { createBrand, updateBrand } from "../../../lib/firebase/brands";
import { SIZE_OPTIONS, type Brand, type Category } from "../../../lib/types";
import { cn, slugify } from "../../../lib/utils";

interface BrandFormProps {
  brand?: Brand | null;
  categories: Category[];
  defaultCategoryId?: string;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  images: string[];
  sizes: string[];
}

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  images?: string;
  sizes?: string;
}

export function BrandForm({
  brand,
  categories,
  defaultCategoryId,
}: BrandFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(brand?.id);

  const [form, setForm] = useState<FormState>({
    name: brand?.name ?? "",
    slug: brand?.slug ?? "",
    description: brand?.description ?? "",
    categoryId: brand?.categoryId ?? defaultCategoryId ?? "",
    images: brand?.images ?? [],
    sizes: brand?.sizes ?? [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slugTouched) return;
    setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
  }, [form.name, slugTouched]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
    setErrors((prev) => ({ ...prev, sizes: undefined }));
  };

  const validate = () => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Brand name is required.";
    if (!form.slug.trim()) next.slug = "Slug is required.";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug))
      next.slug = "Use lowercase letters, numbers and hyphens only.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (!form.categoryId) next.categoryId = "Please choose a category.";
    if (form.images.length === 0) next.images = "Add at least one image.";
    if (form.sizes.length === 0) next.sizes = "Choose at least one size.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        images: form.images,
        sizes: SIZE_OPTIONS.filter((s) => form.sizes.includes(s)),
      };
      if (isEdit && brand) {
        await updateBrand(brand.id, payload);
        toast.success("Brand updated", `${payload.name} has been saved.`);
        router.refresh();
      } else {
        const id = await createBrand(payload);
        toast.success(
          "Brand created",
          "You can now add colours to this brand.",
        );
        router.push(`/admin/brands/${id}`);
      }
    } catch {
      toast.error(isEdit ? "Could not update brand" : "Could not create brand");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader
          title="Brand details"
          description="A brand belongs to one category and holds its own colours."
        />
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Category"
            required
            value={form.categoryId}
            error={errors.categoryId}
            onChange={(e) => setField("categoryId", e.target.value)}
          >
            <option value="">Select a category…</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
          <Input
            label="Brand name"
            required
            placeholder="e.g. US-POLO"
            value={form.name}
            error={errors.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          <Input
            label="Slug"
            required
            placeholder="us-polo"
            value={form.slug}
            error={errors.slug}
            hint="Used in the public URL."
            onChange={(e) => {
              setSlugTouched(true);
              setField("slug", slugify(e.target.value));
            }}
          />
          <Textarea
            label="Description"
            required
            className="sm:col-span-2"
            placeholder="Short, production-quality description of the style."
            value={form.description}
            error={errors.description}
            onChange={(e) => setField("description", e.target.value)}
          />

          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium text-black">
              Available sizes<span className="text-[#B80A0B]"> *</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((size) => {
                const selected = form.sizes.includes(size);
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
            {errors.sizes ? (
              <p className="mt-1.5 text-xs leading-5 text-[#B80A0B]">
                {errors.sizes}
              </p>
            ) : (
              <p className="mt-2 text-xs text-black/45">
                {form.sizes.length > 0
                  ? form.sizes.join(", ")
                  : "No sizes selected yet."}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <MultiImageUploader
              label="Brand images"
              required
              folder={`brands/${brand?.id ?? "new"}`}
              value={form.images}
              error={errors.images}
              hint="Add one or more product images. The first image is used as the cover."
              onChange={(urls) => setField("images", urls)}
            />
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/brands")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={saving}
          icon={<Save className="h-4 w-4" />}
        >
          {isEdit ? "Save changes" : "Create brand"}
        </Button>
      </div>
    </form>
  );
}
