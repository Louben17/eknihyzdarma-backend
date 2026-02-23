"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Home, Users, Grid3X3, BookOpen, Newspaper } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

const navItems = [
  { href: "/", label: "Knihy", icon: Home },
  { href: "/kategorie", label: "Kategorie", icon: Grid3X3 },
  { href: "/autori", label: "Autoři", icon: Users },
  { href: "/aktuality", label: "Aktuality", icon: Newspaper },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex-shrink-0">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">E-knihy zdarma</h1>
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
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Hledat knihy..."
              className="pl-10"
              readOnly
            />
          </div>
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
