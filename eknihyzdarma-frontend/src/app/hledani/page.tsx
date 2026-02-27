import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import AppLayout from "@/components/app-layout";
import { searchBooks, searchGutenbergBooks, getStrapiImageUrl } from "@/lib/api";

export const metadata: Metadata = {
  title: "Vyhledávání",
  robots: { index: false, follow: false },
};
import type { Book, GutenbergBook } from "@/lib/types";
import { Download, BookOpen, Search } from "lucide-react";
import BookCoverPlaceholder from "@/components/book-cover-placeholder";

function BookCard({ book }: { book: Book }) {
  const coverUrl = getStrapiImageUrl(book.cover);
  return (
    <Link href={`/kniha/${book.slug}`} className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div className="relative w-14 aspect-[3/4] rounded-md overflow-hidden bg-gray-100 shrink-0" style={{ containerType: "size" }}>
        {coverUrl ? (
          <Image src={coverUrl} alt={book.title} fill className="object-cover" />
        ) : (
          <BookCoverPlaceholder title={book.title} author={book.author?.name} />
        )}
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-brand transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {book.author?.name || "Neznámý autor"}
          {book.category && <span className="text-gray-300 mx-1">·</span>}
          {book.category?.name}
        </p>
        {book.downloads > 0 && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <Download className="h-3 w-3" />
            {book.downloads.toLocaleString("cs-CZ")} stažení
          </p>
        )}
      </div>
    </Link>
  );
}

function GutenbergCard({ book }: { book: GutenbergBook }) {
  return (
    <Link href={`/anglicke-knihy/${book.slug || book.documentId}`} className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div className="relative w-14 aspect-[3/4] rounded-md overflow-hidden bg-gray-100 shrink-0">
        {book.coverUrl ? (
          <Image src={book.coverUrl} alt={book.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 text-xl">📖</div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-brand transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {book.author || "Unknown Author"}
          {book.category && <span className="text-gray-300 mx-1">·</span>}
          {book.category}
          <span className="ml-1">🇬🇧</span>
        </p>
        {book.downloads > 0 && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <Download className="h-3 w-3" />
            {book.downloads.toLocaleString()} stažení
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function HledaniPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  if (!q?.trim()) {
    redirect("/");
  }

  let books: Book[] = [];
  let gutenbergBooks: GutenbergBook[] = [];
  let total = 0;
  let gutenbergTotal = 0;

  try {
    const [czechRes, engRes] = await Promise.all([
      searchBooks(q.trim()),
      searchGutenbergBooks(q.trim()),
    ]);
    books = czechRes.data || [];
    total = czechRes.meta?.pagination?.total || books.length;
    gutenbergBooks = engRes.data || [];
    gutenbergTotal = engRes.meta?.pagination?.total || gutenbergBooks.length;
  } catch {}

  const grandTotal = total + gutenbergTotal;

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Výsledky pro „{q}"
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {grandTotal === 0
                ? "Nic nebylo nalezeno"
                : `${grandTotal} ${grandTotal === 1 ? "kniha" : grandTotal < 5 ? "knihy" : "knih"}`}
            </p>
          </div>
        </div>

        {grandTotal === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-3">
            <BookOpen className="h-12 w-12 mx-auto opacity-30" />
            <p className="text-base">Žádné knihy nenalezeny</p>
            <p className="text-sm">Zkuste jiný výraz nebo{" "}
              <Link href="/" className="text-brand hover:underline">procházejte katalog</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* České knihy */}
            {books.length > 0 && (
              <div>
                {gutenbergBooks.length > 0 && (
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    České e-knihy ({total})
                  </h2>
                )}
                <div className="divide-y divide-gray-50">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}

            {/* Anglické knihy */}
            {gutenbergBooks.length > 0 && (
              <div>
                {books.length > 0 && (
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    🇬🇧 Anglické e-knihy ({gutenbergTotal})
                  </h2>
                )}
                <div className="divide-y divide-gray-50">
                  {gutenbergBooks.map((book) => (
                    <GutenbergCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
