import type { MetadataRoute } from "next";

export const revalidate = 86400; // 24 hodin

const BASE = "https://eknihyzdarma.cz";
const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || "https://eknihyzdarma-backend-1.onrender.com";

interface SitemapItem {
  slug?: string;
  documentId?: string;
  updatedAt?: string;
}

/** Sekvenčně stáhne všechny stránky daného Strapi endpointu (fields: slug + updatedAt) */
async function fetchAllSlugs(endpoint: string, sortParam = ""): Promise<SitemapItem[]> {
  const results: SitemapItem[] = [];
  let page = 1;
  const pageSize = 500;

  while (true) {
    try {
      const url =
        `${STRAPI}/api/${endpoint}` +
        `?fields[0]=slug&fields[1]=updatedAt` +
        `&pagination[page]=${page}&pagination[pageSize]=${pageSize}` +
        (sortParam ? `&sort=${sortParam}` : "");

      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) break;

      const data = await res.json();
      const items: SitemapItem[] = data.data || [];
      results.push(...items);

      if (items.length < pageSize) break;
      page++;
    } catch {
      break;
    }
  }

  return results;
}

/** Stáhne Gutenberg knihy paralelně (5 stránek najednou) */
async function fetchGutenbergSlugs(): Promise<SitemapItem[]> {
  try {
    // Zjisti celkový počet
    const countRes = await fetch(
      `${STRAPI}/api/gutenberg-books?fields[0]=slug&pagination[page]=1&pagination[pageSize]=1`,
      { next: { revalidate: 86400 } }
    );
    if (!countRes.ok) return [];

    const countData = await countRes.json();
    const total: number = countData.meta?.pagination?.total || 0;
    const totalPages = Math.ceil(total / 500);

    const results: SitemapItem[] = [];

    // Fetch po dávkách 5 stránek najednou
    for (let batchStart = 1; batchStart <= totalPages; batchStart += 5) {
      const pages = Array.from(
        { length: Math.min(5, totalPages - batchStart + 1) },
        (_, i) => batchStart + i
      );

      const batchData = await Promise.all(
        pages.map((p) =>
          fetch(
            `${STRAPI}/api/gutenberg-books?fields[0]=slug&fields[1]=updatedAt&pagination[page]=${p}&pagination[pageSize]=500`,
            { next: { revalidate: 86400 } }
          )
            .then((r) => r.json())
            .then((d) => (d.data as SitemapItem[]) || [])
            .catch(() => [] as SitemapItem[])
        )
      );

      results.push(...batchData.flat());
    }

    return results;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Statické stránky
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/kategorie`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/autori`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/anglicke-knihy`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/aktuality`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/jak-cist-eknihy`, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Paralelní fetch všech dynamických dat
  const [czechBooks, gutenbergBooks, authors, categories, articles] = await Promise.allSettled([
    fetchAllSlugs("books", "downloads:desc"),
    fetchGutenbergSlugs(),
    fetchAllSlugs("authors"),
    fetchAllSlugs("categories"),
    fetchAllSlugs("articles", "publishedAt:desc"),
  ]);

  const toUrl = (
    items: SitemapItem[],
    prefix: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] = "monthly"
  ): MetadataRoute.Sitemap =>
    items
      .filter((item) => item.slug)
      .map((item) => ({
        url: `${BASE}${prefix}/${item.slug}`,
        changeFrequency,
        priority,
        ...(item.updatedAt && { lastModified: new Date(item.updatedAt) }),
      }));

  return [
    ...staticPages,
    ...(czechBooks.status === "fulfilled"
      ? toUrl(czechBooks.value, "/kniha", 0.8, "monthly")
      : []),
    ...(gutenbergBooks.status === "fulfilled"
      ? toUrl(gutenbergBooks.value, "/anglicke-knihy", 0.6, "monthly")
      : []),
    ...(authors.status === "fulfilled"
      ? toUrl(authors.value, "/autori", 0.5, "monthly")
      : []),
    ...(categories.status === "fulfilled"
      ? toUrl(categories.value, "/kategorie", 0.7, "weekly")
      : []),
    ...(articles.status === "fulfilled"
      ? toUrl(articles.value, "/aktuality", 0.6, "monthly")
      : []),
  ];
}
