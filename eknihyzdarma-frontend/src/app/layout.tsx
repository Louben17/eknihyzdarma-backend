import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

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
    default: "Eknihyzdarma.cz – E-knihy ke stažení zdarma",
    template: "%s | Eknihyzdarma.cz",
  },
  description:
    "Největší česká knihovna volně dostupných e-knih. Přes 3 400 titulů ke stažení zdarma ve formátech EPUB, PDF a MOBI. Česká literatura, světová klasika, poezie a další.",
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
    title: "Eknihyzdarma.cz – E-knihy ke stažení zdarma",
    description:
      "Největší česká knihovna volně dostupných e-knih. Přes 3 400 titulů ke stažení zdarma.",
    images: [{ url: "/logo.png", width: 400, height: 120, alt: "Eknihyzdarma.cz" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eknihyzdarma.cz – E-knihy ke stažení zdarma",
    description: "Přes 3 400 volně dostupných e-knih ke stažení zdarma.",
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
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8543878903194593"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2KE1TM1GWS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2KE1TM1GWS');
          `}
        </Script>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
