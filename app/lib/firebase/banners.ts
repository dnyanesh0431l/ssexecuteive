// lib/firebase/banners.ts
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
import type { Banner } from "../types";

const bannersRef = () => collection(db, "banners");

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const maybe = value as { toDate?: () => Date };
  return typeof maybe.toDate === "function" ? maybe.toDate() : null;
}

function mapBanner(id: string, data: DocumentData): Banner {
  return {
    id,
    image: data.image ?? "",
    title: data.title ?? "",
    subtitle: data.subtitle ?? "",
    link: data.link ?? "",
    order: typeof data.order === "number" ? data.order : 0,
    active: data.active !== false,
    createdAt: toDate(data.createdAt),
  };
}

export function subscribeToBanners(
  onData: (banners: Banner[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(bannersRef(), orderBy("order", "asc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => mapBanner(d.id, d.data()))),
    (error) => onError?.(error)
  );
}

export interface BannerInput {
  image: string;
  title: string;
  subtitle: string;
  link: string;
  active: boolean;
}

export async function createBanner(input: BannerInput): Promise<string> {
  const ref = await addDoc(bannersRef(), {
    ...input,
    order: Date.now(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBanner(
  id: string,
  input: Partial<BannerInput>
): Promise<void> {
  await updateDoc(doc(db, "banners", id), { ...input });
}

export async function deleteBanner(id: string, imageUrl: string): Promise<void> {
  await deleteDoc(doc(db, "banners", id));
  await deleteImageByUrl(imageUrl);
}

export async function swapBannerOrder(a: Banner, b: Banner): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, "banners", a.id), { order: b.order });
  batch.update(doc(db, "banners", b.id), { order: a.order });
  await batch.commit();
}