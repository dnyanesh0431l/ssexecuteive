// components/admin/categories/CategoryForm.tsx
"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { ImageUploader } from "../../../components/ui/ImageUploader";
import { Input, Textarea } from "../../../components/ui/Input";
import { useToast } from "../../../components/ui/Toast";
import {
  createCategory,
  updateCategory,
} from "../../../lib/firebase/categories";
import type { Category } from "../../../lib/types";
import { slugify } from "../../../lib/utils";

interface CategoryFormProps {
  category?: Category | null;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  image: string;
}

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(category?.id);

  const [form, setForm] = useState<FormState>({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    image: category?.image ?? "",
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

  const validate = () => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Category name is required.";
    if (!form.slug.trim()) next.slug = "Slug is required.";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug))
      next.slug = "Use lowercase letters, numbers and hyphens only.";
    if (!form.description.trim()) next.description = "Description is required.";
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
        image: form.image,
      };
      if (isEdit && category) {
        await updateCategory(category.id, payload);
        toast.success("Category updated", `${payload.name} has been saved.`);
        router.refresh();
      } else {
        const id = await createCategory(payload);
        toast.success("Category created", "You can now add brands to it.");
        router.push(`/admin/categories/${id}`);
      }
    } catch {
      toast.error(
        isEdit ? "Could not update category" : "Could not create category"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader
          title="Category details"
          description="Top-level grouping such as T-Shirts or Aprons."
        />
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Category name"
            required
            placeholder="e.g. T-Shirts"
            value={form.name}
            error={errors.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          <Input
            label="Slug"
            required
            placeholder="t-shirts"
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
            placeholder="Short description shown on the category page."
            value={form.description}
            error={errors.description}
            onChange={(e) => setField("description", e.target.value)}
          />
          <div className="sm:col-span-2">
            <ImageUploader
              label="Category image"
              folder="categories"
              value={form.image}
              hint="Recommended 1600×1000px or larger."
              onChange={(url) => setField("image", url)}
            />
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/categories")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
          {isEdit ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  );
}