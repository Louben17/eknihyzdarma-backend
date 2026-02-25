import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AppLayout from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import {
  getCategories,
  getBooksByCategory,
  getTopAuthors,
  getStrapiImageUrl,
} from "@/lib/api";
import type { Book, Author } from "@/lib/types";
import { ArrowLeft, ChevronLeft, ChevronRight, Home } from "lucide-react";
import BookCoverPlaceholder from "@/components/book-cover-placeholder";

const PAGE_SIZE = 25;

function BookCard({ book }: { book: Book }) {
  const coverUrl = getStrapiImageUrl(book.cover);
  return (
    <Link href={`/kniha/${book.slug}`} className="group">
      <div className="space-y-2">
        <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-gray-100" style={{ containerType: "size" }}>
          {coverUrl ? (
            <Image src={coverUrl} alt={book.title} fill className="object-cover" />
          ) : (
            <BookCoverPlaceholder title={book.title} author={book.author?.name} />
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2 group-hover:text-brand transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {book.author?.name || "Neznámý autor"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function AuthorCard({ author }: { author: Author }) {
  const photoUrl = getStrapiImageUrl(author.photo);

  return (
    <Link
      href={`/autori/${author.slug}`}
      className="flex items-center gap-3 py-2 group"
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={author.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium shrink-0">
          {author.name.charAt(0)}
        </div>
      )}
      <span className="text-sm font-medium text-gray-700 group-hover:text-brand transition-colors">
        {author.name}
      </span>
    </Link>
  );
}

function Pagination({
  currentPage,
  pageCount,
  slug,
}: {
  currentPage: number;
  pageCount: number;
  slug: string;
}) {
  if (pageCount <= 1) return null;

  const pageUrl = (p: number) =>
    p === 1 ? `/kategorie/${slug}` : `/kategorie/${slug}?strana=${p}`;

  // Build page numbers to show: first, last, current ±2, with ellipsis
  const pages: (number | "...")[] = [];
  const delta = 2;
  const range: number[] = [];

  for (
    let i = Math.max(1, currentPage - delta);
    i <= Math.min(pageCount, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (range[0] > 2) pages.push(1, "...");
  else if (range[0] === 2) pages.push(1);

  pages.push(...range);

  if (range[range.length - 1] < pageCount - 1) pages.push("...", pageCount);
  else if (range[range.length - 1] === pageCount - 1) pages.push(pageCount);

  return (
    <nav className="flex items-center justify-center gap-1 pt-6" aria-label="Stránkování">
      {/* Předchozí */}
      {currentPage > 1 ? (
        <Link
          href={pageUrl(currentPage - 1)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          aria-label="Předchozí strana"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-100 text-gray-300 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Čísla stránek */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex items-center justify-center h-9 w-9 text-gray-400 text-sm select-none"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageUrl(p)}
            className={`inline-flex items-center justify-center h-9 min-w-9 px-2 rounded-md border text-sm font-medium transition-colors ${
              p === currentPage
                ? "border-brand bg-brand text-white"
                : "border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      {/* Následující */}
      {currentPage < pageCount ? (
        <Link
          href={pageUrl(currentPage + 1)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          aria-label="Následující strana"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-100 text-gray-300 cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

function pluralBooks(count: number) {
  if (count === 1) return "kniha";
  if (count < 5) return "knihy";
  return "knih";
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ strana?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { strana } = await searchParams;
  const page = Math.max(1, parseInt(strana || "1", 10) || 1);

  const res = await getCategories();
  const category = res.data?.find((c) => c.slug === slug);
  if (!category) return {};

  const pageLabel = page > 1 ? ` – strana ${page}` : "";

  return {
    title: `${category.name}${pageLabel} – E-knihy zdarma`,
    description: `E-knihy z kategorie ${category.name} ke stažení zdarma. Procházejte naši sbírku titulů ve formátech EPUB, PDF a MOBI.`,
    alternates: { canonical: page === 1 ? `/kategorie/${slug}` : `/kategorie/${slug}?strana=${page}` },
    openGraph: { title: `${category.name} | Eknihyzdarma.cz` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ strana?: string }>;
}) {
  const { slug } = await params;
  const { strana } = await searchParams;
  const page = Math.max(1, parseInt(strana || "1", 10) || 1);

  const [catsRes, booksRes, authorsRes] = await Promise.all([
    getCategories(),
    getBooksByCategory(slug, page),
    getTopAuthors(8),
  ]);

  const categories = catsRes.data || [];
  const books = booksRes.data || [];
  const topAuthors = authorsRes.data || [];
  const pagination = booksRes.meta?.pagination;
  const totalBooks = pagination?.total ?? books.length;
  const pageCount = pagination?.pageCount ?? 1;

  const currentCategory = categories.find((c) => c.slug === slug);
  if (!currentCategory) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Zpět na všechny knihy
          </Link>

          {/* Category pills – scrollovatelný karusel na mobilu, wrap na desktopu */}
          <div className="flex flex-nowrap overflow-x-auto gap-2 scrollbar-hide md:flex-wrap">
            <Link href="/" className="shrink-0">
              <Badge
                variant="outline"
                className="px-3 py-1.5 cursor-pointer hover:bg-gray-100 [&>svg]:size-5"
              >
                <Home />
              </Badge>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/kategorie/${cat.slug}`} className="shrink-0">
                <Badge
                  variant={cat.slug === slug ? "default" : "outline"}
                  className={`px-4 py-1.5 text-sm cursor-pointer ${cat.slug === slug ? "hover:bg-brand/90" : "hover:bg-gray-100"}`}
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentCategory.name}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {totalBooks} {pluralBooks(totalBooks)}
              {pageCount > 1 && (
                <span className="ml-2 text-gray-400">
                  · strana {page} z {pageCount}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {books.length === 0 && (
            <p className="text-gray-500 text-center py-12">
              V této kategorii zatím nejsou žádné knihy.
            </p>
          )}

          <Pagination currentPage={page} pageCount={pageCount} slug={slug} />
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-8">
          {topAuthors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Nejoblíbenější autoři
              </h3>
              <div className="divide-y divide-gray-100">
                {topAuthors.map((author) => (
                  <AuthorCard key={author.id} author={author} />
                ))}
              </div>
              <Link
                href="/autori"
                className="text-sm text-brand hover:text-brand/80 mt-3 inline-block"
              >
                Zobrazit všechny &rarr;
              </Link>
            </div>
          )}

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Kategorie
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/kategorie/${cat.slug}`}
                  className={`flex items-center justify-between py-1.5 text-sm transition-colors ${
                    cat.slug === slug
                      ? "text-brand font-medium"
                      : "text-gray-600 hover:text-brand"
                  }`}
                >
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
