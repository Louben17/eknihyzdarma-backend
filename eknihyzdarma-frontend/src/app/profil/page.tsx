"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { getMyLibrary, getMyFavorites } from "@/lib/user-api";
import { Button } from "@/components/ui/button";
import { LogOut, BookMarked, Heart, Mail, User } from "lucide-react";
import AppLayout from "@/components/app-layout";

export default function ProfilPage() {
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();
  const [libraryCount, setLibraryCount] = useState<number | null>(null);
  const [favoritesCount, setFavoritesCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/prihlasit");
  }, [user, loading, router]);

  useEffect(() => {
    if (token) {
      getMyLibrary(token).then((items) => setLibraryCount(items.length));
      getMyFavorites(token).then((items) => setFavoritesCount(items.length));
    }
  }, [token]);

  if (loading || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const initials = user.username?.slice(0, 2).toUpperCase() || "?";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Karta uživatele */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-brand to-brand-purple flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{user.username}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiky */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/moje-knihovna">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-brand/40 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                  <BookMarked className="h-5 w-5 text-brand" />
                </div>
                <span className="text-xs text-brand font-medium bg-brand/10 px-2 py-0.5 rounded-full">
                  Knihovna
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {libraryCount ?? "—"}
              </div>
              <p className="text-sm text-gray-500 group-hover:text-brand transition-colors">
                stažených knih →
              </p>
            </div>
          </Link>

          <Link href="/oblibene">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-brand-purple/40 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-brand-purple" />
                </div>
                <span className="text-xs text-brand-purple font-medium bg-brand-purple/10 px-2 py-0.5 rounded-full">
                  Oblíbené
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {favoritesCount ?? "—"}
              </div>
              <p className="text-sm text-gray-500 group-hover:text-brand-purple transition-colors">
                oblíbených knih →
              </p>
            </div>
          </Link>
        </div>

        {/* Nastavení účtu */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <User className="h-4 w-4" />
            Účet
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-600">Uživatelské jméno</span>
              <span className="text-sm font-medium text-gray-900">{user.username}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-600">E-mail</span>
              <span className="text-sm font-medium text-gray-900">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Odhlásit */}
        <Button
          variant="ghost"
          className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-xl h-11"
          onClick={() => { logout(); router.push("/"); }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Odhlásit se
        </Button>

      </div>
    </AppLayout>
  );
}
