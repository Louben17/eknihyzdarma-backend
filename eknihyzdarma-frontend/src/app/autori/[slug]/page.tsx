import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AppLayout from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAuthorBySlug, getBooksByAuthor, getStrapiImageUrl } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import type { Book } from "@/lib/types";

function BookCard({ book }: { book: Book }) {
  const coverUrl = getStrapiImageUrl(book.cover);

  return (
    <Link href={`/kniha/${book.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={book.title}
            width={300}
            height={400}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Bez obálky</span>
          </div>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-base leading-tight">{book.title}</CardTitle>
          <CardDescription>{book.author?.name || "Neznámý autor"}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1">
            {book.category && (
              <Badge variant="secondary">{book.category.name}</Badge>
            )}
            {book.isFree && (
              <Badge variant="outline">Zdarma</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
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

        {/* Author header */}
        <div className="flex items-start gap-6">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={author.name}
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-medium flex-shrink-0">
              {author.name.charAt(0)}
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
            <p className="text-gray-600">
              {books.length} {books.length === 1 ? "kniha" : books.length < 5 ? "knihy" : "knih"} v knihovně
            </p>
            {author.bio && (
              <p className="text-gray-700 whitespace-pre-line">{author.bio}</p>
            )}
          </div>
        </div>

        {/* Author's books */}
        {books.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Knihy autora</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
