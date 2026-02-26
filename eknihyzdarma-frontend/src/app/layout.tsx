import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import Analytics from "@/components/analytics";
import CookieBanner from "@/components/cookie-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eknihyzdarma.cz"),
  title: {
    default: "Eknihyzdarma.cz | eknihy zdarma & eknihy pro Vaše čtečky",
    template: "%s | Eknihyzdarma.cz",
  },
  description:
    "Nejjednoduší stahování eknih do vašich čteček. Vše co potřebujete vědět o elektronickém čtení. E-knihy zdarma.",
  keywords: [
    "e-knihy zdarma",
    "epub ke stažení",
    "pdf knihy zdarma",
    "česká literatura online",
    "volně dostupné e-knihy",
    "knihy pro čtečku",
    "klasická literatura",
    "e-knihy epub mobi",
    "stažení e-knih",
    "eknihyzdarma",
  ],
  authors: [{ name: "Eknihyzdarma.cz" }],
  creator: "Eknihyzdarma.cz",
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: "Eknihyzdarma.cz",
    title: "Eknihyzdarma.cz | eknihy zdarma & eknihy pro Vaše čtečky",
    description:
      "Nejjednoduší stahování eknih do vašich čteček. Vše co potřebujete vědět o elektronickém čtení. E-knihy zdarma.",
    images: [{ url: "/logo.png", width: 400, height: 120, alt: "Eknihyzdarma.cz" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eknihyzdarma.cz | eknihy zdarma & eknihy pro Vaše čtečky",
    description: "Nejjednoduší stahování eknih do vašich čteček. E-knihy zdarma.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
        <CookieBanner />
      </body>
    </html>
  );
}
