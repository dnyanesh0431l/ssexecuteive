// app/admin/categories/new/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "../../../components/admin/PageHeader";
import { CategoryForm } from "../../../components/admin/categories/CategoryForm";

export default function NewCategoryPage() {
  return (
    <>
      <Link
        href="/admin/categories"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to categories
      </Link>
      <PageHeader
        title="New category"
        description="Create the category first, then add brands to it."
      />
      <CategoryForm />
    </>
  );
}