// components/admin/brands/BrandForm.tsx
"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { ImageUploader } from "../../../components/ui/ImageUploader";
import { Input, Textarea } from "../../../components/ui/Input";
import { useToast } from "../../../components/ui/Toast";
import { createBrand, updateBrand } from "../../../lib/firebase/brands";
import type { Brand } from "../../../lib/types";
import { slugify } from "../../../lib/utils";

interface BrandFormProps {
  brand?: Brand | null;
}

interface FormState {
  name: string;
  description: string;
  image: string;
  slug: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  image?: string;
  slug?: string;
}

export function BrandForm({ brand }: BrandFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(brand?.id);

  const [form, setForm] = useState<FormState>({
    name: brand?.name ?? "",
    description: brand?.description ?? "",
    image: brand?.image ?? "",
    slug: brand?.slug ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Keep slug in sync with the name until the user edits it manually.
  useEffect(() => {
    if (slugTouched) return;
    setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
  }, [form.name, slugTouched]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!form.name.trim()) next.name = "Brand name is required.";
    else if (form.name.trim().length < 2) next.name = "Name is too short.";

    if (!form.description.trim()) next.description = "Description is required.";
    if (!form.slug.trim()) next.slug = "Slug is required.";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug))
      next.slug = "Use lowercase letters, numbers and hyphens only.";

    if (!form.image) next.image = "A brand image is required.";

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
        description: form.description.trim(),
        image: form.image,
        slug: form.slug.trim(),
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
      toast.error(
        isEdit ? "Could not update brand" : "Could not create brand",
        "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader
          title="Brand details"
          description="Core information shown across the SS Executive catalogue."
        />
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Brand name"
            required
            placeholder="e.g. Executive Oxford"
            value={form.name}
            error={errors.name}
            onChange={(event) => setField("name", event.target.value)}
          />
          <Input
            label="Slug"
            required
            placeholder="executive-oxford"
            value={form.slug}
            error={errors.slug}
            hint="Used in the public URL."
            onChange={(event) => {
              setSlugTouched(true);
              setField("slug", slugify(event.target.value));
            }}
          />
          <Textarea
            label="Description"
            required
            className="sm:col-span-2"
            placeholder="Short, production-quality description of the style."
            value={form.description}
            error={errors.description}
            onChange={(event) => setField("description", event.target.value)}
          />
          <div className="sm:col-span-2">
            <ImageUploader
              label="Brand image"
              required
              folder="brands"
              value={form.image}
              error={errors.image}
              hint="Recommended 1600×1000px or larger."
              onChange={(url) => setField("image", url)}
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
