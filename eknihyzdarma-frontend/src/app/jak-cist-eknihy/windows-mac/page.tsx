import type { Metadata } from "next";
import Link from "next/link";
import AppLayout from "@/components/app-layout";
import JakCistNav from "@/components/jak-cist-nav";
import { ArrowLeft, CheckCircle2, Lightbulb, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Jak číst e-knihy na Windows a Mac – nejlepší programy | Eknihyzdarma.cz",
  description:
    "Nejlepší programy pro čtení e-knih na PC a Mac. Calibre, Thorium Reader, Kindle pro PC, Adobe Digital Editions. Jak otevřít EPUB nebo MOBI na počítači.",
  alternates: { canonical: "/jak-cist-eknihy/windows-mac" },
  openGraph: { title: "Windows a Mac – jak číst e-knihy | Eknihyzdarma.cz" },
};

const apps = [
  {
    name: "Calibre",
    badge: "Nejlepší zdarma",
    badgeColor: "bg-emerald-100 text-emerald-700",
    star: true,
    platforms: "Windows / Mac / Linux",
    desc: "Bezplatný, open-source nástroj pro správu e-knih. Umí číst EPUB, MOBI, PDF i desítky dalších formátů. Navíc konvertuje mezi formáty, upravuje metadata a odesílá knihy do čtečky.",
    formats: ["EPUB", "MOBI", "PDF", "AZW3", "FB2", "TXT"],
    link: "calibre-ebook.com",
    how: "Stáhněte Calibre → Přidejte soubory do knihovny → Dvojklikem otevřete knihu ve vestavěné čtečce.",
  },
  {
    name: "Thorium Reader",
    badge: "Moderní",
    badgeColor: "bg-blue-100 text-blue-700",
    star: false,
    platforms: "Windows / Mac / Linux",
    desc: "Moderní, čistý čtecí program od EDRLab. Skvělá podpora EPUB 3, přístupnost (čtení nahlas, velká písma), žádné reklamy. Ideální pokud chcete jen číst bez zbytečností.",
    formats: ["EPUB", "PDF", "DAISY"],
    link: "thorium-reader.org",
    how: "Stáhněte z thorium-reader.org → nainstalujte → přetáhněte EPUB soubor do okna programu.",
  },
  {
    name: "Kindle pro PC / Mac",
    badge: "Zdarma",
    badgeColor: "bg-orange-100 text-orange-700",
    star: false,
    platforms: "Windows / Mac",
    desc: "Oficiální aplikace Amazonu. Synchronizuje knihovnu s Kindle čtečkou a mobilní Kindle aplikací. EPUB soubory přidáte přes Send to Kindle.",
    formats: ["MOBI", "AZW3", "EPUB (přes Send to Kindle)", "PDF"],
    link: "amazon.com/kindle-pc",
    how: "Nahrajte soubor přes send.amazon.com → přihlaste se účtem → zobrazí se automaticky v Kindle aplikaci.",
  },
  {
    name: "Adobe Digital Editions",
    badge: "Pro DRM knihy",
    badgeColor: "bg-red-100 text-red-700",
    star: false,
    platforms: "Windows / Mac",
    desc: "Specializovaný prohlížeč pro EPUB a PDF chráněné Adobe DRM. Potřebujete ho pro knihy zakoupené v některých e-shopech. Naše knihy jsou bez DRM.",
    formats: ["EPUB", "PDF"],
    link: "adobe.com/digital-editions",
    how: "Nainstalujte a vytvořte Adobe ID → přihlaste se → otevřete chráněnou EPUB knihu z knihkupectví.",
  },
  {
    name: "Apple Books",
    badge: "Mac only",
    badgeColor: "bg-gray-100 text-gray-700",
    star: false,
    platforms: "Mac",
    desc: "Vestavěná aplikace macOS. Jednoduchá, čistá a plně integrovaná do systému. Synchronizuje knihovnu s iPhone a iPad přes iCloud.",
    formats: ["EPUB", "PDF"],
    link: null,
    how: "Otevřete EPUB soubor v Finderu → pravé tlačítko → Otevřít v → Knihy. Nebo přetáhněte soubor do aplikace.",
  },
];

export default function WindowsMacPage() {
  return (
    <AppLayout>
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 space-y-8 max-w-3xl">
          <Link
            href="/jak-cist-eknihy"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Zpět na přehled
          </Link>

          {/* Header */}
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-purple-50 border border-purple-100">
            <div className="text-4xl shrink-0">💻</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Windows a Mac</h1>
              <p className="text-gray-600 mt-1 leading-relaxed">
                Na počítači máte největší obrazovku a nejpohodlnější ovládání. Doporučujeme{" "}
                <strong>Calibre</strong> nebo <strong>Thorium Reader</strong> – oba jsou zdarma
                a fungují na Windows i Mac.
              </p>
            </div>
          </div>

          {/* Quickstart */}
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Nejrychlejší způsob – Thorium Reader
            </h2>
            <ol className="space-y-2">
              {[
                "Stáhněte Thorium Reader z thorium-reader.org (zdarma, Windows i Mac).",
                "Nainstalujte program a spusťte ho.",
                "Stáhněte EPUB soubor z naší knihovny.",
                "Přetáhněte soubor do okna Thorium Reader – kniha se přidá do knihovny.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Aplikace */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Doporučené programy</h2>
            <div className="space-y-4">
              {apps.map((app) => (
                <div key={app.name} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
                      {app.name}
                      {app.star && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />}
                    </h3>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-gray-400">{app.platforms}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${app.badgeColor}`}>
                        {app.badge}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="text-sm text-gray-600 leading-relaxed">{app.desc}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {app.formats.map((f) => (
                        <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                      <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                      <span>{app.how}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calibre tip */}
          <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 leading-relaxed">
              <strong>Calibre a konverze formátů:</strong> Máte EPUB a potřebujete MOBI pro Kindle?
              V Calibre klikněte pravým tlačítkem na knihu → Konvertovat → a vyberte cílový formát.
              Calibre podporuje desítky formátů v obou směrech.
            </div>
          </div>
        </div>

        <aside className="hidden lg:block w-60 shrink-0 space-y-6">
          <JakCistNav currentPath="/jak-cist-eknihy/windows-mac" />
        </aside>
      </div>
    </AppLayout>
  );
}
