/**
 * Import skript: Project Gutenberg → Strapi
 *
 * Použití:
 *   STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=xxx node scripts/import-gutenberg.js --limit 1
 *   STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=xxx node scripts/import-gutenberg.js --limit 10000
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const GUTENDEX_API = 'https://gutendex.com/books/?languages=en&sort=popular';

if (!STRAPI_TOKEN) {
  console.error('❌ Chybí STRAPI_TOKEN env variable');
  process.exit(1);
}

// Parsuj --limit argument
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1], 10) : 100;
console.log(`📚 Importuji max ${LIMIT} knih z Project Gutenberg...`);

// Mapování subjects/bookshelves → zjednodušená kategorie
function mapToCategory(subjects = [], bookshelves = []) {
  const allText = [...subjects, ...bookshelves].join(' ').toLowerCase();
  if (allText.includes('science fiction') || allText.includes('science-fiction')) return 'Science Fiction';
  if (allText.includes('detective') || allText.includes('mystery') || allText.includes('crime')) return 'Mystery';
  if (allText.includes('adventure')) return 'Adventure';
  if (allText.includes('horror') || allText.includes('gothic')) return 'Horror';
  if (allText.includes('juvenile') || allText.includes("children's") || allText.includes('children')) return 'Children';
  if (allText.includes('romance') || allText.includes('love stories')) return 'Romance';
  if (allText.includes('historical fiction') || allText.includes('historical')) return 'Historical';
  if (allText.includes('poetry') || allText.includes('poems') || allText.includes('verse')) return 'Poetry';
  if (allText.includes('biography') || allText.includes('autobiography') || allText.includes('memoir')) return 'Biography';
  if (allText.includes('philosophy') || allText.includes('ethics') || allText.includes('morality')) return 'Philosophy';
  if (allText.includes('drama') || allText.includes('plays') || allText.includes('theatre')) return 'Drama';
  if (allText.includes('fiction')) return 'Fiction';
  return 'Classic';
}

// Získej EPUB URL z formátů
function getEpubUrl(formats = {}) {
  // Preferuj epub s obrázky, pak bez, pak plain text
  return (
    formats['application/epub+zip'] ||
    formats['text/html'] ||
    formats['text/plain; charset=utf-8'] ||
    formats['text/plain'] ||
    null
  );
}

// Získej cover URL
function getCoverUrl(formats = {}) {
  return formats['image/jpeg'] || null;
}

// Zkrátí description na max 1000 znaků
function truncate(text, max = 1000) {
  if (!text) return null;
  return text.length > max ? text.slice(0, max) + '...' : text;
}

// Čekání (throttling)
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Vytvoří knihu v Strapi
async function createInStrapi(bookData) {
  const res = await fetch(`${STRAPI_URL}/api/gutenberg-books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify({ data: bookData }),
  });

  if (res.status === 409 || res.status === 400) {
    // Duplicitní gutenbergId nebo jiná validace – přeskočit
    return null;
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Strapi error ${res.status}: ${err}`);
  }

  return res.json();
}

async function main() {
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  let page = 1;
  let nextUrl = `${GUTENDEX_API}&page=${page}`;

  while (imported < LIMIT && nextUrl) {
    console.log(`\n📄 Stránka ${page} (importováno: ${imported}/${LIMIT})...`);

    let gutendexData;
    try {
      const res = await fetch(nextUrl);
      gutendexData = await res.json();
    } catch (err) {
      console.error(`❌ Chyba při načítání Gutendex stránky ${page}:`, err.message);
      break;
    }

    const books = gutendexData.results || [];
    nextUrl = gutendexData.next || null;

    for (const book of books) {
      if (imported >= LIMIT) break;

      const authorName = book.authors?.[0]?.name
        ? book.authors[0].name.split(', ').reverse().join(' ')
        : 'Unknown Author';

      const epubUrl = getEpubUrl(book.formats);
      if (!epubUrl) {
        skipped++;
        continue; // Přeskočit knihy bez dostupného formátu
      }

      const coverUrl = getCoverUrl(book.formats);
      const category = mapToCategory(book.subjects, book.bookshelves);

      const bookData = {
        title: book.title,
        author: authorName,
        gutenbergId: book.id,
        description: truncate(book.subjects?.join(', '), 500) || null,
        coverUrl: coverUrl,
        epubUrl: epubUrl,
        subjects: book.subjects || [],
        category: category,
        gutenbergDownloads: book.download_count || 0,
        downloads: 0,
      };

      try {
        const result = await createInStrapi(bookData);
        if (result) {
          imported++;
          if (imported % 50 === 0) {
            console.log(`  ✅ ${imported} knih importováno...`);
          }
        } else {
          skipped++;
        }
      } catch (err) {
        errors++;
        console.error(`  ❌ Chyba pro knihu "${book.title}":`, err.message);
      }

      // Throttling: 100ms mezi knihami
      await sleep(100);
    }

    page++;
    // Throttling: 1s mezi stránkami Gutendex API
    if (nextUrl && imported < LIMIT) {
      await sleep(1000);
    }
  }

  console.log('\n====================================');
  console.log(`✅ Import dokončen!`);
  console.log(`   Importováno: ${imported}`);
  console.log(`   Přeskočeno:  ${skipped}`);
  console.log(`   Chyby:       ${errors}`);
  console.log('====================================');
}

main().catch((err) => {
  console.error('❌ Fatální chyba:', err);
  process.exit(1);
});
