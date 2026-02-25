"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { getMyLibrary, type LibraryItem } from "@/lib/user-api";
import { getStrapiImageUrl } from "@/lib/api";
import { BookMarked, Download } from "lucide-react";
import BookCoverPlaceholder from "@/components/book-cover-placeholder";

function BookCard({ item }: { item: LibraryItem }) {
  const book = item.book;
  const coverUrl = getStrapiImageUrl(book.cover);

  return (
    <Link href={`/kniha/${book.slug}`} className="group">
      <div className="space-y-2">
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100" style={{ containerType: "size" }}>
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
          {item.downloadedAt && (
            <p className="text-xs text-gray-400 mt-0.5">
              Staženo {new Date(item.downloadedAt).toLocaleDateString("cs-CZ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function MojeKnihovnaPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/prihlasit");
    }
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
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BookMarked className="h-6 w-6 text-brand shrink-0" />
        <h1 className="text-2xl font-bold text-gray-900">Moje knihovna</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Download className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-700 mb-2">Žádné stažené knihy</h2>
          <p className="text-sm text-gray-500 mb-6">
            Stáhněte si první knihu a zobrazí se zde.
          </p>
          <Link
            href="/"
            className="text-brand hover:text-brand/80 font-medium text-sm"
          >
            Procházet knihy →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">
            {items.length} {items.length === 1 ? "kniha" : items.length < 5 ? "knihy" : "knih"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <BookCard key={item.documentId} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
