// lib/firebase/categories.ts
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
import type { Category } from "../types";

const categoriesRef = () => collection(db, "categories");

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const maybe = value as { toDate?: () => Date };
  return typeof maybe.toDate === "function" ? maybe.toDate() : null;
}

function mapCategory(id: string, data: DocumentData): Category {
  return {
    id,
    name: data.name ?? "",
    slug: data.slug ?? "",
    description: data.description ?? "",
    image: data.image ?? "",
    order: typeof data.order === "number" ? data.order : 0,
    brandCount: typeof data.brandCount === "number" ? data.brandCount : 0,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function subscribeToCategories(
  onData: (categories: Category[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(categoriesRef(), orderBy("order", "asc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => mapCategory(d.id, d.data()))),
    (error) => onError?.(error)
  );
}

export function subscribeToCategory(
  id: string,
  onData: (category: Category | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, "categories", id),
    (snapshot) =>
      onData(snapshot.exists() ? mapCategory(snapshot.id, snapshot.data()) : null),
    (error) => onError?.(error)
  );
}

export async function getCategory(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(db, "categories", id));
  return snap.exists() ? mapCategory(snap.id, snap.data()) : null;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description: string;
  image: string;
}

export async function createCategory(input: CategoryInput): Promise<string> {
  const ref = await addDoc(categoriesRef(), {
    ...input,
    order: Date.now(),
    brandCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>
): Promise<void> {
  await updateDoc(doc(db, "categories", id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a category. Brands inside it are detached (categoryId cleared)
 * so nothing is silently lost.
 */
export async function deleteCategory(id: string): Promise<void> {
  const categoryRef = doc(db, "categories", id);
  const snap = await getDoc(categoryRef);

  const brandsSnap = await getDocs(collection(db, "brands"));
  const batch = writeBatch(db);
  brandsSnap.docs.forEach((b) => {
    if (b.data().categoryId === id) {
      batch.update(b.ref, { categoryId: "", updatedAt: serverTimestamp() });
    }
  });
  await batch.commit();

  await deleteDoc(categoryRef);

  const image = snap.exists() ? snap.data().image : null;
  if (typeof image === "string" && image) await deleteImageByUrl(image);
}

export async function swapCategoryOrder(a: Category, b: Category): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, "categories", a.id), { order: b.order });
  batch.update(doc(db, "categories", b.id), { order: a.order });
  await batch.commit();
}

export async function incrementCategoryBrandCount(
  categoryId: string,
  delta: number
): Promise<void> {
  if (!categoryId) return;
  await updateDoc(doc(db, "categories", categoryId), {
    brandCount: increment(delta),
    updatedAt: serverTimestamp(),
  });
}