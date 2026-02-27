import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AppLayout from "@/components/app-layout";
import { getGutenbergBooks } from "@/lib/api";
import type { GutenbergBook } from "@/lib/types";

export const metadata: Metadata = {
  title: "Anglické e-knihy zdarma | Project Gutenberg",
  description: "Tisíce klasických anglických e-knih zdarma ke stažení z Project Gutenberg. Filtrujte podle žánru.",
  alternates: { canonical: "/anglicke-knihy" },
};

const CATEGORIES = [
  "Classic", "Fiction", "Science Fiction", "Mystery", "Adventure",
  "Horror", "Children", "Romance", "Historical", "Poetry", "Biography",
  "Philosophy", "Drama",
];

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<{ kategorie?: string; strana?: string }>;
}

export default async function AnglickeKnihyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.kategorie || "";
  const page = parseInt(params.strana || "1", 10);

  let books: GutenbergBook[] = [];
  let totalPages = 1;

  try {
    const res = await getGutenbergBooks(page, PAGE_SIZE, category || undefined);
    books = res.data || [];
    totalPages = res.meta?.pagination?.pageCount || 1;
  } catch (error) {
    console.error("Failed to fetch Gutenberg books:", error);
  }

  const buildUrl = (newPage: number, newCategory?: string) => {
    const params = new URLSearchParams();
    if (newCategory) params.set("kategorie", newCategory);
    if (newPage > 1) params.set("strana", String(newPage));
    const qs = params.toString();
    return `/anglicke-knihy${qs ? `?${qs}` : ""}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Hlavička */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="mr-2">🇬🇧</span>Anglické e-knihy
          </h1>
          <p className="text-gray-600 mt-1">
            Klasická literatura v angličtině z Project Gutenberg — zdarma ke stažení
          </p>
        </div>

        {/* Kategorie pills */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildUrl(1)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !category
                ? "bg-brand text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:border-brand hover:text-brand"
            }`}
          >
            Vše
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={buildUrl(1, cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-brand text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-brand hover:text-brand"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Grid knih */}
        {books.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Žádné knihy nenalezeny</p>
            <p className="text-sm mt-2">Zkuste jinou kategorii nebo počkejte na dokončení importu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {books.map((book) => (
              <Link key={book.documentId} href={`/anglicke-knihy/${book.slug || book.documentId}`} className="group">
                <div className="space-y-2">
                  {/* Cover */}
                  <div className="relative aspect-[2/3] bg-gray-100 rounded-md overflow-hidden">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                        <span className="text-4xl">📖</span>
                      </div>
                    )}
                    {/* Flag badge */}
                    <span className="absolute top-1.5 right-1.5 text-base leading-none">🇬🇧</span>
                  </div>
                  {/* Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-brand transition-colors">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{book.author}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Paginace */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            {page > 1 && (
              <Link
                href={buildUrl(page - 1, category || undefined)}
                className="px-4 py-2 rounded-md border border-gray-200 text-sm hover:border-brand hover:text-brand transition-colors"
              >
                ← Předchozí
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={buildUrl(page + 1, category || undefined)}
                className="px-4 py-2 rounded-md border border-gray-200 text-sm hover:border-brand hover:text-brand transition-colors"
              >
                Další →
              </Link>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
