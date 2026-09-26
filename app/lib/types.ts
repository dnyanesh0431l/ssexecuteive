// lib/types.ts
export type ContactStatus = "new" | "contacted" | "closed";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  brandCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  bannerImages: string[];
  productCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brandId: string;
  categoryId: string;
  images: string[];
  sizes: string[];
  colorCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ProductColor {
  id: string;
  name: string;
  code: string;
  image: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
  order: number;
  active: boolean;
  createdAt: Date | null;
}

export interface GalleryImage {
  id: string;
  image: string;
  title: string;
  description: string;
  order: number;
  createdAt: Date | null;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatus;
  createdAt: Date | null;
}

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;

export const CONTACT_STATUSES: ContactStatus[] = ["new", "contacted", "closed"];

export const CONTACT_STATUS_LABEL: Record<ContactStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};
