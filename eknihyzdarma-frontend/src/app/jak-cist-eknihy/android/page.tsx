import type { Metadata } from "next";
import Link from "next/link";
import AppLayout from "@/components/app-layout";
import JakCistNav from "@/components/jak-cist-nav";
import { ArrowLeft, CheckCircle2, Lightbulb, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Jak číst e-knihy na Androidu – nejlepší aplikace | Eknihyzdarma.cz",
  description:
    "Nejlepší aplikace pro čtení e-knih na Android telefonech a tabletech. Moon+ Reader, Google Play Books, Kindle, Lithium. Jak otevřít EPUB soubor na Androidu.",
  alternates: { canonical: "/jak-cist-eknihy/android" },
  openGraph: { title: "Android – jak číst e-knihy | Eknihyzdarma.cz" },
};

const apps = [
  {
    name: "Moon+ Reader",
    badge: "Nejoblíbenější",
    badgeColor: "bg-emerald-100 text-emerald-700",
    star: true,
    desc: "Nejpopulárnější čtečka pro Android. Výborná podpora EPUB, MOBI a PDF. Bohaté nastavení fontu, mezery, animace stránek a noční režim. Zdarma s volitelnou Pro verzí.",
    formats: ["EPUB", "MOBI", "PDF", "FB2"],
    how: "Stáhněte EPUB soubor → sdílejte přes Otevřít v → Moon+ Reader. Nebo v aplikaci: Přidat knihu → vyberte soubor.",
  },
  {
    name: "Google Play Books",
    badge: "Zdarma",
    badgeColor: "bg-blue-100 text-blue-700",
    star: false,
    desc: "Vestavěná nebo snadno dostupná aplikace Googlu. Stačí nahrát EPUB soubor přes web a automaticky se zobrazí v aplikaci. Synchronizuje čtení mezi zařízeními.",
    formats: ["EPUB", "PDF"],
    how: "Na play.google.com/books → Nahrát soubory → vyberte EPUB → otevřete v aplikaci na telefonu.",
  },
  {
    name: "Kindle",
    badge: "Zdarma",
    badgeColor: "bg-orange-100 text-orange-700",
    star: false,
    desc: "Amazon Kindle aplikace pro Android. Ideální pokud máte i fyzický Kindle. EPUB a MOBI soubory přeneste přes Send to Kindle a čtěte na všech zařízeních zároveň.",
    formats: ["MOBI", "EPUB", "PDF"],
    how: "Přes send.amazon.com nahrajte soubor → přihlaste se Kindle účtem → soubor se zobrazí v aplikaci.",
  },
  {
    name: "Lithium EPUB Reader",
    badge: "Minimalistický",
    badgeColor: "bg-purple-100 text-purple-700",
    star: false,
    desc: "Čistý, rychlý a bez reklam. Výborná podpora EPUB standardu, přizpůsobitelné čtení, skvělý na tabletech. Ideální volba pro ty, kdo chtějí jednoduchost.",
    formats: ["EPUB"],
    how: "Otevřete soubor správcem souborů → vyberte Lithium. Nebo přidejte soubory přímo v aplikaci.",
  },
];

export default function AndroidPage() {
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
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-green-50 border border-green-100">
            <div className="text-4xl shrink-0">🤖</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Android</h1>
              <p className="text-gray-600 mt-1 leading-relaxed">
                Android nabízí nejširší výběr čtecích aplikací. Ať máte telefon nebo tablet,
                najdete skvělou bezplatnou aplikaci pro čtení e-knih ve formátu EPUB nebo MOBI.
              </p>
            </div>
          </div>

          {/* Quickstart */}
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Nejrychlejší způsob – přímé otevření souboru
            </h2>
            <ol className="space-y-2">
              {[
                "Nainstalujte Moon+ Reader nebo Google Play Books z Obchodu Play.",
                "Na stránce knihy klepněte na \"Stáhnout EPUB\".",
                "Po stažení klepněte na soubor v oznámeních nebo ve Stažené soubory.",
                "Vyberte čtecí aplikaci → Otevřít. Kniha se automaticky přidá do knihovny.",
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
            <h2 className="text-lg font-bold text-gray-900 mb-4">Doporučené aplikace</h2>
            <div className="space-y-4">
              {apps.map((app) => (
                <div key={app.name} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
                      {app.name}
                      {app.star && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />}
                    </h3>
                    <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${app.badgeColor}`}>
                      {app.badge}
                    </span>
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

          {/* Tip */}
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <Lightbulb className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>Tip pro tablety:</strong> Na Android tabletech vypadá čtení skvěle v Moon+
              Reader s nastavením dvou sloupců. PDF funguje dobře i na větší obrazovce.
            </p>
          </div>
        </div>

        <aside className="hidden lg:block w-60 shrink-0 space-y-6">
          <JakCistNav currentPath="/jak-cist-eknihy/android" />
        </aside>
      </div>
    </AppLayout>
  );
}
