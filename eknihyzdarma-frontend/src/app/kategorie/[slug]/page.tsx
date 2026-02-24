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
  getBookCoverUrl,
} from "@/lib/api";
import type { Book, Author } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

function BookCard({ book }: { book: Book }) {
  const coverUrl = getBookCoverUrl(book);

  return (
    <Link href={`/kniha/${book.slug}`} className="group">
      <div className="space-y-2">
        <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-gray-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-xs">Bez obálky</span>
            </div>
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [catsRes, booksRes, authorsRes] = await Promise.all([
    getCategories(),
    getBooksByCategory(slug, 1),
    getTopAuthors(8),
  ]);

  const categories = catsRes.data || [];
  const books = booksRes.data || [];
  const topAuthors = authorsRes.data || [];

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

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <Link href="/">
              <Badge
                variant="outline"
                className="px-4 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
              >
                Všechny
              </Badge>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/kategorie/${cat.slug}`}>
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
              {books.length}{" "}
              {books.length === 1
                ? "kniha"
                : books.length < 5
                  ? "knihy"
                  : "knih"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {books.length === 0 && (
            <p className="text-gray-500 text-center py-12">
              V této kategorii zatím nejsou žádné knihy.
            </p>
          )}
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
