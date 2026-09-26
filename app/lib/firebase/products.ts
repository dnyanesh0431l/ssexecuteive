// lib/firebase/products.ts
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
import { incrementBrandProductCount } from "./brands";
import type { Product, ProductColor } from "../types";

const productsRef = () => collection(db, "products");
const colorsRef = (productId: string) =>
  collection(db, "products", productId, "colors");

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const maybe = value as { toDate?: () => Date };
  return typeof maybe.toDate === "function" ? maybe.toDate() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.length > 0);
}

function mapProduct(id: string, data: DocumentData): Product {
  return {
    id,
    name: data.name ?? "",
    slug: data.slug ?? "",
    description: data.description ?? "",
    brandId: data.brandId ?? "",
    categoryId: data.categoryId ?? "",
    images: asStringArray(data.images),
    sizes: asStringArray(data.sizes),
    colorCount: typeof data.colorCount === "number" ? data.colorCount : 0,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapColor(id: string, data: DocumentData): ProductColor {
  return {
    id,
    name: data.name ?? "",
    code: data.code ?? "#000000",
    image: data.image ?? "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(productsRef(), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => mapProduct(d.id, d.data()))),
    (err) => onError?.(err)
  );
}

export function subscribeToProduct(
  productId: string,
  onData: (product: Product | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, "products", productId),
    (snap) =>
      onData(snap.exists() ? mapProduct(snap.id, snap.data()) : null),
    (err) => onError?.(err)
  );
}

export async function getProduct(productId: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", productId));
  return snap.exists() ? mapProduct(snap.id, snap.data()) : null;
}

export interface ProductInput {
  name: string;
  slug: string;
  description: string;
  brandId: string;
  categoryId: string;
  images: string[];
  sizes: string[];
}

export async function createProduct(input: ProductInput): Promise<string> {
  const ref = await addDoc(productsRef(), {
    ...input,
    colorCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  if (input.brandId) await incrementBrandProductCount(input.brandId, 1);
  return ref.id;
}

export async function updateProduct(
  productId: string,
  input: Partial<ProductInput>
): Promise<void> {
  const before = await getDoc(doc(db, "products", productId));
  const prevBrandId = before.exists()
    ? ((before.data().brandId as string) ?? "")
    : "";

  await updateDoc(doc(db, "products", productId), {
    ...input,
    updatedAt: serverTimestamp(),
  });

  if (typeof input.brandId === "string" && input.brandId !== prevBrandId) {
    if (prevBrandId) await incrementBrandProductCount(prevBrandId, -1);
    if (input.brandId) await incrementBrandProductCount(input.brandId, 1);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const imageUrls: string[] = [];

  const colorsSnap = await getDocs(colorsRef(productId));
  if (!colorsSnap.empty) {
    const batch = writeBatch(db);
    colorsSnap.docs.forEach((c) => {
      const image = c.data().image;
      if (typeof image === "string" && image) imageUrls.push(image);
      batch.delete(c.ref);
    });
    await batch.commit();
  }

  const snap = await getDoc(doc(db, "products", productId));
  let prevBrandId = "";
  if (snap.exists()) {
    const data = snap.data();
    if (Array.isArray(data.images)) {
      data.images.forEach((img: unknown) => {
        if (typeof img === "string" && img) imageUrls.push(img);
      });
    }
    prevBrandId = typeof data.brandId === "string" ? data.brandId : "";
  }

  await deleteDoc(doc(db, "products", productId));
  if (prevBrandId) await incrementBrandProductCount(prevBrandId, -1);

  await Promise.all(imageUrls.map((url) => deleteImageByUrl(url)));
}

/* ------------------------------------------------------------------ */
/* Colors (products/{productId}/colors)                                */
/* ------------------------------------------------------------------ */

export function subscribeToProductColors(
  productId: string,
  onData: (colors: ProductColor[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(colorsRef(productId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => mapColor(d.id, d.data()))),
    (err) => onError?.(err)
  );
}

export interface ColorInput {
  name: string;
  code: string;
  image: string;
}

export async function createProductColor(
  productId: string,
  input: ColorInput
): Promise<string> {
  const ref = await addDoc(colorsRef(productId), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "products", productId), {
    colorCount: increment(1),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProductColor(
  productId: string,
  colorId: string,
  input: Partial<ColorInput>
): Promise<void> {
  await updateDoc(doc(db, "products", productId, "colors", colorId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "products", productId), {
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProductColor(
  productId: string,
  colorId: string
): Promise<void> {
  const ref = doc(db, "products", productId, "colors", colorId);
  const snap = await getDoc(ref);
  const image = snap.exists() ? snap.data().image : null;

  await deleteDoc(ref);
  await updateDoc(doc(db, "products", productId), {
    colorCount: increment(-1),
    updatedAt: serverTimestamp(),
  });

  if (typeof image === "string") await deleteImageByUrl(image);
}