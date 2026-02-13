import AppLayout from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBooks, getCategories, getStrapiImageUrl } from "@/lib/api";
import type { Book } from "@/lib/types";

function BookCard({ book }: { book: Book }) {
  const coverUrl = getStrapiImageUrl(book.cover);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={book.title}
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Bez obálky</span>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{book.title}</CardTitle>
        <CardDescription>{book.author?.name || "Neznámý autor"}</CardDescription>
      </CardHeader>
      <CardContent>
        {book.category && (
          <Badge variant="secondary">{book.category.name}</Badge>
        )}
        {book.isFree && (
          <Badge variant="outline" className="ml-2">Zdarma</Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default async function Home() {
  let books: Book[] = [];
  let categories: { name: string; slug: string }[] = [];

  try {
    const [booksRes, catsRes] = await Promise.all([
      getBooks(1, 100),
      getCategories(),
    ]);
    books = booksRes.data || [];
    categories = catsRes.data || [];
  } catch (error) {
    console.error("Failed to fetch data from Strapi:", error);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">E-knihy zdarma</h2>
          <p className="text-gray-600">
            {books.length > 0
              ? `${books.length} knih k dispozici`
              : "Načítám knihy..."}
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Všechny</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.slug} value={cat.slug}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            {books.length === 0 && (
              <p className="text-gray-500 text-center py-12">
                Zatím nejsou k dispozici žádné knihy. Spusťte seed skript pro import dat.
              </p>
            )}
          </TabsContent>

          {categories.map((cat) => (
            <TabsContent key={cat.slug} value={cat.slug} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {books
                  .filter((book) => book.category?.slug === cat.slug)
                  .map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
