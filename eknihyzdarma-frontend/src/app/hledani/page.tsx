import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import AppLayout from "@/components/app-layout";
import { searchBooks, getBookCoverUrl } from "@/lib/api";
import type { Book } from "@/lib/types";
import { Download, BookOpen, Search } from "lucide-react";

function BookCard({ book }: { book: Book }) {
  const coverUrl = getBookCoverUrl(book);

  return (
    <Link href={`/kniha/${book.slug}`} className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div className="relative w-14 aspect-3/4 rounded-md overflow-hidden bg-gray-100 shrink-0">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-gray-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-brand transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {book.author?.name || "Neznámý autor"}
          {book.category && (
            <span className="text-gray-300 mx-1">·</span>
          )}
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
  let total = 0;

  try {
    const res = await searchBooks(q.trim());
    books = res.data || [];
    total = res.meta?.pagination?.total || books.length;
  } catch {}

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
              {total === 0
                ? "Nic nebylo nalezeno"
                : `${total} ${total === 1 ? "kniha" : total < 5 ? "knihy" : "knih"}`}
            </p>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-3">
            <BookOpen className="h-12 w-12 mx-auto opacity-30" />
            <p className="text-base">Žádné knihy nenalezeny</p>
            <p className="text-sm">Zkuste jiný výraz nebo{" "}
              <Link href="/" className="text-brand hover:underline">
                procházejte katalog
              </Link>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
