"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, ChevronRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Category {
  name: string;
  slug: string;
}

interface CategoryMobileFilterProps {
  categories: Category[];
  currentSlug: string;
}

export default function CategoryMobileFilter({
  categories,
  currentSlug,
}: CategoryMobileFilterProps) {
  const [open, setOpen] = useState(false);
  const currentCategory = categories.find((c) => c.slug === currentSlug);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm md:hidden">
      {/* Aktuální kategorie */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-gray-400 shrink-0">Kategorie:</span>
        <span className="text-sm font-semibold text-gray-900 truncate">
          {currentCategory?.name ?? "Všechny"}
        </span>
      </div>

      {/* Tlačítko pro otevření filtru */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className="flex items-center gap-1.5 shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Změnit kategorii"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Změnit
          </button>
        </DialogTrigger>

        <DialogContent
          className="bottom-0 top-auto translate-y-0 max-w-full rounded-t-2xl rounded-b-none px-0 pb-6 pt-5 sm:bottom-auto sm:top-1/2 sm:translate-y-[-50%] sm:max-w-sm sm:rounded-xl"
        >
          <DialogHeader className="px-5 pb-1">
            <DialogTitle className="text-base font-semibold text-gray-900">
              Vyberte kategorii
            </DialogTitle>
          </DialogHeader>

          <nav className="overflow-y-auto max-h-[60vh] px-2">
            {/* Všechny knihy */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-gray-50"
            >
              <span className="font-medium text-gray-700">Všechny knihy</span>
            </Link>

            {/* Jednotlivé kategorie */}
            {categories.map((cat) => {
              const isActive = cat.slug === currentSlug;
              return (
                <Link
                  key={cat.slug}
                  href={`/kategorie/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-brand/10 text-brand font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{cat.name}</span>
                  {isActive ? (
                    <Check className="h-4 w-4 shrink-0 text-brand" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                  )}
                </Link>
              );
            })}
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}
