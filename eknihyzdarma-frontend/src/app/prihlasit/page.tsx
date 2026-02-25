"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, BookMarked, Library } from "lucide-react";

function DecorativePanel() {
  return (
    <div className="hidden lg:flex flex-1 m-4 rounded-3xl bg-linear-to-br from-brand via-[#1e7fb5] to-brand-purple overflow-hidden relative items-end">

      {/* Dekorativní kruhy na pozadí */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5" />
      <div className="absolute top-1/4 -left-16 w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-brand-purple/30" />

      {/* Ikony knih rozmístěné po ploše */}
      <BookOpen className="absolute top-12 left-12 h-8 w-8 text-white/20" />
      <BookMarked className="absolute top-24 right-16 h-6 w-6 text-white/15" />
      <BookOpen className="absolute top-1/3 right-12 h-10 w-10 text-white/10" />
      <Library className="absolute top-1/2 left-8 h-7 w-7 text-white/20" />
      <BookMarked className="absolute bottom-1/3 left-1/3 h-9 w-9 text-white/10" />
      <BookOpen className="absolute top-2/3 right-8 h-6 w-6 text-white/15" />

      {/* Středová ilustrace */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-2xl">
                <Library className="h-14 w-14 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 rotate-12 shadow-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-3 -left-4 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 -rotate-6 shadow-lg">
                <BookMarked className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Tisíce knih,<br />jeden klik
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-xs mx-auto">
            Přistupte ke své osobní knihovně a oblíbeným titulům kdykoli a odkudkoli.
          </p>
        </div>
      </div>

      {/* Spodní statistiky */}
      <div className="relative z-10 w-full p-8">
        <div className="flex gap-6 justify-center">
          {[
            { value: "1 000+", label: "e-knih zdarma" },
            { value: "100%", label: "ke stažení" },
            { value: "∞", label: "bez poplatků" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/60 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PrihlasitPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Přihlášení se nezdařilo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Levý panel – formulář */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16 xl:px-24 bg-white">
        <div className="w-full max-w-sm mx-auto">

          <Link href="/" className="inline-block mb-10">
            <Image
              src="/logo.png"
              alt="EKnihy zdarma"
              width={160}
              height={48}
              className="h-10 w-auto"
            />
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Vítejte zpátky</h1>
            <p className="text-gray-500 mt-1">Přihlaste se ke svému účtu</p>
          </div>

          {/* Google přihlášení */}
          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 w-full h-11 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Přihlásit se přes Google
          </a>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">nebo</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.cz"
                required
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Heslo
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-11"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? "Přihlašuji..." : "Přihlásit se"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Nemáte účet?{" "}
            <Link href="/registrovat" className="text-brand hover:text-brand/80 font-semibold">
              Zaregistrujte se zdarma
            </Link>
          </p>

          <p className="text-center mt-6">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
              ← Zpět na hlavní stránku
            </Link>
          </p>
        </div>
      </div>

      {/* Pravý panel – dekorativní */}
      <DecorativePanel />
    </div>
  );
}
