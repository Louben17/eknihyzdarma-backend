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
    <div className="hidden lg:flex flex-1 m-4 rounded-3xl bg-linear-to-br from-brand-purple via-[#8a529a] to-brand overflow-hidden relative items-end">

      {/* Dekorativní kruhy na pozadí */}
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/5" />
      <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-brand/30" />

      {/* Ikony knih */}
      <BookMarked className="absolute top-10 right-14 h-8 w-8 text-white/20" />
      <BookOpen className="absolute top-28 left-12 h-6 w-6 text-white/15" />
      <Library className="absolute top-1/3 right-10 h-10 w-10 text-white/10" />
      <BookOpen className="absolute top-1/2 right-1/3 h-7 w-7 text-white/20" />
      <BookMarked className="absolute bottom-1/3 right-1/4 h-9 w-9 text-white/10" />
      <BookOpen className="absolute top-3/4 left-8 h-6 w-6 text-white/15" />

      {/* Středová ilustrace */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-2xl">
                <BookMarked className="h-14 w-14 text-white" />
              </div>
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 -rotate-12 shadow-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-3 -right-4 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 rotate-6 shadow-lg">
                <Library className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Vaše osobní<br />knihovna
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-xs mx-auto">
            Ukládejte oblíbené tituly, stahujte e-knihy a budujte svou digitální sbírku.
          </p>
        </div>
      </div>

      {/* Spodní statistiky */}
      <div className="relative z-10 w-full p-8">
        <div className="flex gap-6 justify-center">
          {[
            { value: "Zdarma", label: "registrace" },
            { value: "❤️", label: "oblíbené" },
            { value: "📥", label: "stažené" },
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

export default function RegistrovatPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Heslo musí mít alespoň 6 znaků");
      return;
    }
    if (password !== confirmPassword) {
      setError("Hesla se neshodují");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registrace se nezdařila");
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
            <h1 className="text-2xl font-bold text-gray-900">Vytvořit účet</h1>
            <p className="text-gray-500 mt-1">Registrace je zdarma, vždy</p>
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
                placeholder="Minimálně 6 znaků"
                required
                autoComplete="new-password"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Potvrdit heslo
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="h-11"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? "Registruji..." : "Zaregistrovat se"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Již máte účet?{" "}
            <Link href="/prihlasit" className="text-brand hover:text-brand/80 font-semibold">
              Přihlaste se
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
