import Link from "next/link";
import Image from "next/image";
import AppLayout from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import HeroCarousel, { type CarouselSlide } from "@/components/hero-carousel";
import {
  getBooks,
  getCategories,
  getMostDownloadedBooks,
  getTopAuthors,
  getBanners,
  getStrapiImageUrl,
} from "@/lib/api";
import type { Book, Author, Banner } from "@/lib/types";
import { Download, TrendingUp } from "lucide-react";

function BookCard({ book }: { book: Book }) {
  const coverUrl = getStrapiImageUrl(book.cover);

  return (
    <Link href={`/kniha/${book.slug}`} className="group">
      <div className="space-y-2">
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-xs">Bez obálky</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {book.author?.name || "Neznámý autor"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function SmallBookCard({ book, rank }: { book: Book; rank: number }) {
  const coverUrl = getStrapiImageUrl(book.cover);

  return (
    <Link href={`/kniha/${book.slug}`} className="flex items-center gap-3 group py-2">
      <span className="text-lg font-bold text-gray-300 w-6 text-center flex-shrink-0">
        {rank}
      </span>
      <div className="w-10 h-14 rounded overflow-hidden bg-gray-100 flex-shrink-0">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={book.title}
            width={40}
            height={56}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {book.title}
        </p>
        <p className="text-xs text-gray-500">{book.author?.name}</p>
        {book.downloads > 0 && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Download className="h-3 w-3" />
            {book.downloads}
          </p>
        )}
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
      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
        {author.name}
      </span>
    </Link>
  );
}

export default async function Home() {
  let books: Book[] = [];
  let categories: { name: string; slug: string }[] = [];
  let popularBooks: Book[] = [];
  let topAuthors: Author[] = [];
  let banners: Banner[] = [];

  try {
    const [booksRes, catsRes] = await Promise.all([
      getBooks(1, 300),
      getCategories(),
    ]);
    books = booksRes.data || [];
    categories = catsRes.data || [];
  } catch (error) {
    console.error("Failed to fetch books/categories:", error);
  }

  try {
    const popularRes = await getMostDownloadedBooks(10);
    popularBooks = popularRes.data || [];
  } catch {
    popularBooks = books.slice(0, 10);
  }

  try {
    const authorsRes = await getTopAuthors(8);
    topAuthors = authorsRes.data || [];
  } catch {}

  try {
    const bannersRes = await getBanners();
    banners = bannersRes.data || [];
  } catch {}

  // Build carousel slides only from Strapi banners
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
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Hero carousel */}
          {carouselSlides.length > 0 && (
            <HeroCarousel slides={carouselSlides} />
          )}

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <Link href="/">
              <Badge
                variant="default"
                className="px-4 py-1.5 text-sm cursor-pointer"
              >
                Všechny
              </Badge>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/kategorie/${cat.slug}`}>
                <Badge
                  variant="outline"
                  className="px-4 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Most downloaded section */}
          {popularBooks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Nejstahovanější
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {popularBooks.slice(0, 6).map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}

          {/* All books */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Všechny knihy
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({books.length})
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            {books.length === 0 && (
              <p className="text-gray-500 text-center py-12">
                Zatím nejsou k dispozici žádné knihy.
              </p>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
          {/* Popular authors */}
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
                className="text-sm text-blue-600 hover:text-blue-800 mt-3 inline-block"
              >
                Zobrazit všechny &rarr;
              </Link>
            </div>
          )}

          {/* Most downloaded list */}
          {popularBooks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Nejstahovanější knihy
              </h3>
              <div className="divide-y divide-gray-100">
                {popularBooks.slice(0, 5).map((book, i) => (
                  <SmallBookCard key={book.id} book={book} rank={i + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Kategorie
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => {
                const count = books.filter(
                  (b) => b.category?.slug === cat.slug
                ).length;
                return (
                  <Link
                    key={cat.slug}
                    href={`/kategorie/${cat.slug}`}
                    className="flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
