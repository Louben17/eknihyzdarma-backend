import type { Metadata } from "next";
import Link from "next/link";
import AppLayout from "@/components/app-layout";
import { BookOpen, ChevronRight, CheckCircle2, XCircle, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Jak číst e-knihy – průvodce pro všechna zařízení | Eknihyzdarma.cz",
  description:
    "Kompletní průvodce čtením e-knih na všech zařízeních: Kindle, čtečky, iPhone, iPad, Android, Windows a Mac. Zjistěte, jaký formát vybrat a jak e-knihu přenést.",
  alternates: { canonical: "/jak-cist-eknihy" },
  openGraph: {
    title: "Jak číst e-knihy | Eknihyzdarma.cz",
    description:
      "Průvodce čtením e-knih na Kindle, čtečkách, iPhonu, iPadu, Androidu i PC/Mac.",
  },
};

const formats = [
  {
    name: "EPUB",
    badge: "Nejlepší volba",
    cardColor: "border-emerald-200 bg-emerald-50",
    badgeColor: "bg-emerald-100 text-emerald-700",
    description:
      "Universální otevřený formát e-knih. Text se přizpůsobí každé obrazovce, lze nastavit velikost písma i font. Ideální pro drtivou většinu zařízení.",
    yes: "Čtečky, Apple, Android, PC/Mac",
    no: "Starší Kindle (před rokem 2022)",
  },
  {
    name: "MOBI",
    badge: "Pro Amazon Kindle",
    cardColor: "border-orange-200 bg-orange-50",
    badgeColor: "bg-orange-100 text-orange-700",
    description:
      "Proprietární formát Amazonu, optimalizovaný pro Kindle zařízení. Nabízí výborné fonty a čtení na Kindle zařízeních.",
    yes: "Amazon Kindle (všechny generace)",
    no: "Ostatní čtečky, Apple Books, Google Play Books",
  },
  {
    name: "PDF",
    badge: "Pro PC a tablety",
    cardColor: "border-red-200 bg-red-50",
    badgeColor: "bg-red-100 text-red-700",
    description:
      "Pevný layout – stránky vypadají vždy stejně jako v tisknuté knize. Na malých e-ink čtečkách může být text příliš malý.",
    yes: "PC, Mac, velké tablety",
    no: "Malé e-ink čtečky (Kindle, PocketBook)",
  },
];

const devices = [
  {
    href: "/jak-cist-eknihy/kindle",
    name: "Amazon Kindle",
    desc: "Populární dedikovaná e-ink čtečka. Dnes podporuje i EPUB (od 2022). Ideální pro pohodlné čtení bez rušení.",
    formats: ["EPUB", "MOBI", "PDF"],
    emoji: "📖",
    bg: "bg-amber-50",
    border: "hover:border-amber-300",
  },
  {
    href: "/jak-cist-eknihy/ctecky",
    name: "Ostatní čtečky",
    desc: "PocketBook, Kobo, Tolino a další e-ink čtečky. Výborná podpora EPUB bez potřeby konverze.",
    formats: ["EPUB", "PDF"],
    emoji: "📚",
    bg: "bg-blue-50",
    border: "hover:border-blue-300",
  },
  {
    href: "/jak-cist-eknihy/apple",
    name: "Apple (iPhone / iPad / Mac)",
    desc: "Vestavěná Apple Books aplikace nebo Kindle, Google Play Books. Pohodlné čtení na každém Apple zařízení.",
    formats: ["EPUB", "PDF"],
    emoji: "🍎",
    bg: "bg-gray-50",
    border: "hover:border-gray-400",
  },
  {
    href: "/jak-cist-eknihy/android",
    name: "Android",
    desc: "Google Play Books, Moon+ Reader nebo Kindle. Android nabízí nejširší výběr čtecích aplikací zdarma.",
    formats: ["EPUB", "MOBI", "PDF"],
    emoji: "🤖",
    bg: "bg-green-50",
    border: "hover:border-green-300",
  },
  {
    href: "/jak-cist-eknihy/windows-mac",
    name: "Windows / Mac",
    desc: "Calibre, Thorium Reader nebo Kindle pro PC/Mac. Čtení přímo v prohlížeči nebo v plnohodnotné aplikaci.",
    formats: ["EPUB", "MOBI", "PDF"],
    emoji: "💻",
    bg: "bg-purple-50",
    border: "hover:border-purple-300",
  },
];

const steps = [
  { n: "1", title: "Vyberte knihu", desc: "Najděte knihu v naší knihovně a klikněte na ni." },
  { n: "2", title: "Zvolte formát", desc: "Stáhněte EPUB (většina zařízení) nebo MOBI (Kindle)." },
  { n: "3", title: "Přeneste nebo otevřete", desc: "Soubor otevřete přímo, nebo ho přenesete do čtečky." },
  { n: "4", title: "Čtěte!", desc: "Nastavte si font a velikost a užívejte čtení." },
];

export default function JakCistEknihy() {
  return (
    <AppLayout>
      <div className="max-w-4xl space-y-12">

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-brand/5 via-brand/10 to-transparent p-8 border border-brand/10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand rounded-xl text-white shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Jak číst e-knihy?</h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                Všechny e-knihy na Eknihyzdarma.cz jsou ke stažení zdarma ve formátech{" "}
                <strong>EPUB</strong>, <strong>MOBI</strong> a <strong>PDF</strong>.
                Vyberte si zařízení, na kterém chcete číst, a my vás provedeme celým procesem.
              </p>
            </div>
          </div>
        </div>

        {/* Jak to funguje – kroky */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Jak to funguje?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-start p-4 rounded-xl bg-white border border-gray-200">
                <span className="text-2xl font-black text-brand/30 mb-2">{s.n}</span>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formáty */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Formáty e-knih</h2>
          <p className="text-gray-500 text-sm mb-5">
            Na každé stránce knihy nabízíme dostupné formáty ke stažení. Zde je přehled, který zvolit.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {formats.map((fmt) => (
              <div key={fmt.name} className={`rounded-xl border p-5 ${fmt.cardColor}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-gray-900">{fmt.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${fmt.badgeColor}`}>
                    {fmt.badge}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{fmt.description}</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600">{fmt.yes}</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-gray-400">{fmt.no}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zařízení */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vyberte své zařízení</h2>
          <p className="text-gray-500 text-sm mb-5">
            Klikněte na vaše zařízení a zobrazíme vám podrobný průvodce s doporučenými aplikacemi.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className={`group flex flex-col p-5 rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md ${d.border}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`text-2xl p-2.5 rounded-xl ${d.bg} shrink-0`}>
                    {d.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand transition-colors leading-tight">
                      {d.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {d.formats.map((f) => (
                        <span
                          key={f}
                          className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 flex-1 leading-relaxed">{d.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-sm text-brand font-medium">
                  Zobrazit průvodce
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Nevíte si rady?</strong> Pro většinu zařízení doporučujeme stáhnout formát{" "}
            <strong>EPUB</strong> – funguje na čtečkách, telefonech i počítačích. Máte-li Amazon
            Kindle, vyberte <strong>MOBI</strong>.
          </p>
        </div>

      </div>
    </AppLayout>
  );
}
