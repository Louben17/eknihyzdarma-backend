import Link from "next/link";
import Image from "next/image";
import AppLayout from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthors, getStrapiImageUrl } from "@/lib/api";
import type { Author } from "@/lib/types";

export default async function AuthorsPage() {
  let authors: Author[] = [];

  try {
    const res = await getAuthors();
    authors = res.data || [];
  } catch (error) {
    console.error("Failed to fetch authors:", error);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Autoři</h2>
          <p className="text-gray-600">{authors.length} autorů v knihovně</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {authors.map((author) => {
            const photoUrl = getStrapiImageUrl(author.photo);
            return (
              <Link key={author.id} href={`/autori/${author.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={author.name}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-medium">
                        {author.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900 leading-tight">
                      {author.name}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
