// app/lib/firebase/config.ts
"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAt3c4x6cB-vMFjSpU3F3tCR5tqcRDhkI0",
  authDomain: "luxuries-solon.firebaseapp.com",
  projectId: "luxuries-solon",
  storageBucket: "luxuries-solon.firebasestorage.app",
  messagingSenderId: "425107519385",
  appId: "1:425107519385:web:de5776704c514e08794508",
  measurementId: "G-XGX4TEG3D7",
};

const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Firestore and Storage are safe on the server during the SSR pass.
export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);

// ---------------------------------------------------------------------------
// Auth is BROWSER-ONLY.
//
// `getAuth()` touches browser APIs, so calling it at module load time breaks
// the SSR pass of the admin layout (which is what produced the "Export auth
// does not exist" error). We expose a lazy getter and only construct the
// Auth instance on first use from a client component.
// ---------------------------------------------------------------------------
let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error(
      "[SS Executive Admin] getFirebaseAuth() was called on the server. " +
        "Only call it inside a client component, useEffect, or event handler.",
    );
  }
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }
  return authInstance;
}
