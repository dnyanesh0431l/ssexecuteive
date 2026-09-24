// lib/hooks/useCollectionData.ts
"use client";

import { useEffect, useState } from "react";
import { subscribeToBanners } from "../firebase/banners";
import { subscribeToBrands } from "../firebase/brands";
import { subscribeToCategories } from "../firebase/categories";
import { subscribeToContactRequests } from "../firebase/contactRequests";
import { subscribeToGallery } from "../firebase/gallery";
import type {
  Banner,
  Brand,
  Category,
  ContactRequest,
  GalleryImage,
} from "../types";

interface State<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

const GENERIC_ERROR =
  "Could not load data. Please check your connection and try again.";

export function useBrands(): State<Brand[]> {
  const [state, setState] = useState<State<Brand[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeToBrands(
      (brands) => setState({ data: brands, loading: false, error: null }),
      () => setState({ data: [], loading: false, error: GENERIC_ERROR }),
    );
    return () => unsubscribe();
  }, []);

  return state;
}

export function useGallery(): State<GalleryImage[]> {
  const [state, setState] = useState<State<GalleryImage[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeToGallery(
      (items) => setState({ data: items, loading: false, error: null }),
      () => setState({ data: [], loading: false, error: GENERIC_ERROR }),
    );
    return () => unsubscribe();
  }, []);

  return state;
}

export function useContactRequests(): State<ContactRequest[]> {
  const [state, setState] = useState<State<ContactRequest[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeToContactRequests(
      (requests) => setState({ data: requests, loading: false, error: null }),
      () => setState({ data: [], loading: false, error: GENERIC_ERROR }),
    );
    return () => unsubscribe();
  }, []);

  return state;
}

export function useCategories(): State<Category[]> {
  const [state, setState] = useState<State<Category[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeToCategories(
      (data) => setState({ data, loading: false, error: null }),
      () => setState({ data: [], loading: false, error: GENERIC_ERROR }),
    );
    return () => unsubscribe();
  }, []);

  return state;
}

export function useBanners(): State<Banner[]> {
  const [state, setState] = useState<State<Banner[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeToBanners(
      (data) => setState({ data, loading: false, error: null }),
      () => setState({ data: [], loading: false, error: GENERIC_ERROR }),
    );
    return () => unsubscribe();
  }, []);

  return state;
}
