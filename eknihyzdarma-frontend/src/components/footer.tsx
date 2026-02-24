"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Send, FileText, Truck, ShieldCheck, Phone } from "lucide-react";
import { useState } from "react";

const quickLinks = [
  { href: "/", label: "Knihy" },
  { href: "/kategorie", label: "Kategorie" },
  { href: "/autori", label: "Autoři" },
  { href: "/aktuality", label: "Aktuality" },
];

const legalLinks = [
  { href: "/obchodni-podminky", label: "Obchodní podmínky", icon: FileText },
  { href: "/zpusob-dodani", label: "Způsob dodání zboží", icon: Truck },
  { href: "/reklamacni-rad", label: "Reklamační řád", icon: ShieldCheck },
  { href: "/kontakty", label: "Kontakty", icon: Phone },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewsletter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setEmail("");
      } else {
        setError(data.error || "Něco se pokazilo, zkuste to znovu.");
      }
    } catch {
      setError("Nepodařilo se připojit k serveru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      {/* Hlavní sekce */}
      <div className="max-w-none px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Branding */}
          <div className="space-y-4">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="EKnihy zdarma"
                width={160}
                height={48}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Největší česká knihovna volně dostupných e-knih. Stovky titulů ke stažení zdarma bez registrace.
            </p>
            <a
              href="mailto:info@eknihyzdarma.cz"
              className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80 transition-colors"
            >
              <Mail className="h-4 w-4" />
              info@eknihyzdarma.cz
            </a>
          </div>

          {/* Rychlé odkazy */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Procházet
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand group-hover:bg-brand/70 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Právní */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Informace
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-brand transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Newsletter
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Jednou měsíčně vám pošleme novinky o nových knihách a akcích.
            </p>
            {submitted ? (
              <div className="bg-brand/15 border border-brand/30 rounded-lg px-4 py-3 text-sm text-brand flex items-center gap-2">
                <Send className="h-4 w-4" />
                Děkujeme za přihlášení!
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Váš e-mail"
                    required
                    disabled={loading}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors disabled:opacity-50"
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-brand to-brand-purple hover:from-brand/90 hover:to-brand-purple/90 disabled:opacity-60 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  {loading ? "Odesílám..." : "Přihlásit se k odběru"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Dělící čára */}
      <div className="border-t border-slate-800" />

      {/* Spodní lišta */}
      <div className="px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} EKnihyzdarma.cz — Odborné texty{" "}
          <a
            href="https://cs.wikipedia.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors underline underline-offset-2"
          >
            Wikipedia
          </a>
        </p>
        <nav className="flex items-center gap-4 flex-wrap justify-center">
          {[
            { href: "/kontakty", label: "Kontakty" },
            { href: "/zpusob-dodani", label: "Způsob dodání" },
            { href: "/mapa-stranek", label: "Mapa stránek" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
