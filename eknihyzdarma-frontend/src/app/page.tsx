import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AppLayout from "@/components/app-layout";

export const metadata: Metadata = {
  title: "Eknihyzdarma.cz – E-knihy ke stažení zdarma",
  description:
    "Největší česká knihovna volně dostupných e-knih. Přes 3 400 titulů ke stažení zdarma ve formátech EPUB, PDF a MOBI. Česká literatura, světová klasika, poezie a další.",
  alternates: { canonical: "/" },
};
import ArticleBanners from "@/components/article-banners";
import { Badge } from "@/components/ui/badge";
import HeroCarousel, { type CarouselSlide } from "@/components/hero-carousel";
import {
  getCategories,
  getMostDownloadedBooks,
  getFeaturedBooks,
  getNewestBooks,
  getTopAuthors,
  getBanners,
  getNewestArticles,
  getMostReadArticles,
  getStrapiImageUrl,
} from "@/lib/api";
import type { Book, Author, Banner, Article } from "@/lib/types";
import { Download, Star, TrendingUp, Clock, Eye, Newspaper, Home as HomeIcon } from "lucide-react";
import BookCoverPlaceholder from "@/components/book-cover-placeholder";

function BookCard({ book }: { book: Book }) {
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
          {book.downloads > 0 && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Download className="h-3 w-3" />
              {book.downloads.toLocaleString("cs-CZ")} stažení
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function AuthorCard({ author }: { author: Author }) {
  const photoUrl = getStrapiImageUrl(author.photo);

  return (
    <Link
      href={`/autori/${author.slug}`}
      className="flex items-center gap-3 py-2 group"
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={author.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium flex-shrink-0">
          {author.name.charAt(0)}
        </div>
      )}
      <span className="text-sm font-medium text-gray-700 group-hover:text-brand transition-colors">
        {author.name}
      </span>
    </Link>
  );
}

function MostReadArticleItem({ article, rank }: { article: Article; rank: number }) {
  return (
    <Link
      href={`/aktuality/${article.slug}`}
      className="flex items-start gap-2 py-2 group"
    >
      <span className="text-lg font-bold text-gray-200 leading-none w-5 shrink-0 select-none">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
          {article.title}
        </p>
        {article.views > 0 && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Eye className="h-3 w-3" />
            {article.views} zobrazení
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function Home() {
  let categories: { name: string; slug: string }[] = [];
  let featuredBooks: Book[] = [];
  let popularBooks: Book[] = [];
  let newestBooks: Book[] = [];
  let topAuthors: Author[] = [];
  let banners: Banner[] = [];
  let newestArticles: Article[] = [];
  let mostReadArticles: Article[] = [];

  try {
    const catsRes = await getCategories();
    categories = catsRes.data || [];
  } catch {}

  try {
    const featuredRes = await getFeaturedBooks(6);
    featuredBooks = featuredRes.data || [];
  } catch {}

  try {
    const popularRes = await getMostDownloadedBooks(6);
    popularBooks = popularRes.data || [];
  } catch {}

  try {
    const newestRes = await getNewestBooks(6);
    newestBooks = newestRes.data || [];
  } catch {}

  try {
    const authorsRes = await getTopAuthors(8);
    topAuthors = authorsRes.data || [];
  } catch {}

  try {
    const bannersRes = await getBanners();
    banners = bannersRes.data || [];
  } catch {}

  try {
    const articlesRes = await getNewestArticles(2);
    newestArticles = articlesRes.data || [];
  } catch {}

  try {
    const mostReadRes = await getMostReadArticles(5);
    mostReadArticles = mostReadRes.data || [];
  } catch {}

  const carouselSlides: CarouselSlide[] = banners.map((banner) => ({
    id: banner.id,
    image: getStrapiImageUrl(banner.image),
    title: banner.title,
    subtitle: banner.subtitle,
    href: banner.link,
  }));

  return (
    <AppLayout>
      <div className="flex gap-8">
        {/* Hlavní obsah */}
        <div className="flex-1 min-w-0 space-y-8">
          {carouselSlides.length > 0 && (
            <HeroCarousel slides={carouselSlides} />
          )}

          {/* Category pills – scrollovatelný karusel na mobilu, wrap na desktopu */}
          <div className="flex flex-nowrap overflow-x-auto gap-2 scrollbar-hide md:flex-wrap">
            <Link href="/" className="shrink-0">
              <Badge
                variant="default"
                className="px-3 py-1.5 cursor-pointer [&>svg]:size-5"
              >
                <HomeIcon />
              </Badge>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/kategorie/${cat.slug}`} className="shrink-0">
                <Badge
                  variant="outline"
                  className="px-4 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>

          {featuredBooks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Nejoblíbenější
                </h2>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                {featuredBooks.map((book, i) => (
                  <div key={book.id} className={i === 5 ? "lg:hidden" : ""}>
                    <BookCard book={book} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {popularBooks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Nejstahovanější
                </h2>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                {popularBooks.map((book, i) => (
                  <div key={book.id} className={i === 5 ? "lg:hidden" : ""}>
                    <BookCard book={book} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bannery s nejnovějšími aktualitami */}
          {newestArticles.length > 0 && (
            <ArticleBanners articles={newestArticles} />
          )}

          {newestBooks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Nejnovější
                </h2>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                {newestBooks.map((book, i) => (
                  <div key={book.id} className={i === 5 ? "lg:hidden" : ""}>
                    <BookCard book={book} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pravý sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
          {/* Nejčtenější články */}
          {mostReadArticles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Newspaper className="h-4 w-4 text-brand" />
                Nejčtenější články
              </h3>
              <div className="divide-y divide-gray-100">
                {mostReadArticles.map((article, index) => (
                  <MostReadArticleItem
                    key={article.id}
                    article={article}
                    rank={index + 1}
                  />
                ))}
              </div>
              <Link
                href="/aktuality"
                className="text-sm text-brand hover:text-brand/80 mt-3 inline-block"
              >
                Všechny aktuality &rarr;
              </Link>
            </div>
          )}

          {/* Nejoblíbenější autoři */}
          {topAuthors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Nejoblíbenější autoři
              </h3>
              <div className="divide-y divide-gray-100">
                {topAuthors.map((author) => (
                  <AuthorCard key={author.id} author={author} />
                ))}
              </div>
              <Link
                href="/autori"
                className="text-sm text-brand hover:text-brand/80 mt-3 inline-block"
              >
                Zobrazit všechny &rarr;
              </Link>
            </div>
          )}

          {/* Kategorie */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Kategorie
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/kategorie/${cat.slug}`}
                  className="flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-brand transition-colors"
                >
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
