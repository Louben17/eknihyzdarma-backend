import type { Book } from './types';

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
  const res = await fetch('/api/user/library', {
    headers: authHeaders(token),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function addToLibrary(token: string, bookDocumentId: string): Promise<void> {
  await fetch('/api/user/library', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ bookDocumentId }),
  });
}

export async function getMyFavorites(token: string): Promise<FavoriteItem[]> {
  const res = await fetch('/api/user/favorites', {
    headers: authHeaders(token),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function toggleFavorite(token: string, bookDocumentId: string): Promise<boolean> {
  const res = await fetch('/api/user/favorites', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ bookDocumentId }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.favorited;
}

export async function checkFavorite(token: string, bookDocumentId: string): Promise<boolean> {
  const res = await fetch(`/api/user/favorites/${bookDocumentId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.favorited;
}
