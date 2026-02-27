/**
 * Vytvoří článek o Gutenberg integraci včetně cover fotky
 * Použití: STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=xxx node scripts/create-gutenberg-article.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('❌ Chybí STRAPI_TOKEN');
  process.exit(1);
}

// Obrázek: klasické knihy na polici (Unsplash, volné použití - Jaredd Craig)
const IMAGE_URL = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80';
const IMAGE_NAME = 'gutenberg-classic-books.jpg';

const ARTICLE = {
  title: 'Nově: 10 000 anglických klasik z Project Gutenberg zdarma ke stažení',
  slug: 'gutenberg-anglicke-klasiky-zdarma',
  perex: 'Rozšiřujeme naši knihovnu o tisíce světových klasik v angličtině. Díky spolupráci s Project Gutenberg nyní nabízíme ke stažení díla Shakespeara, Jane Austen, Marka Twaina, Arthura Conana Doyla a stovek dalších autorů – zcela zdarma.',
  content: `Jsme rádi, že vám můžeme oznámit velké rozšíření naší knihovny. Do sekce **🇬🇧 English Books** jsme přidali přes 10 000 nejpopulárnějších anglických e-knih z projektu Project Gutenberg – největší bezplatné digitální knihovny na světě.

## Co najdete v nové sekci?

Project Gutenberg digitalizuje knihy, jejichž autorská práva vypršela, a zpřístupňuje je zdarma celému světu. V naší nové sekci tak naleznete skutečné literární poklady:

- **Dobrodružství a klasika** – Mark Twain, Jack London, Jules Verne
- **Detektivky** – Arthur Conan Doyle a jeho nesmrtelný Sherlock Holmes
- **Romantická literatura** – Jane Austen, Charlotte Brontë
- **Horory a gotika** – Bram Stoker (Dracula), Mary Shelley (Frankenstein)
- **Sci-fi** – H.G. Wells, Edgar Rice Burroughs
- **Filozofie a literatura faktu** – Platón, Friedrich Nietzsche, Charles Darwin

## Formáty ke stažení

Knihy jsou dostupné ke stažení ve formátu **EPUB** (pro většinu čteček) a u mnoha titulů také **MOBI** (pro čtečky Kindle). Stahování je zcela zdarma, bez registrace.

## Automatické aktualizace

Nové tituly přibývají každý týden automaticky – jakmile Gutenberg přidá novou knihu, objeví se i u nás.

Celou sekci najdete na odkazu **English Books** v levém menu.`,
};

async function downloadImage() {
  console.log('📥 Stahuji obrázek z Unsplash...');
  const res = await fetch(IMAGE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadImage(imageBuffer) {
  console.log('⬆️  Nahrávám obrázek do Strapi...');
  const formData = new FormData();
  formData.append('files', new Blob([imageBuffer], { type: 'image/jpeg' }), IMAGE_NAME);

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data[0].id;
}

async function createArticle(coverId) {
  console.log('📝 Vytvářím článek...');
  const res = await fetch(`${STRAPI_URL}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify({
      data: {
        ...ARTICLE,
        cover: coverId,
        publishedAt: new Date().toISOString(),
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create article error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data;
}

async function main() {
  try {
    const imageBuffer = await downloadImage();
    const coverId = await uploadImage(imageBuffer);
    const article = await createArticle(coverId);
    console.log(`\n✅ Článek vytvořen!`);
    console.log(`   ID: ${article.id}`);
    console.log(`   Slug: ${article.slug || ARTICLE.slug}`);
    console.log(`   URL: ${STRAPI_URL.replace('localhost:1337', 'eknihyzdarma.cz')}/aktuality/${ARTICLE.slug}`);
  } catch (err) {
    console.error('❌ Chyba:', err.message);
    process.exit(1);
  }
}

main();
