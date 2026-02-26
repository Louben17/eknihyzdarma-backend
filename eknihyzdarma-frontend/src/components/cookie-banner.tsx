"use client";

import { useState, useEffect } from "react";

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
    // Načíst skripty bez reloadu – dispatch custom event
    window.dispatchEvent(new Event("cookieConsentAccepted"));
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-4 py-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-600 flex-1">
          Tento web používá soubory cookies pro analýzu návštěvnosti (Google Analytics) a zobrazování reklam (Google AdSense).
          Více informací naleznete v naší{" "}
          <a href="/ochrana-soukromi" className="underline hover:text-gray-900">
            politice ochrany soukromí
          </a>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Odmítnout
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm text-white bg-brand rounded-md hover:bg-brand/90 transition-colors"
          >
            Přijmout vše
          </button>
        </div>
      </div>
    </div>
  );
}
