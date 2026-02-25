import type { Metadata } from "next";
import Link from "next/link";
import AppLayout from "@/components/app-layout";
import JakCistNav from "@/components/jak-cist-nav";
import { ArrowLeft, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Jak číst e-knihy na Amazon Kindle | Eknihyzdarma.cz",
  description:
    "Průvodce čtením e-knih na Amazon Kindle. Jak přenést EPUB nebo MOBI na Kindle pomocí USB, Calibre nebo Send to Kindle. Formáty, tipy a doporučení.",
  alternates: { canonical: "/jak-cist-eknihy/kindle" },
  openGraph: { title: "Amazon Kindle – jak číst e-knihy | Eknihyzdarma.cz" },
};

const formats = [
  { name: "MOBI", ok: true, note: "Nativní Kindle formát, plná podpora" },
  { name: "AZW3", ok: true, note: "Vylepšený Kindle formát (novější verze)" },
  { name: "EPUB", ok: true, note: "Podporováno od roku 2022 (přes Send to Kindle)" },
  { name: "PDF", ok: true, note: "Podporováno, ale méně pohodlné na malé obrazovce" },
];

const methods = [
  {
    title: "Send to Kindle (doporučeno)",
    badge: "Nejjednodušší",
    badgeColor: "bg-emerald-100 text-emerald-700",
    steps: [
      'Přejděte na send.amazon.com a přihlaste se svým Amazon účtem.',
      'Klikněte na "Nahrát soubor" a vyberte stažený EPUB nebo MOBI soubor.',
      'Kniha se automaticky synchronizuje do vašeho Kindle (vyžaduje Wi-Fi).',
      'Nemusíte nic instalovat – funguje v prohlížeči přímo.',
    ],
    tip: "Send to Kindle podporuje EPUB od roku 2022 – nemusíte konvertovat.",
  },
  {
    title: "USB kabel",
    badge: "Bez internetu",
    badgeColor: "bg-blue-100 text-blue-700",
    steps: [
      'Připojte Kindle k počítači USB kabelem.',
      'Kindle se zobrazí jako USB disk.',
      'Zkopírujte soubor (MOBI nebo EPUB) do složky "documents" na Kindle.',
      'Odpojte Kindle a kniha se zobrazí v knihovně.',
    ],
    tip: "Pro EPUB formát přes USB je doporučeno nejdříve nahrát přes Send to Kindle.",
  },
  {
    title: "Calibre (konverze a přenos)",
    badge: "Pro pokročilé",
    badgeColor: "bg-purple-100 text-purple-700",
    steps: [
      "Stáhněte a nainstalujte Calibre (calibre-ebook.com) – zdarma.",
      "Přidejte EPUB soubor do knihovny Calibre.",
      "Klikněte pravým tlačítkem → Konvertovat → do MOBI nebo AZW3.",
      "Připojte Kindle a v Calibre zvolte Odeslat do zařízení.",
    ],
    tip: "Calibre umí také organizovat celou knihovnu a spravovat metadata knih.",
  },
];

export default function KindlePage() {
  return (
    <AppLayout>
      <div className="flex gap-8">
        {/* Hlavní obsah */}
        <div className="flex-1 min-w-0 space-y-8 max-w-3xl">
          <Link
            href="/jak-cist-eknihy"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Zpět na přehled
          </Link>

          {/* Header */}
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-amber-50 border border-amber-100">
            <div className="text-4xl shrink-0">📖</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Amazon Kindle</h1>
              <p className="text-gray-600 mt-1 leading-relaxed">
                Amazon Kindle je nejpopulárnější e-ink čtečka na světě. Má nízkou spotřebu, výborný
                displej i na přímém slunci a výdrž baterie v týdnech. Ideální pro pohodlné čtení.
              </p>
            </div>
          </div>

          {/* Podporované formáty */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Podporované formáty</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formats.map((f) => (
                <div key={f.name} className="p-3 rounded-xl border border-gray-200 bg-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="font-bold text-gray-900">{f.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{f.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Metody přenosu */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Jak přenést e-knihu na Kindle</h2>
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

          {/* Upozornění */}
          <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Starší modely Kindle:</strong> Zařízení s firmware starším než 5.13.7
              nepodporují nativní EPUB. V takovém případě použijte formát MOBI nebo konvertujte
              přes Calibre.
            </div>
          </div>

          {/* Tip – česká klávesnice */}
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <Lightbulb className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Čeština na Kindle:</strong> Novější Kindle (Paperwhite 4. gen a výše) mají
              češtinu zabudovanou. V nastavení zvolte Jazyk → Čeština. Starší modely ji nemusí
              podporovat.
            </div>
          </div>
        </div>

        {/* Pravý sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 space-y-6">
          <JakCistNav currentPath="/jak-cist-eknihy/kindle" />
        </aside>
      </div>
    </AppLayout>
  );
}
