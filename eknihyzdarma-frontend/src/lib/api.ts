import type { Book, Author, Category, Banner, Article, StrapiResponse } from './types';

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
  return fetchApi(`/books?populate[0]=cover&populate[1]=author&populate[2]=category&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=title:asc`);
}

export async function getBookBySlug(slug: string): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?filters[slug][$eq]=${slug}&populate[0]=cover&populate[1]=author&populate[2]=category&populate[3]=ebookFiles`);
}

export async function getAuthors(): Promise<StrapiResponse<Author[]>> {
  return fetchApi(`/authors?populate=photo&pagination[pageSize]=100&sort=name:asc`);
}

export async function getCategories(): Promise<StrapiResponse<Category[]>> {
  return fetchApi(`/categories?pagination[pageSize]=100&sort=name:asc`);
}

export async function getBooksByCategory(categorySlug: string, page = 1): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?filters[category][slug][$eq]=${categorySlug}&populate[0]=cover&populate[1]=author&populate[2]=category&pagination[page]=${page}&pagination[pageSize]=25&sort=title:asc`);
}

export async function getAuthorBySlug(slug: string): Promise<StrapiResponse<Author[]>> {
  return fetchApi(`/authors?filters[slug][$eq]=${slug}&populate=photo`);
}

export async function getBooksByAuthor(authorSlug: string, page = 1): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?filters[author][slug][$eq]=${authorSlug}&populate[0]=cover&populate[1]=author&populate[2]=category&pagination[page]=${page}&pagination[pageSize]=25&sort=title:asc`);
}

export async function getMostDownloadedBooks(limit = 10): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?populate[0]=cover&populate[1]=author&populate[2]=category&pagination[pageSize]=${limit}&sort=downloads:desc`);
}

export async function getTopAuthors(limit = 5): Promise<StrapiResponse<Author[]>> {
  return fetchApi(`/authors?populate=photo&pagination[pageSize]=${limit}&sort=name:asc`);
}

export async function getFeaturedBooks(limit = 6): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?filters[isFeatured][$eq]=true&populate[0]=cover&populate[1]=author&populate[2]=category&pagination[pageSize]=${limit}&sort=title:asc`);
}

export async function getNewestBooks(limit = 6): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?populate[0]=cover&populate[1]=author&populate[2]=category&pagination[pageSize]=${limit}&sort=createdAt:desc`);
}

export async function getBanners(): Promise<StrapiResponse<Banner[]>> {
  return fetchApi(`/banners?populate=image&filters[active][$eq]=true&sort=order:asc&pagination[pageSize]=10`);
}

export function getStrapiFileUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}

export async function getArticles(page = 1, pageSize = 10): Promise<StrapiResponse<Article[]>> {
  return fetchApi(`/articles?populate=cover&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=publishedAt:desc`);
}

export async function getArticleBySlug(slug: string): Promise<StrapiResponse<Article[]>> {
  return fetchApi(`/articles?filters[slug][$eq]=${slug}&populate=cover`);
}

export async function getNewestArticles(limit = 2): Promise<StrapiResponse<Article[]>> {
  return fetchApi(`/articles?populate=cover&pagination[pageSize]=${limit}&sort=publishedAt:desc`);
}

export async function getMostReadArticles(limit = 5): Promise<StrapiResponse<Article[]>> {
  return fetchApi(`/articles?populate=cover&pagination[pageSize]=${limit}&sort=views:desc`);
}

export { STRAPI_URL };
