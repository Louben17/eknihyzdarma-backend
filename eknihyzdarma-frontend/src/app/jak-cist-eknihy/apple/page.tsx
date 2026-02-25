import type { Metadata } from "next";
import Link from "next/link";
import AppLayout from "@/components/app-layout";
import JakCistNav from "@/components/jak-cist-nav";
import { ArrowLeft, CheckCircle2, Lightbulb, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Jak číst e-knihy na iPhone, iPad a Mac | Eknihyzdarma.cz",
  description:
    "Průvodce čtením e-knih na Apple zařízeních. Apple Books, Kindle, Google Play Books a Moon Reader na iPhonu, iPadu a Macu. Jak otevřít EPUB soubor.",
  alternates: { canonical: "/jak-cist-eknihy/apple" },
  openGraph: { title: "Apple zařízení – jak číst e-knihy | Eknihyzdarma.cz" },
};

const apps = [
  {
    name: "Apple Books",
    badge: "Předinstalováno",
    badgeColor: "bg-gray-100 text-gray-700",
    star: true,
    desc: "Vestavěná aplikace Apple. Podporuje EPUB a PDF. Nastavte si font, velikost, barvu pozadí (bílá, sépia, černá). Synchronizuje knihovnu přes iCloud.",
    formats: ["EPUB", "PDF"],
    devices: "iPhone, iPad, Mac",
    how: "Stáhněte EPUB soubor → klepněte na soubor → Otevřít v Apple Books. Nebo přetáhněte soubor do Books na Macu.",
  },
  {
    name: "Kindle (Amazon)",
    badge: "Zdarma",
    badgeColor: "bg-orange-100 text-orange-700",
    star: false,
    desc: "Aplikace Amazonu. Ideální pokud máte i fyzický Kindle – knihovna se synchronizuje mezi zařízeními. Podporuje MOBI/AZW3 a EPUB přes Send to Kindle.",
    formats: ["MOBI", "EPUB", "PDF"],
    devices: "iPhone, iPad",
    how: "Nahrajte soubor přes send.amazon.com → přihlaste se účtem → soubor se zobrazí v aplikaci.",
  },
  {
    name: "Google Play Books",
    badge: "Zdarma",
    badgeColor: "bg-blue-100 text-blue-700",
    star: false,
    desc: "Aplikace Googlu s možností nahrání vlastního EPUB nebo PDF. Automaticky přizpůsobí text, podporuje záložky a synchronizaci čtení přes zařízení.",
    formats: ["EPUB", "PDF"],
    devices: "iPhone, iPad",
    how: "Na webu play.google.com/books → Nahrát soubory → vyberte EPUB → otevřete v aplikaci na telefonu.",
  },
  {
    name: "Thorium Reader",
    badge: "Pro Mac",
    badgeColor: "bg-purple-100 text-purple-700",
    star: false,
    desc: "Moderní, otevřená čtečka pro macOS. Výborná podpora EPUB 3, přístupnost, bez reklam. Ideální pro čtení na Macu.",
    formats: ["EPUB", "PDF"],
    devices: "Mac",
    how: "Stáhněte z thorium-reader.org → nainstalujte → přetáhněte EPUB soubor do aplikace.",
  },
];

export default function ApplePage() {
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
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="text-4xl shrink-0">🍎</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Apple (iPhone, iPad, Mac)</h1>
              <p className="text-gray-600 mt-1 leading-relaxed">
                Apple zařízení mají skvělou podporu e-knih díky vestavěné aplikaci{" "}
                <strong>Apple Books</strong>. Na iPhone a iPad navíc fungují aplikace Kindle
                a Google Play Books.
              </p>
            </div>
          </div>

          {/* Quickstart */}
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Nejrychlejší způsob – otevřít EPUB přímo
            </h2>
            <ol className="space-y-2">
              {[
                "Na stránce knihy klepněte na tlačítko \"Stáhnout EPUB\".",
                "Safari zobrazí dotaz – zvolte \"Otevřít v Apple Books\".",
                "Kniha se automaticky uloží do vaší knihovny.",
                "Příště ji najdete v aplikaci Books i bez internetu.",
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
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-gray-400">{app.devices}</span>
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

          {/* Tip */}
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <Lightbulb className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>Tip pro iPad:</strong> Na větším displeji iPadu jsou e-knihy čitelné i ve
              formátu PDF. Doporučujeme ale EPUB – lze nastavit font, velikost písma a tmavý režim.
            </p>
          </div>
        </div>

        <aside className="hidden lg:block w-60 shrink-0 space-y-6">
          <JakCistNav currentPath="/jak-cist-eknihy/apple" />
        </aside>
      </div>
    </AppLayout>
  );
}
