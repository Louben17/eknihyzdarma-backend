import type { Book } from './types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://eknihyzdarma-backend-1.onrender.com';

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export interface LibraryItem {
  id: number;
  documentId: string;
  downloadedAt: string;
  book: Book;
}

export interface FavoriteItem {
  id: number;
  documentId: string;
  book: Book;
}

export async function getMyLibrary(token: string): Promise<LibraryItem[]> {
  const res = await fetch(`${STRAPI_URL}/api/user-library/my`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function addToLibrary(token: string, bookDocumentId: string): Promise<void> {
  await fetch(`${STRAPI_URL}/api/user-library/add`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ bookDocumentId }),
  });
}

export async function getMyFavorites(token: string): Promise<FavoriteItem[]> {
  const res = await fetch(`${STRAPI_URL}/api/user-favorites/my`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function toggleFavorite(token: string, bookDocumentId: string): Promise<boolean> {
  const res = await fetch(`${STRAPI_URL}/api/user-favorites/toggle`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ bookDocumentId }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.favorited;
}

export async function checkFavorite(token: string, bookDocumentId: string): Promise<boolean> {
  const res = await fetch(`${STRAPI_URL}/api/user-favorites/check/${bookDocumentId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.favorited;
}
