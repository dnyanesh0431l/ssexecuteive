// lib/firebase/contactRequests.ts
"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import type { ContactRequest, ContactStatus } from "../types";

const requestsRef = () => collection(db, "contactRequests");

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const maybe = value as { toDate?: () => Date };
  return typeof maybe.toDate === "function" ? maybe.toDate() : null;
}

function mapRequest(id: string, data: DocumentData): ContactRequest {
  return {
    id,
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    message: data.message ?? "",
    status: (data.status as ContactStatus) ?? "new",
    createdAt: toDate(data.createdAt),
  };
}

export function subscribeToContactRequests(
  onData: (requests: ContactRequest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(requestsRef(), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => mapRequest(d.id, d.data()))),
    (error) => onError?.(error)
  );
}

export function subscribeToContactRequest(
  id: string,
  onData: (request: ContactRequest | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, "contactRequests", id),
    (snapshot) =>
      onData(snapshot.exists() ? mapRequest(snapshot.id, snapshot.data()) : null),
    (error) => onError?.(error)
  );
}

export async function updateContactStatus(
  id: string,
  status: ContactStatus
): Promise<void> {
  await updateDoc(doc(db, "contactRequests", id), { status });
}

export async function deleteContactRequest(id: string): Promise<void> {
  await deleteDoc(doc(db, "contactRequests", id));
}