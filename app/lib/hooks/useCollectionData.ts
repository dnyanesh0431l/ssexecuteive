// lib/hooks/useCollectionData.ts
"use client";

import { useEffect, useState } from "react";
import { subscribeToBanners } from "../firebase/banners";
import { subscribeToBrands } from "../firebase/brands";
import { subscribeToCategories } from "../firebase/categories";
import { subscribeToContactRequests } from "../firebase/contactRequests";
import { subscribeToGallery } from "../firebase/gallery";
import { subscribeToProducts } from "../firebase/products";
import type {
  Banner,
  Brand,
  Category,
  ContactRequest,
  GalleryImage,
  Product,
} from "../types";

interface State<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

const GENERIC_ERROR =
  "Could not load data. Please check your connection and try again.";

function makeHook<T>(
  subscribe: (
    onData: (data: T) => void,
    onError: (err: Error) => void,
  ) => () => void,
  empty: T,
): () => State<T> {
  return function useData(): State<T> {
    const [state, setState] = useState<State<T>>({
      data: empty,
      loading: true,
      error: null,
    });

    useEffect(() => {
      const unsubscribe = subscribe(
        (data) => setState({ data, loading: false, error: null }),
        () => setState({ data: empty, loading: false, error: GENERIC_ERROR }),
      );
      return () => unsubscribe();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return state;
  };
}

export const useBrands = makeHook<Brand[]>(
  (onData, onError) => subscribeToBrands(onData, (e) => onError(e)),
  [],
);

export const useProducts = makeHook<Product[]>(
  (onData, onError) => subscribeToProducts(onData, (e) => onError(e)),
  [],
);

export const useCategories = makeHook<Category[]>(
  (onData, onError) => subscribeToCategories(onData, (e) => onError(e)),
  [],
);

export const useBanners = makeHook<Banner[]>(
  (onData, onError) => subscribeToBanners(onData, (e) => onError(e)),
  [],
);

export const useGallery = makeHook<GalleryImage[]>(
  (onData, onError) => subscribeToGallery(onData, (e) => onError(e)),
  [],
);

export const useContactRequests = makeHook<ContactRequest[]>(
  (onData, onError) => subscribeToContactRequests(onData, (e) => onError(e)),
  [],
);
