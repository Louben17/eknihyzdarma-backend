import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AppLayout from "@/components/app-layout";
import ArticleViewTracker from "@/components/article-view-tracker";
import { getArticleBySlug, getStrapiImageUrl } from "@/lib/api";
import { ArrowLeft, Calendar, Eye } from "lucide-react";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ArticleDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getArticleBySlug(slug);
  const article = res.data?.[0];

  if (!article) {
    notFound();
  }

  const coverUrl = getStrapiImageUrl(article.cover);

  return (
    <AppLayout>
      {/* Počítá zobrazení na klientovi při skutečné návštěvě */}
      <ArticleViewTracker documentId={article.documentId} />

      <div className="max-w-2xl mx-auto">
        <Link
          href="/aktuality"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Zpět na aktuality
        </Link>

        <article className="space-y-6">
          {coverUrl && (
            <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">
              <Image
                src={coverUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            </div>
          )}

          <div>
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
              {article.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {article.views} zobrazení
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {article.title}
            </h1>

            {article.perex && (
              <p className="text-base text-gray-500 mt-3 leading-relaxed border-l-4 border-brand-purple/40 pl-4">
                {article.perex}
              </p>
            )}
          </div>

          {article.content && (
            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {article.content}
            </div>
          )}
        </article>
      </div>
    </AppLayout>
  );
}
