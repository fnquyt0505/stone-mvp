"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Tiny client store: the page being viewed announces its category so the
 * site-wide quote popup can preselect "Loại sản phẩm".
 */
let currentCategoryId: string | null = null;
const listeners = new Set<() => void>();

function setCategory(id: string | null) {
  currentCategoryId = id;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useQuoteCategory(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => currentCategoryId,
    () => null,
  );
}

/** Rendered by category pages; clears itself when the page unmounts. */
export function QuoteCategory({ id }: { id: string }) {
  useEffect(() => {
    setCategory(id);
    return () => setCategory(null);
  }, [id]);
  return null;
}
