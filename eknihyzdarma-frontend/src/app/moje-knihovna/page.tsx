"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { getMyLibrary, type LibraryItem } from "@/lib/user-api";
import { getStrapiImageUrl } from "@/lib/api";
import { BookMarked, Calendar } from "lucide-react";
import BookCoverPlaceholder from "@/components/book-cover-placeholder";
import AppLayout from "@/components/app-layout";

function BookCard({ item }: { item: LibraryItem }) {
  const book = item.book;
  const coverUrl = getStrapiImageUrl(book.cover);
  const date = item.downloadedAt
    ? new Date(item.downloadedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <Link href={`/kniha/${book.slug}`} className="group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-brand/40 hover:shadow-md transition-all">
        <div className="relative aspect-3/4 bg-gray-100" style={{ containerType: "size" }}>
          {coverUrl ? (
            <Image src={coverUrl} alt={book.title} fill className="object-cover" />
          ) : (
            <BookCoverPlaceholder title={book.title} author={book.author?.name} />
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2 group-hover:text-brand transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {book.author?.name || "Neznámý autor"}
          </p>
          {date && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1.5">
              <Calendar className="h-3 w-3 shrink-0" />
              {date}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function pluralKnih(n: number) {
  if (n === 1) return "kniha";
  if (n < 5) return "knihy";
  return "knih";
}

export default function MojeKnihovnaPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/prihlasit");
  }, [user, loading, router]);

  useEffect(() => {
    if (token) {
      getMyLibrary(token)
        .then(setItems)
        .finally(() => setFetching(false));
    }
  }, [token]);

  if (loading || fetching) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Hlavička */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <BookMarked className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moje knihovna</h1>
            {items.length > 0 && (
              <p className="text-sm text-gray-500">{items.length} stažených {pluralKnih(items.length)}</p>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
              <BookMarked className="h-8 w-8 text-brand/50" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Žádné stažené knihy</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              Stáhněte si první knihu a automaticky se uloží do vaší knihovny.
            </p>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand/80 transition-colors">
              Procházet knihy →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <BookCard key={item.documentId} item={item} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
