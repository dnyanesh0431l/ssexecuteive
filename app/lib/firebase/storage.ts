// lib/firebase/storage.ts
"use client";

import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./config";

const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function validateImageFile(file: File, maxMb = MAX_IMAGE_MB): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Unsupported file type. Use JPG, PNG, WEBP or AVIF.";
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `Image is too large. Maximum size is ${maxMb}MB.`;
  }
  return null;
}

function buildPath(folder: string, file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  return `${folder.replace(/^\/+|\/+$/g, "")}/${safeName}`;
}

export function uploadImage(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, buildPath(folder, file));
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      cacheControl: "public,max-age=31536000",
    });

    task.on(
      "state_changed",
      (snapshot) => {
        if (!onProgress) return;
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress(percent);
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/** Best-effort delete. Never throws — a stale file must not block a UI action. */
export async function deleteImageByUrl(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("http")) return;
  try {
    await deleteObject(ref(storage, url));
  } catch {
    // File may already be gone or may be an external URL.
  }
}