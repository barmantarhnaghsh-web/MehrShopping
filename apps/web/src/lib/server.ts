import { cache } from 'react';
import type { ApiResponse } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/**
 * Server-side fetch helper (RSC / route handlers).
 * Never throws on API errors — pages decide how to degrade.
 */
export async function serverFetch<T>(path: string, revalidate = 0): Promise<ApiResponse<T> | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { accept: 'application/json' },
      ...(revalidate > 0 ? { next: { revalidate } } : { cache: 'no-store' }),
    });
    if (!res.ok) return null;
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

/** Memoized per-request catalog reads (React cache dedupes RSC calls). */
export const getProducts = cache((query: string) => serverFetch<unknown[]>(`/products${query}`));
export const getProduct = cache((slug: string) => serverFetch<unknown>(`/products/${slug}`));
export const getCategories = cache(() => serverFetch<unknown[]>('/categories', 300));

export { API_URL };
