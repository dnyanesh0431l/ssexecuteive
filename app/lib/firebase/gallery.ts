// lib/firebase/gallery.ts
"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
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
import type { GalleryImage } from "../types";

const galleryRef = () => collection(db, "gallery");

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const maybe = value as { toDate?: () => Date };
  return typeof maybe.toDate === "function" ? maybe.toDate() : null;
}

function mapImage(id: string, data: DocumentData): GalleryImage {
  return {
    id,
    image: data.image ?? "",
    title: data.title ?? "",
    description: data.description ?? "",
    order: typeof data.order === "number" ? data.order : 0,
    createdAt: toDate(data.createdAt),
  };
}

export function subscribeToGallery(
  onData: (items: GalleryImage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(galleryRef(), orderBy("order", "asc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => mapImage(d.id, d.data()))),
    (error) => onError?.(error)
  );
}

export interface GalleryInput {
  image: string;
  title: string;
  description: string;
}

export async function createGalleryImage(input: GalleryInput): Promise<string> {
  // Date.now() keeps new items at the end of the ordering without an extra read.
  const ref = await addDoc(galleryRef(), {
    ...input,
    order: Date.now(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGalleryImage(
  id: string,
  input: Partial<GalleryInput>
): Promise<void> {
  await updateDoc(doc(db, "gallery", id), { ...input });
}

export async function deleteGalleryImage(id: string, imageUrl: string): Promise<void> {
  await deleteDoc(doc(db, "gallery", id));
  await deleteImageByUrl(imageUrl);
}

export async function swapGalleryOrder(a: GalleryImage, b: GalleryImage): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, "gallery", a.id), { order: b.order });
  batch.update(doc(db, "gallery", b.id), { order: a.order });
  await batch.commit();
}