import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AppLayout from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { getBookBySlug, getStrapiImageUrl, getStrapiFileUrl } from "@/lib/api";
import DownloadButton from "@/components/download-button";
import { BookOpen, ArrowLeft, Download } from "lucide-react";

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

  const coverUrl = getStrapiImageUrl(book.cover);
  const authorPhotoUrl = getStrapiImageUrl(book.author?.photo);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Zpět na knihy
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="flex-shrink-0">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={book.title}
                width={280}
                height={400}
                className="rounded-lg shadow-lg object-cover"
              />
            ) : (
              <div className="w-[280px] h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {book.title}
              </h1>

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
                  <span className="text-gray-600 group-hover:text-blue-600 transition-colors">
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

            {book.description && (
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            )}

            {/* Download section */}
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
