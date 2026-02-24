import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AppLayout from "@/components/app-layout";
import { getAuthorBySlug, getBooksByAuthor, getStrapiImageUrl, getBookCoverUrl } from "@/lib/api";
import { ArrowLeft, Download, BookOpen } from "lucide-react";
import type { Book } from "@/lib/types";

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
              sizes="(max-width: 640px) 40vw, 180px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-gray-300" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2 group-hover:text-brand transition-colors">
            {book.title}
          </h3>
          {book.downloads > 0 && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Download className="h-3 w-3" />
              {book.downloads.toLocaleString("cs-CZ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [authorRes, booksRes] = await Promise.all([
    getAuthorBySlug(slug),
    getBooksByAuthor(slug),
  ]);

  const author = authorRes.data?.[0];
  if (!author) {
    notFound();
  }

  const books = booksRes.data || [];
  const photoUrl = getStrapiImageUrl(author.photo);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <Link
          href="/autori"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Zpět na autory
        </Link>

        {/* Hlavička autora */}
        <div className="flex items-start gap-6">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={author.name}
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover shadow-md shrink-0"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-medium shrink-0">
              {author.name.charAt(0)}
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
            <p className="text-sm text-gray-500">
              {books.length} {books.length === 1 ? "kniha" : books.length < 5 ? "knihy" : "knih"} v knihovně
            </p>
            {author.bio && (
              <p className="text-gray-700 whitespace-pre-line">{author.bio}</p>
            )}
          </div>
        </div>

        {/* Knihy autora */}
        {books.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-5">Knihy autora</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-5">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
