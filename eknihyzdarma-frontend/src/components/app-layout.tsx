"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Home, Users, Grid3X3, Newspaper, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useState, useEffect, Suspense } from "react";

const navItems = [
  { href: "/", label: "Knihy", icon: Home },
  { href: "/kategorie", label: "Kategorie", icon: Grid3X3 },
  { href: "/autori", label: "Autoři", icon: Users },
  { href: "/aktuality", label: "Aktuality", icon: Newspaper },
];

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/hledani?q=${encodeURIComponent(q)}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-xl relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Hledat knihy, autory..."
        className="pl-10 pr-8"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 shrink-0">
        <div className="mb-8">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="EKnihy zdarma"
              width={160}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center">
          <Suspense fallback={
            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Hledat knihy, autory..." className="pl-10" disabled />
            </div>
          }>
            <SearchBar />
          </Suspense>
        </header>

        {/* Page Content + Footer */}
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="flex-1 p-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
