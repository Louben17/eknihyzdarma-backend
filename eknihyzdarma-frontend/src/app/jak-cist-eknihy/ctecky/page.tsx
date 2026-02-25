import type { Metadata } from "next";
import Link from "next/link";
import AppLayout from "@/components/app-layout";
import JakCistNav from "@/components/jak-cist-nav";
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Jak číst e-knihy na čtečkách – PocketBook, Kobo, Tolino | Eknihyzdarma.cz",
  description:
    "Průvodce čtením e-knih na e-ink čtečkách PocketBook, Kobo, Tolino a dalších. Jak přenést EPUB soubor přes USB, SD kartu nebo Calibre.",
  alternates: { canonical: "/jak-cist-eknihy/ctecky" },
  openGraph: { title: "Ostatní čtečky – jak číst e-knihy | Eknihyzdarma.cz" },
};

const devices = [
  {
    name: "PocketBook",
    desc: "Česká oblíbenec. Výborná podpora EPUB, možnost čtení v češtině, Wi-Fi, integrovaný slovník.",
    format: "EPUB",
    bg: "bg-blue-50",
  },
  {
    name: "Kobo",
    desc: "Populární čtečka od Rakuten. Nativní EPUB podpora, synchronizace s cloudovou knihovnou.",
    format: "EPUB",
    bg: "bg-teal-50",
  },
  {
    name: "Tolino",
    desc: "Německá alternativa s důrazem na soukromí. Výborný displej, podpora EPUB a PDF.",
    format: "EPUB",
    bg: "bg-orange-50",
  },
  {
    name: "Ostatní Android čtečky",
    desc: "Čtečky s Androidem (např. starší Onyx). Lze nainstalovat libovolnou čtecí aplikaci.",
    format: "EPUB / MOBI",
    bg: "bg-green-50",
  },
];

const formats = [
  { name: "EPUB", ok: true, note: "Plná nativní podpora – nejlepší volba" },
  { name: "PDF", ok: true, note: "Podporováno, ale pevný layout" },
  { name: "MOBI", ok: false, note: "Většinou nepodporováno (pouze Kindle)" },
  { name: "TXT / FB2", ok: true, note: "Podpora na většině čteček" },
];

const methods = [
  {
    title: "USB kabel (nejjednodušší)",
    badge: "Doporučeno",
    badgeColor: "bg-emerald-100 text-emerald-700",
    steps: [
      "Připojte čtečku k počítači USB kabelem.",
      "Čtečka se zobrazí jako USB disk (nebo paměťová karta).",
      'Zkopírujte EPUB soubor do složky "Books" nebo přímo na kořen disku.',
      "Odpojte čtečku. Kniha se automaticky zobrazí v knihovně.",
    ],
    tip: "Funkce se může lišit podle výrobce – PocketBook má složku \"Books\", Kobo přijme soubory přímo z kořene.",
  },
  {
    title: "Calibre – správa a přenos",
    badge: "Pro pokročilé",
    badgeColor: "bg-purple-100 text-purple-700",
    steps: [
      "Stáhněte Calibre na calibre-ebook.com (zdarma, Windows/Mac/Linux).",
      "Přidejte EPUB soubory do knihovny Calibre.",
      "Připojte čtečku USB kabelem. Calibre ji automaticky rozpozná.",
      'Vyberte knihu, klikněte "Odeslat do zařízení" → Odeslat do hlavní paměti.',
    ],
    tip: "Calibre umí také konvertovat EPUB na jiné formáty a upravovat metadata (autor, obálka).",
  },
  {
    title: "Micro SD karta",
    badge: "Bez PC",
    badgeColor: "bg-blue-100 text-blue-700",
    steps: [
      "Vyjměte micro SD kartu z čtečky (slot bývá na boku nebo pod krytem).",
      "Vložte kartu do čtečky karet nebo adaptéru.",
      'Zkopírujte EPUB soubory do složky "Books" na SD kartě.',
      "Vložte kartu zpět do čtečky. Knihy se zobrazí v knihovně.",
    ],
    tip: "Ne všechny čtečky mají slot na SD kartu – zkontrolujte specifikace svého modelu.",
  },
];

export default function CtekyPage() {
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
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="text-4xl shrink-0">📚</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ostatní e-ink čtečky</h1>
              <p className="text-gray-600 mt-1 leading-relaxed">
                PocketBook, Kobo, Tolino a další čtečky s e-ink displejem. Tyto čtečky mají výbornou
                nativní podporu formátu EPUB – nemusíte nic konvertovat ani instalovat.
              </p>
            </div>
          </div>

          {/* Podporovaná zařízení */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Oblíbené čtečky</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {devices.map((d) => (
                <div key={d.name} className={`p-4 rounded-xl border border-gray-200 ${d.bg}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-semibold text-gray-900">{d.name}</h3>
                    <span className="text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded font-medium border border-gray-200">
                      {d.format}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-snug">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Formáty */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Podporované formáty</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formats.map((f) => (
                <div key={f.name} className="p-3 rounded-xl border border-gray-200 bg-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    {f.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                    )}
                    <span className="font-bold text-gray-900">{f.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{f.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Metody přenosu */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Jak přenést e-knihu do čtečky</h2>
            <div className="space-y-4">
              {methods.map((method) => (
                <div key={method.title} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">{method.title}</h3>
                    <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${method.badgeColor}`}>
                      {method.badge}
                    </span>
                  </div>
                  <div className="p-5">
                    <ol className="space-y-2">
                      {method.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-700">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    {method.tip && (
                      <div className="mt-4 flex gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                        <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                        {method.tip}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="flex gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <Lightbulb className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 leading-relaxed">
              <strong>Pro čtečky vždy doporučujeme EPUB.</strong> Je to nativní formát, který
              se přizpůsobí obrazovce a umožňuje nastavit vlastní font, velikost písma i mezery
              mezi řádky.
            </p>
          </div>
        </div>

        <aside className="hidden lg:block w-60 shrink-0 space-y-6">
          <JakCistNav currentPath="/jak-cist-eknihy/ctecky" />
        </aside>
      </div>
    </AppLayout>
  );
}
