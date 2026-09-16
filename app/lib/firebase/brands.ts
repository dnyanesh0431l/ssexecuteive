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
import { db } from "./config";
import { deleteImageByUrl } from "./storage";
import type { Brand, BrandColor } from "../types";

const brandsRef = () => collection(db, "brands");
const colorsRef = (brandId: string) => collection(db, "brands", brandId, "colors");

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const maybe = value as { toDate?: () => Date };
  return typeof maybe.toDate === "function" ? maybe.toDate() : null;
}

function mapBrand(id: string, data: DocumentData): Brand {
  return {
    id,
    name: data.name ?? "",
    description: data.description ?? "",
    image: data.image ?? "",
    slug: data.slug ?? "",
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
    availableSizes: Array.isArray(data.availableSizes) ? data.availableSizes : [],
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

/* ------------------------------------------------------------------ */
/* Brands                                                              */
/* ------------------------------------------------------------------ */

export function subscribeToBrands(
  onData: (brands: Brand[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(brandsRef(), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => mapBrand(d.id, d.data()))),
    (error) => onError?.(error)
  );
}

export function subscribeToBrand(
  brandId: string,
  onData: (brand: Brand | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, "brands", brandId),
    (snapshot) => onData(snapshot.exists() ? mapBrand(snapshot.id, snapshot.data()) : null),
    (error) => onError?.(error)
  );
}

export async function getBrand(brandId: string): Promise<Brand | null> {
  const snapshot = await getDoc(doc(db, "brands", brandId));
  return snapshot.exists() ? mapBrand(snapshot.id, snapshot.data()) : null;
}

export interface BrandInput {
  name: string;
  description: string;
  image: string;
  slug: string;
}

export async function createBrand(input: BrandInput): Promise<string> {
  const ref = await addDoc(brandsRef(), {
    ...input,
    colorCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBrand(brandId: string, input: Partial<BrandInput>): Promise<void> {
  await updateDoc(doc(db, "brands", brandId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a brand, every colour document in its subcollection, and the
 * associated Storage files. Firestore does not cascade-delete subcollections.
 */
export async function deleteBrand(brandId: string): Promise<void> {
  const imageUrls: string[] = [];

  const colorsSnapshot = await getDocs(colorsRef(brandId));
  if (!colorsSnapshot.empty) {
    const batch = writeBatch(db);
    colorsSnapshot.docs.forEach((colorDoc) => {
      const image = colorDoc.data().image;
      if (typeof image === "string" && image) imageUrls.push(image);
      batch.delete(colorDoc.ref);
    });
    await batch.commit();
  }

  const brandSnapshot = await getDoc(doc(db, "brands", brandId));
  if (brandSnapshot.exists()) {
    const image = brandSnapshot.data().image;
    if (typeof image === "string" && image) imageUrls.push(image);
  }

  await deleteDoc(doc(db, "brands", brandId));

  await Promise.all(imageUrls.map((url) => deleteImageByUrl(url)));
}

/* ------------------------------------------------------------------ */
/* Colors (brands/{brandId}/colors)                                    */
/* ------------------------------------------------------------------ */

export function subscribeToColors(
  brandId: string,
  onData: (colors: BrandColor[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(colorsRef(brandId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => mapColor(d.id, d.data()))),
    (error) => onError?.(error)
  );
}

export interface ColorInput {
  name: string;
  code: string;
  image: string;
  availableSizes: string[];
}

export async function createColor(brandId: string, input: ColorInput): Promise<string> {
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
  input: Partial<ColorInput>
): Promise<void> {
  await updateDoc(doc(db, "brands", brandId, "colors", colorId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "brands", brandId), { updatedAt: serverTimestamp() });
}

export async function deleteColor(brandId: string, colorId: string): Promise<void> {
  const colorRef = doc(db, "brands", brandId, "colors", colorId);
  const snapshot = await getDoc(colorRef);
  const image = snapshot.exists() ? snapshot.data().image : null;

  await deleteDoc(colorRef);
  await updateDoc(doc(db, "brands", brandId), {
    colorCount: increment(-1),
    updatedAt: serverTimestamp(),
  });

  if (typeof image === "string") await deleteImageByUrl(image);
}