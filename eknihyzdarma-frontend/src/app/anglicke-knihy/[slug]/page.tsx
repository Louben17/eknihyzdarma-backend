import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppLayout from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import {
  getGutenbergBookBySlug,
  getGutenbergBookByDocumentId,
  getGutenbergBooksByCategoryExcluding,
} from "@/lib/api";
import GutenbergDownloadButton from "@/components/gutenberg-download-button";
import AdSenseAd from "@/components/adsense-ad";
import { ArrowLeft, Download } from "lucide-react";
import type { GutenbergBook } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function findBook(id: string): Promise<GutenbergBook | null> {
  try {
    const res = await getGutenbergBookBySlug(id);
    if (res.data?.[0]) return res.data[0];
  } catch { /* pokračuj */ }
  try {
    const res = await getGutenbergBookByDocumentId(id);
    if (res.data) return res.data;
  } catch { /* pokračuj */ }
  return null;
}

function RelatedGutenbergCard({ book }: { book: GutenbergBook }) {
  return (
    <Link href={`/anglicke-knihy/${book.slug || book.documentId}`} className="group">
      <div className="space-y-2">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-100">
          {book.coverUrl ? (
            <Image src={book.coverUrl} alt={book.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 text-3xl">
              📖
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2 group-hover:text-brand transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {book.author || "Unknown Author"}
          </p>
          {book.downloads > 0 && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Download className="h-3 w-3" />
              {book.downloads.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const book = await findBook(slug);
    if (!book) return { title: "Kniha nenalezena" };
    const title = `${book.title} – ${book.author || "Unknown Author"} | Anglické e-knihy`;
    const description = `Stáhněte si e-knihu ${book.title}${book.author ? ` od ${book.author}` : ""} zdarma z Project Gutenberg ve formátu EPUB.`;
    return {
      title,
      description,
      alternates: { canonical: `/anglicke-knihy/${book.slug || book.documentId}` },
      openGraph: {
        title,
        description,
        type: "book",
        ...(book.coverUrl && { images: [{ url: book.coverUrl, alt: book.title }] }),
      },
    };
  } catch {
    return { title: "Anglická e-kniha" };
  }
}

export default async function GutenbergBookDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const book = await findBook(slug);
  if (!book) notFound();

  // Příbuzné knihy ze stejné kategorie
  let relatedBooks: GutenbergBook[] = [];
  try {
    if (book.category) {
      const res = await getGutenbergBooksByCategoryExcluding(
        book.category,
        book.slug || book.documentId,
        5
      );
      relatedBooks = res.data || [];
    }
  } catch {}

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Zpět */}
        <Link href="/anglicke-knihy" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Anglické knihy
        </Link>

        {/* Hlavní sekce */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="shrink-0">
            <div className="relative w-44 aspect-[2/3] rounded-lg overflow-hidden shadow-md">
              {book.coverUrl ? (
                <Image src={book.coverUrl} alt={book.title} fill className="object-cover" unoptimized priority />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 text-6xl">
                  📖
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
              {book.author && (
                <p className="text-lg text-gray-600 mt-2">{book.author}</p>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xl">🇬🇧</span>
              {book.category && (
                <Link href={`/anglicke-knihy?kategorie=${encodeURIComponent(book.category)}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
                    {book.category}
                  </Badge>
                </Link>
              )}
              <Badge variant="outline">Zdarma</Badge>
              {book.downloads > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Download className="h-3 w-3" />
                  {book.downloads} stažení
                </span>
              )}
            </div>

            {/* Popis */}
            {book.description && (
              <p className="text-gray-600 leading-relaxed">{book.description}</p>
            )}

            {/* Download sekce */}
            {(book.epubUrl || book.mobiUrl) && (
              <div className="border-t pt-5">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Stáhnout e-knihu
                </h3>
                <div className="flex flex-wrap gap-3">
                  {book.epubUrl && (
                    <GutenbergDownloadButton
                      documentId={book.documentId}
                      label="EPUB"
                      url={book.epubUrl}
                    />
                  )}
                  {book.mobiUrl && (
                    <GutenbergDownloadButton
                      documentId={book.documentId}
                      label="MOBI"
                      url={book.mobiUrl}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Příbuzné knihy */}
        {relatedBooks.length > 0 && (
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">
                Další anglické knihy v kategorii {book.category}
              </h2>
              <Link
                href={book.category ? `/anglicke-knihy?kategorie=${encodeURIComponent(book.category)}` : "/anglicke-knihy"}
                className="text-sm text-brand hover:text-brand/80 shrink-0"
              >
                Více knih &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
              {relatedBooks.map((b) => (
                <RelatedGutenbergCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        )}

        {/* AdSense */}
        <AdSenseAd slot="9968245811" style={{ minHeight: "90px" }} />
      </div>
    </AppLayout>
  );
}
