import type { Book, Author, Category, StrapiResponse } from './types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://eknihyzdarma-backend-1.onrender.com';

async function fetchApi<T>(endpoint: string): Promise<T> {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export function getStrapiImageUrl(image?: { url: string } | null): string | null {
  if (!image?.url) return null;
  if (image.url.startsWith('http')) return image.url;
  return `${STRAPI_URL}${image.url}`;
}

export async function getBooks(page = 1, pageSize = 25): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?populate=cover,author,category&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=title:asc`);
}

export async function getBookBySlug(slug: string): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?filters[slug][$eq]=${slug}&populate=cover,author,category,ebookFiles`);
}

export async function getAuthors(): Promise<StrapiResponse<Author[]>> {
  return fetchApi(`/authors?populate=photo&pagination[pageSize]=100&sort=name:asc`);
}

export async function getCategories(): Promise<StrapiResponse<Category[]>> {
  return fetchApi(`/categories?pagination[pageSize]=100&sort=name:asc`);
}

export async function getBooksByCategory(categorySlug: string, page = 1): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?filters[category][slug][$eq]=${categorySlug}&populate=cover,author,category&pagination[page]=${page}&pagination[pageSize]=25&sort=title:asc`);
}

export async function getBooksByAuthor(authorSlug: string, page = 1): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?filters[author][slug][$eq]=${authorSlug}&populate=cover,author,category&pagination[page]=${page}&pagination[pageSize]=25&sort=title:asc`);
}
