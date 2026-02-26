import type { Metadata } from "next";
import AppLayout from "@/components/app-layout";

export const metadata: Metadata = {
  title: "Ochrana soukromí",
  description: "Informace o zpracování osobních údajů a používání souborů cookies na webu Eknihyzdarma.cz.",
  alternates: { canonical: "/ochrana-soukromi" },
  robots: { index: true, follow: true },
};

export default function OchranaPrivacy() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-10 py-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ochrana soukromí</h1>
          <p className="text-sm text-gray-400">Naposledy aktualizováno: únor 2025</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">1. Provozovatel webu</h2>
          <p className="text-gray-600 leading-relaxed">
            Provozovatelem webových stránek <strong>eknihyzdarma.cz</strong> je fyzická osoba provozující web jako
            nekomerční knihovní projekt. Kontakt:{" "}
            <a href="mailto:info@eknihyzdarma.cz" className="text-brand hover:underline">
              info@eknihyzdarma.cz
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">2. Jaké údaje shromažďujeme</h2>
          <p className="text-gray-600 leading-relaxed">
            Web automaticky sbírá anonymizovaná data o návštěvnosti prostřednictvím služby Google Analytics (GA4).
            Jedná se zejména o:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
            <li>typ prohlížeče a operačního systému</li>
            <li>přibližná geografická poloha (stát, kraj)</li>
            <li>navštívené stránky a doba strávená na webu</li>
            <li>zdroj návštěvy (přímý vstup, vyhledávač, odkaz)</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Pokud se zaregistrujete nebo přihlásíte, ukládáme vaši e-mailovou adresu pro účely správy účtu.
            E-mailové adresy přihlášené k newsletteru jsou uchovávány po dobu trvání souhlasu.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">3. Soubory cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            Tento web používá soubory cookies. Cookies jsou malé textové soubory ukládané do vašeho prohlížeče.
            Používáme následující typy:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 pr-4 font-semibold text-gray-700">Služba</th>
                  <th className="py-2 pr-4 font-semibold text-gray-700">Účel</th>
                  <th className="py-2 font-semibold text-gray-700">Typ</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4">Google Analytics (GA4)</td>
                  <td className="py-2 pr-4">Statistiky návštěvnosti</td>
                  <td className="py-2">Analytické</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4">Google AdSense</td>
                  <td className="py-2 pr-4">Zobrazování reklam</td>
                  <td className="py-2">Reklamní</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Eknihyzdarma.cz</td>
                  <td className="py-2 pr-4">Přihlášení, cookie souhlas</td>
                  <td className="py-2">Nezbytné</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Analytické a reklamní cookies ukládáme pouze s vaším souhlasem, který udělujete prostřednictvím
            lišty zobrazené při první návštěvě. Souhlas můžete kdykoli odvolat smazáním dat prohlížeče
            (localStorage a cookies).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">4. Třetí strany</h2>
          <p className="text-gray-600 leading-relaxed">
            Data o návštěvnosti jsou předávána společnosti <strong>Google LLC</strong> (USA) jako zpracovateli dle
            smlouvy o zpracování dat (DPA). Google Analytics 4 zpracovává data v souladu s GDPR a využívá
            standardní smluvní doložky EU. Více informací:{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              Zásady ochrany soukromí Google
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">5. Vaše práva</h2>
          <p className="text-gray-600 leading-relaxed">
            V souladu s nařízením GDPR máte právo:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
            <li>na přístup ke svým osobním údajům</li>
            <li>na opravu nebo výmaz svých údajů</li>
            <li>na omezení zpracování</li>
            <li>odvolat souhlas se zpracováním kdykoli</li>
            <li>podat stížnost u Úřadu pro ochranu osobních údajů (<a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">uoou.cz</a>)</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Svá práva můžete uplatnit e-mailem na adrese{" "}
            <a href="mailto:info@eknihyzdarma.cz" className="text-brand hover:underline">
              info@eknihyzdarma.cz
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">6. Zabezpečení</h2>
          <p className="text-gray-600 leading-relaxed">
            Web je provozován přes zabezpečené připojení HTTPS. Hesla uživatelů jsou hashována a nikdy nejsou
            ukládána v čitelné podobě. Přístup k datům je omezen pouze na provozovatele webu.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">7. Změny tohoto dokumentu</h2>
          <p className="text-gray-600 leading-relaxed">
            Vyhrazujeme si právo tento dokument aktualizovat. Aktuální verze je vždy dostupná na této stránce.
            Při podstatných změnách vás informujeme prostřednictvím newsletteru (pokud jste přihlášeni).
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
