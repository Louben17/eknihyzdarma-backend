"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Home, Users, Grid3X3, Newspaper, X, Menu } from "lucide-react";
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

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" onClick={onClose}>
          <Image
            src="/logo.png"
            alt="EKnihy zdarma"
            width={160}
            height={48}
            className="h-10 w-auto"
            priority
          />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-gray-400 hover:text-gray-700 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
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
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Zavřít drawer při navigaci
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Zamknout scroll při otevřeném draweru
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Overlay pro mobilní menu */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar – na desktopu statický, na mobilu slide-in drawer */}
      <aside
        className={[
          "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto",
          "w-64 bg-white border-r border-gray-200 p-6 shrink-0",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <SidebarContent pathname={pathname} onClose={() => setDrawerOpen(false)} />
      </aside>

      {/* Hlavní obsah */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-3 flex items-center gap-3">
          {/* Hamburger tlačítko – pouze mobil */}
          <button
            className="lg:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors shrink-0"
            onClick={() => setDrawerOpen(true)}
            aria-label="Otevřít menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo v headeru – pouze mobil */}
          <Link href="/" className="lg:hidden shrink-0">
            <Image
              src="/logo.png"
              alt="EKnihy zdarma"
              width={120}
              height={36}
              className="h-8 w-auto"
            />
          </Link>

          {/* Search bar */}
          <Suspense fallback={
            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Hledat knihy, autory..." className="pl-10" disabled />
            </div>
          }>
            <SearchBar />
          </Suspense>
        </header>

        {/* Obsah stránky + patička */}
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
