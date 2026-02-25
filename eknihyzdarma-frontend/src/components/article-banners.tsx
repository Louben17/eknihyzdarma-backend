import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye } from "lucide-react";
import type { Article } from "@/lib/types";
import { getStrapiImageUrl } from "@/lib/api";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ArticleBanner({ article }: { article: Article }) {
  const coverUrl = getStrapiImageUrl(article.cover);

  return (
    <Link href={`/aktuality/${article.slug}`} className="group block">
      <div className="relative rounded-xl overflow-hidden bg-gray-100 h-56">
        {coverUrl ? (
          <>
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-brand to-brand-purple" />
        )}

        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <p className="text-white/70 text-xs flex items-center gap-1 mb-1">
            <Calendar className="h-3 w-3" />
            {formatDate(article.publishedAt || article.createdAt)}
          </p>
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-white/90 transition-colors drop-shadow">
            {article.title}
          </h3>
          {article.perex && (
            <p className="text-white/70 text-xs mt-1 line-clamp-1">{article.perex}</p>
          )}
        </div>

        {article.views > 0 && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
            <Eye className="h-3 w-3 text-white/80" />
            <span className="text-white/80 text-xs">{article.views}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ArticleBanners({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">Nejnovější aktuality</h2>
        <Link href="/aktuality" className="text-sm text-brand hover:text-brand/80">
          Všechny aktuality &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.slice(0, 2).map((article) => (
          <ArticleBanner key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
