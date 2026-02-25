import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AppLayout from "@/components/app-layout";
import { getAuthorBySlug, getBooksByAuthor, getStrapiImageUrl } from "@/lib/api";
import { ArrowLeft, Download } from "lucide-react";
import type { Book } from "@/lib/types";
import BookCoverPlaceholder from "@/components/book-cover-placeholder";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await getAuthorBySlug(slug);
  const author = res.data?.[0];
  if (!author) return {};

  const photoUrl = getStrapiImageUrl(author.photo);
  return {
    title: `${author.name} – E-knihy ke stažení`,
    description: author.bio
      ? author.bio.slice(0, 160).trimEnd() + "…"
      : `Volně dostupné e-knihy od ${author.name} ke stažení zdarma. EPUB, PDF, MOBI.`,
    alternates: { canonical: `/autori/${slug}` },
    openGraph: {
      title: `${author.name} | Eknihyzdarma.cz`,
      ...(photoUrl && { images: [{ url: photoUrl, alt: author.name }] }),
    },
  };
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
