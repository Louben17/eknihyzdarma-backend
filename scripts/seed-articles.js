const STRAPI_URL = process.env.STRAPI_URL || 'https://eknihyzdarma-backend-1.onrender.com';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('ERROR: STRAPI_TOKEN is required.');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${STRAPI_TOKEN}`,
  'Content-Type': 'application/json',
};

const articles = [
  {
    title: 'Vítejte v nové knihovně e-knih zdarma',
    slug: 'vitejte-v-nove-knihovne',
    perex: 'Spustili jsme novou verzi webu s vylepšeným přehledným katalogem a stovkami knih ke stažení zdarma.',
    content: 'Rádi vám představujeme novou verzi webu eknihyzdarma.cz. Najdete zde přes 400 českých e-knih ke stažení zdarma ve formátech PDF, EPUB a MOBI.\n\nNa webu naleznete klasická literární díla, pohádky, historické romány i odbornou literaturu. Vše je dostupné zdarma a bez registrace.\n\nTěšíme se na vaše návštěvy a přejeme příjemné čtení!',
    publishedAt: '2026-02-23T10:00:00.000Z',
  },
  {
    title: 'Tipy na čtení: nejlepší české klasiky zdarma',
    slug: 'tipy-na-cteni-ceske-klasiky',
    perex: 'Připravili jsme výběr nejlepších českých klasiků, které si můžete stáhnout zdarma. Od Nerudy po Čapka – vše na jednom místě.',
    content: 'Vybrali jsme pro vás nejoblíbenější české klasiky dostupné zdarma ke stažení.\n\nDoporučujeme začít Povídkami malostranскими od Jana Nerudy, pokračovat Babičkou od Boženy Němcové a nezapomenout na díla Karla Čapka.\n\nVšechny knihy jsou dostupné ve formátech PDF a EPUB. Stáhnout je můžete bez registrace jedním kliknutím.',
    publishedAt: '2026-02-22T10:00:00.000Z',
  },
];

async function createArticle(data) {
  const res = await fetch(`${STRAPI_URL}/api/articles`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }

  return res.json();
}

(async () => {
  for (const article of articles) {
    try {
      const result = await createArticle(article);
      console.log(`✅ Vytvořen: "${result.data.title}" (${result.data.documentId})`);
    } catch (e) {
      console.error(`❌ Chyba: ${e.message}`);
    }
  }
})();
