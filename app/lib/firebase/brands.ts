// lib/firebase/brands.ts
"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import type { Brand } from "../types";
import { incrementCategoryBrandCount } from "./categories";
import { db } from "./config";
import { deleteProduct } from "./products";
import { deleteImageByUrl } from "./storage";

const brandsRef = () => collection(db, "brands");

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const maybe = value as { toDate?: () => Date };
  return typeof maybe.toDate === "function" ? maybe.toDate() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
}

function mapBrand(id: string, data: DocumentData): Brand {
  return {
    id,
    name: data.name ?? "",
    slug: data.slug ?? "",
    description: data.description ?? "",
    categoryId: data.categoryId ?? "",
    bannerImages: asStringArray(data.bannerImages),
    productCount: typeof data.productCount === "number" ? data.productCount : 0,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function subscribeToBrands(
  onData: (brands: Brand[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(brandsRef(), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => mapBrand(d.id, d.data()))),
    (err) => onError?.(err),
  );
}

export function subscribeToBrand(
  brandId: string,
  onData: (brand: Brand | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, "brands", brandId),
    (snap) => onData(snap.exists() ? mapBrand(snap.id, snap.data()) : null),
    (err) => onError?.(err),
  );
}

export async function getBrand(brandId: string): Promise<Brand | null> {
  const snap = await getDoc(doc(db, "brands", brandId));
  return snap.exists() ? mapBrand(snap.id, snap.data()) : null;
}

export interface BrandInput {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  bannerImages: string[];
}

export async function createBrand(input: BrandInput): Promise<string> {
  const ref = await addDoc(brandsRef(), {
    ...input,
    productCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  if (input.categoryId) await incrementCategoryBrandCount(input.categoryId, 1);
  return ref.id;
}

export async function updateBrand(
  brandId: string,
  input: Partial<BrandInput>,
): Promise<void> {
  const before = await getDoc(doc(db, "brands", brandId));
  const prevCategory = before.exists()
    ? ((before.data().categoryId as string) ?? "")
    : "";

  await updateDoc(doc(db, "brands", brandId), {
    ...input,
    updatedAt: serverTimestamp(),
  });

  if (
    typeof input.categoryId === "string" &&
    input.categoryId !== prevCategory
  ) {
    if (prevCategory) await incrementCategoryBrandCount(prevCategory, -1);
    if (input.categoryId)
      await incrementCategoryBrandCount(input.categoryId, 1);
  }
}

export async function deleteBrand(brandId: string): Promise<void> {
  const imageUrls: string[] = [];

  // Cascade delete products
  const productsSnap = await getDocs(collection(db, "products"));
  const productDocs = productsSnap.docs.filter(
    (d) => d.data().brandId === brandId,
  );
  for (const p of productDocs) {
    await deleteProduct(p.id);
  }

  const snap = await getDoc(doc(db, "brands", brandId));
  let prevCategory = "";
  if (snap.exists()) {
    const data = snap.data();
    if (Array.isArray(data.bannerImages)) {
      data.bannerImages.forEach((img: unknown) => {
        if (typeof img === "string" && img) imageUrls.push(img);
      });
    }
    prevCategory = typeof data.categoryId === "string" ? data.categoryId : "";
  }

  await deleteDoc(doc(db, "brands", brandId));
  if (prevCategory) await incrementCategoryBrandCount(prevCategory, -1);

  await Promise.all(imageUrls.map((url) => deleteImageByUrl(url)));
}

export async function incrementBrandProductCount(
  brandId: string,
  delta: number,
): Promise<void> {
  if (!brandId) return;
  await updateDoc(doc(db, "brands", brandId), {
    productCount: increment(delta),
    updatedAt: serverTimestamp(),
  });
}
