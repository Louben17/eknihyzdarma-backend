import Link from "next/link";
import AppLayout from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories, getBookCountByCategory } from "@/lib/api";
import { Grid3X3 } from "lucide-react";

export default async function CategoriesPage() {
  let categories: { name: string; slug: string }[] = [];
  let bookCounts: Record<string, number> = {};

  try {
    const catsRes = await getCategories();
    categories = catsRes.data || [];
    const counts = await Promise.all(
      categories.map((cat) => getBookCountByCategory(cat.slug))
    );
    categories.forEach((cat, i) => {
      bookCounts[cat.slug] = counts[i];
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Kategorie</h2>
          <p className="text-gray-600">{categories.length} kategorií</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/kategorie/${cat.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <Grid3X3 className="h-8 w-8 text-brand" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {bookCounts[cat.slug] || 0} knih
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
