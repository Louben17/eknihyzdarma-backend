import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AppLayout from "@/components/app-layout";
import { getArticles, getStrapiImageUrl } from "@/lib/api";
import type { Article } from "@/lib/types";

export const metadata: Metadata = {
  title: "Aktuality",
  description: "Novinky a aktuality z knihovny Eknihyzdarma.cz – nové přírůstky, tipy na čtení a zajímavosti ze světa e-knih.",
  alternates: { canonical: "/aktuality" },
};
import { Calendar, Eye, Newspaper } from "lucide-react";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ArticleCard({ article }: { article: Article }) {
  const coverUrl = getStrapiImageUrl(article.cover);

  return (
    <Link href={`/aktuality/${article.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {coverUrl ? (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-brand/10 to-brand-purple/10 flex items-center justify-center">
            <Newspaper className="h-12 w-12 text-brand/40" />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
            {article.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.views}
              </span>
            )}
          </div>

          <h2 className="text-base font-semibold text-gray-900 group-hover:text-brand transition-colors line-clamp-2 leading-snug mb-2">
            {article.title}
          </h2>

          {article.perex && (
            <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
              {article.perex}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function AktualityPage() {
  let articles: Article[] = [];
  let total = 0;

  try {
    const res = await getArticles(1, 20);
    articles = res.data || [];
    total = res.meta?.pagination?.total || 0;
  } catch {}

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="h-6 w-6 text-brand" />
          <h1 className="text-2xl font-bold text-gray-900">Aktuality</h1>
          {total > 0 && (
            <span className="text-sm text-gray-400">({total} článků)</span>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Zatím žádné aktuality</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
