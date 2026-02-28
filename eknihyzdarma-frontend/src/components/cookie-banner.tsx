"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

export type CookieConsent = "accepted" | "declined" | null;

const STORAGE_KEY = "cookie_consent";

export function getCookieConsent(): CookieConsent {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(STORAGE_KEY) as CookieConsent) ?? null;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("cookieConsentAccepted"));
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="bg-brand/10 rounded-full p-4">
              <Cookie className="h-8 w-8 text-brand" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Soubory cookies</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tento web používá cookies pro analýzu návštěvnosti (Google Analytics)
              a zobrazování reklam (Google AdSense). Přijetím nám pomáháš udržovat
              web zdarma pro všechny.{" "}
              <a href="/ochrana-soukromi" className="underline text-brand hover:text-brand/80">
                Více informací
              </a>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-3 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Odmítnout
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-brand rounded-xl hover:bg-brand/90 transition-colors"
              >
                Přijmout vše
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
