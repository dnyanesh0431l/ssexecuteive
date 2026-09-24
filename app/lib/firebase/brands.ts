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
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import type { Brand, BrandColor } from "../types";
import { incrementCategoryBrandCount } from "./categories";
import { db } from "./config";
import { deleteImageByUrl } from "./storage";

const brandsRef = () => collection(db, "brands");
const colorsRef = (brandId: string) =>
  collection(db, "brands", brandId, "colors");

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
    images: asStringArray(data.images),
    sizes: asStringArray(data.sizes),
    colorCount: typeof data.colorCount === "number" ? data.colorCount : 0,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapColor(id: string, data: DocumentData): BrandColor {
  return {
    id,
    name: data.name ?? "",
    code: data.code ?? "#000000",
    image: data.image ?? "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

/* --------------------------------------------------------------- */
/* Brands                                                           */
/* --------------------------------------------------------------- */

export function subscribeToBrands(
  onData: (brands: Brand[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(brandsRef(), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => mapBrand(d.id, d.data()))),
    (error) => onError?.(error),
  );
}

export function subscribeToBrand(
  brandId: string,
  onData: (brand: Brand | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, "brands", brandId),
    (snapshot) =>
      onData(snapshot.exists() ? mapBrand(snapshot.id, snapshot.data()) : null),
    (error) => onError?.(error),
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
  images: string[];
  sizes: string[];
}

export async function createBrand(input: BrandInput): Promise<string> {
  const ref = await addDoc(brandsRef(), {
    ...input,
    colorCount: 0,
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

  const colorsSnapshot = await getDocs(colorsRef(brandId));
  if (!colorsSnapshot.empty) {
    const batch = writeBatch(db);
    colorsSnapshot.docs.forEach((c) => {
      const image = c.data().image;
      if (typeof image === "string" && image) imageUrls.push(image);
      batch.delete(c.ref);
    });
    await batch.commit();
  }

  const brandSnap = await getDoc(doc(db, "brands", brandId));
  let prevCategory = "";
  if (brandSnap.exists()) {
    const data = brandSnap.data();
    if (Array.isArray(data.images)) {
      data.images.forEach((img: unknown) => {
        if (typeof img === "string" && img) imageUrls.push(img);
      });
    }
    prevCategory = typeof data.categoryId === "string" ? data.categoryId : "";
  }

  await deleteDoc(doc(db, "brands", brandId));
  if (prevCategory) await incrementCategoryBrandCount(prevCategory, -1);

  await Promise.all(imageUrls.map((url) => deleteImageByUrl(url)));
}

/* --------------------------------------------------------------- */
/* Colors (brands/{brandId}/colors)                                 */
/* --------------------------------------------------------------- */

export function subscribeToColors(
  brandId: string,
  onData: (colors: BrandColor[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(colorsRef(brandId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => mapColor(d.id, d.data()))),
    (error) => onError?.(error),
  );
}

export interface ColorInput {
  name: string;
  code: string;
  image: string;
}

export async function createColor(
  brandId: string,
  input: ColorInput,
): Promise<string> {
  const ref = await addDoc(colorsRef(brandId), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "brands", brandId), {
    colorCount: increment(1),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateColor(
  brandId: string,
  colorId: string,
  input: Partial<ColorInput>,
): Promise<void> {
  await updateDoc(doc(db, "brands", brandId, "colors", colorId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "brands", brandId), { updatedAt: serverTimestamp() });
}

export async function deleteColor(
  brandId: string,
  colorId: string,
): Promise<void> {
  const colorRef = doc(db, "brands", brandId, "colors", colorId);
  const snap = await getDoc(colorRef);
  const image = snap.exists() ? snap.data().image : null;

  await deleteDoc(colorRef);
  await updateDoc(doc(db, "brands", brandId), {
    colorCount: increment(-1),
    updatedAt: serverTimestamp(),
  });

  if (typeof image === "string") await deleteImageByUrl(image);
}
