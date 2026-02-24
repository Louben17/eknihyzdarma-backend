"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { User, LogOut, BookMarked, Heart } from "lucide-react";

export default function ProfilPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/prihlasit");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {/* Avatar + jméno */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-brand" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{user.username}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Rychlé odkazy */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => router.push("/moje-knihovna")}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-brand/40 hover:bg-brand/5 transition-colors"
          >
            <BookMarked className="h-6 w-6 text-brand" />
            <span className="text-sm font-medium text-gray-700">Moje knihovna</span>
          </button>
          <button
            onClick={() => router.push("/oblibene")}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-brand-purple/40 hover:bg-brand-purple/5 transition-colors"
          >
            <Heart className="h-6 w-6 text-brand-purple" />
            <span className="text-sm font-medium text-gray-700">Oblíbené</span>
          </button>
        </div>

        {/* Odhlásit */}
        <Button
          variant="ghost"
          className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => { logout(); router.push("/"); }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Odhlásit se
        </Button>
      </div>
    </div>
  );
}
