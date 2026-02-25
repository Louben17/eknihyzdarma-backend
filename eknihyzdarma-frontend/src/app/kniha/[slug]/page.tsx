import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AppLayout from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import {
  getBookBySlug,
  getBooksByCategoryExcluding,
  getRandomBooks,
  getStrapiImageUrl,
  getStrapiFileUrl,
} from "@/lib/api";
import DownloadButton from "@/components/download-button";
import FavoriteButton from "@/components/favorite-button";
import BookCoverPlaceholder from "@/components/book-cover-placeholder";
import StarRating from "@/components/star-rating";
import { ArrowLeft, Download } from "lucide-react";
import type { Book } from "@/lib/types";

function getFileLabel(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "epub") return "EPUB";
  if (ext === "mobi") return "MOBI";
  if (ext === "pdf") return "PDF";
  return ext?.toUpperCase() || "Soubor";
}

function formatFileSize(sizeKB: number): string {
  if (sizeKB >= 1024) {
    return `${(sizeKB / 1024).toFixed(1)} MB`;
  }
  return `${Math.round(sizeKB)} KB`;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function RelatedBookCard({ book }: { book: Book }) {
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
  const res = await getBookBySlug(slug);
  const book = res.data?.[0];
  if (!book) return {};

  const author = book.author?.name ?? "";
  const title = `${book.title}${author ? ` – ${author}` : ""}`;
  const description = book.description
    ? `Stáhněte si e-knihu ${book.title}${author ? ` od ${author}` : ""} zdarma. ${book.description.slice(0, 140).trimEnd()}…`
    : `Stáhněte si e-knihu ${book.title}${author ? ` od ${author}` : ""} zdarma ve formátech EPUB, PDF nebo MOBI.`;
  const coverUrl = getStrapiImageUrl(book.cover);

  return {
    title,
    description,
    alternates: { canonical: `/kniha/${slug}` },
    openGraph: {
      title,
      description,
      type: "book",
      ...(coverUrl && { images: [{ url: coverUrl, alt: book.title }] }),
    },
  };
}

export default async function BookDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getBookBySlug(slug);
  const book = res.data?.[0];

  if (!book) {
    notFound();
  }

  // Načíst příbuzné knihy – přednostně ze stejné kategorie
  let relatedPool: Book[] = [];
  try {
    if (book.category?.slug) {
      const catRes = await getBooksByCategoryExcluding(book.category.slug, slug);
      relatedPool = catRes.data || [];
    }
    if (relatedPool.length < 5) {
      const fallbackRes = await getRandomBooks(slug);
      const fallback = (fallbackRes.data || []).filter(
        (b) => !relatedPool.some((r) => r.id === b.id)
      );
      relatedPool = [...relatedPool, ...fallback];
    }
  } catch {}
  const relatedBooks = shuffle(relatedPool).slice(0, 5);

  const authorPhotoUrl = getStrapiImageUrl(book.author?.photo);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Zpět na knihy
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="shrink-0">
            <div className="relative w-70 h-100 rounded-lg overflow-hidden" style={{ containerType: "size" }}>
              {getStrapiImageUrl(book.cover) ? (
                <Image src={getStrapiImageUrl(book.cover)!} alt={book.title} fill className="object-cover" />
              ) : (
                <BookCoverPlaceholder title={book.title} author={book.author?.name} />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5">
            <div>
              <div className="flex items-start gap-3">
                <h1 className="text-3xl font-bold text-gray-900 flex-1">
                  {book.title}
                </h1>
                <FavoriteButton documentId={book.documentId} />
              </div>

              {book.author && (
                <Link
                  href={`/autori/${book.author.slug}`}
                  className="inline-flex items-center gap-2 mt-3 group"
                >
                  {authorPhotoUrl ? (
                    <Image
                      src={authorPhotoUrl}
                      alt={book.author.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover w-8 h-8"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium">
                      {book.author.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-gray-600 group-hover:text-brand transition-colors">
                    {book.author.name}
                  </span>
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {book.category && (
                <Link href={`/kategorie/${book.category.slug}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-200"
                  >
                    {book.category.name}
                  </Badge>
                </Link>
              )}
              {book.isFree && <Badge variant="outline">Zdarma</Badge>}
              {book.downloads > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Download className="h-3 w-3" />
                  {book.downloads} stažení
                </span>
              )}
            </div>

            <StarRating bookDocumentId={book.documentId} />

            {book.description && (
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            )}

            {/* Download section – vlastní soubory */}
            {book.ebookFiles && book.ebookFiles.length > 0 && (
              <div className="border-t pt-5">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Stáhnout e-knihu
                </h3>
                <div className="flex flex-wrap gap-3">
                  {book.ebookFiles.map((file) => (
                    <DownloadButton
                      key={file.id}
                      fileUrl={getStrapiFileUrl(file.url)}
                      label={getFileLabel(file.name)}
                      size={formatFileSize(file.size)}
                      documentId={book.documentId}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Download section – externí linky (MLP a jiné zdroje) */}
            {book.externalLinks && book.externalLinks.length > 0 && (
              <div className="border-t pt-5">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Stáhnout e-knihu
                </h3>
                <div className="flex flex-wrap gap-3">
                  {book.externalLinks.map((link) => (
                    <DownloadButton
                      key={link.url}
                      fileUrl={link.url}
                      label={link.format}
                      size=""
                      documentId={book.documentId}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Soubory poskytuje{" "}
                  <a
                    href="https://www.mlp.cz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand underline"
                  >
                    Městská knihovna Praha
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Doporučené knihy */}
        {relatedBooks.length > 0 && (
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">
                Podívejte se i na další e-knihy v naší knihovně
              </h2>
              <Link
                href={book.category?.slug ? `/kategorie/${book.category.slug}` : "/"}
                className="text-sm text-brand hover:text-brand/80 shrink-0"
              >
                Více knih &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
              {relatedBooks.map((b) => (
                <RelatedBookCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
