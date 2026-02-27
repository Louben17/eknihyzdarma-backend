import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppLayout from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { getGutenbergBookBySlug, getGutenbergBookByDocumentId } from "@/lib/api";
import GutenbergDownloadButton from "@/components/gutenberg-download-button";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function findBook(id: string) {
  // Zkus slug nejdřív, pak documentId (fallback pro staré záznamy bez slugu)
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const book = await findBook(slug);
    if (!book) return { title: "Kniha nenalezena" };
    return {
      title: `${book.title} – ${book.author || "Unknown Author"} | Anglické e-knihy`,
      description: book.description?.slice(0, 160) || `Stáhněte si e-knihu ${book.title} zdarma z Project Gutenberg.`,
    };
  } catch {
    return { title: "Anglická e-kniha" };
  }
}

export default async function GutenbergBookDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const book = await findBook(slug);
  if (!book) notFound();

  const gutenbergUrl = `https://www.gutenberg.org/ebooks/${book.gutenbergId}`;

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6">
        {/* Zpět */}
        <Link
          href="/anglicke-knihy"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Anglické knihy
        </Link>

        {/* Hlavní obsah */}
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Cover */}
          <div className="shrink-0">
            <div className="relative w-40 aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 shadow-md">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                  <span className="text-6xl">📖</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇬🇧</span>
                {book.category && (
                  <Badge variant="secondary">{book.category}</Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {book.title}
              </h1>
              {book.author && (
                <p className="text-lg text-gray-600 mt-1">{book.author}</p>
              )}
            </div>

            {/* Statistiky */}
            <div className="flex gap-4 text-sm text-gray-500">
              <span>⬇ {book.gutenbergDownloads.toLocaleString()} stažení (Gutenberg)</span>
              {book.downloads > 0 && (
                <span>⬇ {book.downloads} stažení (náš web)</span>
              )}
            </div>

            {/* Popis */}
            {book.description && (
              <p className="text-gray-700 text-sm leading-relaxed">
                {book.description}
              </p>
            )}

            {/* Akce */}
            <div className="flex flex-wrap gap-3 pt-2">
              {book.epubUrl && (
                <GutenbergDownloadButton
                  documentId={book.documentId}
                  epubUrl={book.epubUrl}
                />
              )}
              <a
                href={gutenbergUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:border-brand hover:text-brand transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Project Gutenberg
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
