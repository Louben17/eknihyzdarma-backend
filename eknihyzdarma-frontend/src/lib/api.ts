import type { Book, Author, Category, Banner, Article, StrapiResponse } from './types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://eknihyzdarma-backend-1.onrender.com';

async function fetchApi<T>(endpoint: string, nextOptions?: { revalidate: number }): Promise<T> {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const res = await fetch(url, { next: { revalidate: nextOptions?.revalidate ?? 60 } });

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

export function getBookCoverUrl(book: { cover?: { url: string } | null; coverExternalUrl?: string }): string | null {
  return getStrapiImageUrl(book.cover) || book.coverExternalUrl || null;
}

export async function getBooks(page = 1, pageSize = 25): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?populate[0]=cover&populate[1]=author&populate[2]=category&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=title:asc`);
}

export async function getBookBySlug(slug: string): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?filters[slug][$eq]=${slug}&populate[0]=cover&populate[1]=author&populate[2]=category&populate[3]=ebookFiles`);
}

export async function getAuthors(page = 1, pageSize = 50): Promise<StrapiResponse<Author[]>> {
  return fetchApi(`/authors?populate=photo&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=name:asc`);
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
  return fetchApi(`/books?filters[isFeatured][$eq]=true&populate[cover]=true&populate[category]=true&populate[author][populate][0]=photo&pagination[pageSize]=${limit}&sort=title:asc`);
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

export async function getBookCountByCategory(categorySlug: string): Promise<number> {
  const res = await fetchApi<StrapiResponse<Book[]>>(
    `/books?filters[category][slug][$eq]=${categorySlug}&pagination[pageSize]=1&fields[0]=documentId`
  );
  return res.meta?.pagination?.total ?? 0;
}

export async function getBooksByCategoryExcluding(categorySlug: string, excludeSlug: string, limit = 20): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?filters[category][slug][$eq]=${categorySlug}&filters[slug][$ne]=${excludeSlug}&populate[0]=cover&populate[1]=author&pagination[pageSize]=${limit}&sort=downloads:desc`);
}

export async function getRandomBooks(excludeSlug: string, limit = 20): Promise<StrapiResponse<Book[]>> {
  return fetchApi(`/books?filters[slug][$ne]=${excludeSlug}&populate[0]=cover&populate[1]=author&pagination[pageSize]=${limit}&sort=downloads:desc`);
}

export async function getBookOfTheDay(): Promise<Book | null> {
  const res = await fetchApi<StrapiResponse<Book[]>>(
    `/books?populate[0]=cover&populate[1]=author&pagination[pageSize]=100&sort=downloads:desc`,
    { revalidate: 3600 }
  );
  const books = res.data || [];
  if (books.length === 0) return null;

  // Deterministický výběr podle dne v roce – každý den jiná kniha
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return books[dayOfYear % books.length];
}

export async function searchBooks(query: string, pageSize = 100): Promise<StrapiResponse<Book[]>> {
  const q = encodeURIComponent(query);
  return fetchApi(
    `/books?filters[$or][0][title][$containsi]=${q}&filters[$or][1][description][$containsi]=${q}&filters[$or][2][author][name][$containsi]=${q}&populate[0]=cover&populate[1]=author&populate[2]=category&pagination[pageSize]=${pageSize}&sort=downloads:desc`,
    { revalidate: 0 }
  );
}

export { STRAPI_URL };
