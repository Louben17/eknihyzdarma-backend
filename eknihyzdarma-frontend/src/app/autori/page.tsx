import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AppLayout from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Autoři e-knih",
  description: "Procházejte přes 1 200 autorů v naší knihovně e-knih zdarma. Česká i světová literatura.",
  alternates: { canonical: "/autori" },
};
import { getAuthors, getStrapiImageUrl } from "@/lib/api";
import type { Author } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 50;

export default async function AuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));

  let authors: Author[] = [];
  let totalPages = 1;
  let total = 0;

  try {
    const res = await getAuthors(page, PAGE_SIZE);
    authors = res.data || [];
    totalPages = res.meta?.pagination?.pageCount ?? 1;
    total = res.meta?.pagination?.total ?? authors.length;
  } catch (error) {
    console.error("Failed to fetch authors:", error);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Autoři</h2>
          <p className="text-gray-600">{total} autorů v knihovně</p>
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

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            {page > 1 ? (
              <Button variant="outline" asChild>
                <Link href={`/autori?page=${page - 1}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Předchozí
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Předchozí
              </Button>
            )}

            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>

            {page < totalPages ? (
              <Button variant="outline" asChild>
                <Link href={`/autori?page=${page + 1}`}>
                  Další
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Další
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
