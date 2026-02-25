"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Přihlášení přes Google bylo zrušeno.");
      setTimeout(() => router.push("/prihlasit"), 3000);
      return;
    }

    if (!accessToken) {
      setError("Nepodařilo se získat přihlašovací token.");
      setTimeout(() => router.push("/prihlasit"), 3000);
      return;
    }

    loginWithToken(accessToken)
      .then(() => router.push("/"))
      .catch(() => {
        setError("Přihlášení se nezdařilo. Zkuste to znovu.");
        setTimeout(() => router.push("/prihlasit"), 3000);
      });
  }, [searchParams, loginWithToken, router]);

  if (error) {
    return (
      <>
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-gray-400 mt-2">Přesměrování zpět na přihlášení...</p>
      </>
    );
  }

  return (
    <>
      <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Přihlašuji přes Google...</p>
    </>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Suspense fallback={
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        }>
          <GoogleCallbackInner />
        </Suspense>
      </div>
    </div>
  );
}
