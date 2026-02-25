/**
 * fix_categories.js
 * =================
 * Opraví špatně zařazené knihy: zahraniční autoři v "Česká literatura"
 * přesune do "Světová literatura".
 *
 * Použití:
 *   node fix_categories.js
 *
 * Strapi musí být dostupné a TOKEN nastaven níže.
 */

const https = require('https');

const TOKEN = 'f336ce288b5630eaa259b8013754b07982841afcdbaa2c58605721ee4e50c5bdecee0b6163a97be4879a93f76e6e2ca1a2add9f586de922f4064054098c104bce3ad367a46e08fd478c722cdfa51068d4292f24d12569d35444d53393c048e19f3511e56c56aff628297ce143de14954f1c1892c23d0b3722685045417b87e4c';
const BASE = 'eknihyzdarma-backend-1.onrender.com';

// Příjmení zahraničních autorů (lowercase) – rozšířená verze
const FOREIGN_SURNAMES = new Set([
  // Ruští
  'dostojevskij','tolstoj','turgenev','bulgakov','čechov','zamjatin',
  'puškin','gogol','gorkij','ostrovskij','bunin','jevtušenko',
  'saltykov-ščedrin','lermontov','kuprin','andrejev',
  // Němečtí/Rakouští
  'goethe','schiller','kafka','mann','rilke','hesse','brecht',
  'schnitzler','musil','zweig','werfel','grimmelshausen',
  'fontane','kleist','tieck','löns','storm',
  // Francouzi
  'hugo','proust','flaubert','zola','balzac','molière','voltaire',
  'dumas','maupassant','rolland','stendhal','rostand','jarry',
  'chevallier','gide','colette','racine','corneille','beaumarchais',
  'france','gautier','mérimée','nerval','verne','allais',
  'barbey','rachilde','baudelaire','anatole',
  // Italové
  'alighieri','dante','petrarca','boccaccio','pirandello','goldoni',
  'leopardi','carducci','alfieri','vergilius','gozzi','chiarelli',
  'della porta','dovizi','carletti','ariosto','tasso','machiavelli',
  // Angličané/Irové/Velšané
  'dickens','hardy','joyce','woolf','lawrence','kipling',
  'thackeray','austen','wilde','swift','shakespeare','shelley',
  'keats','blake','yeats','synge','browning','meredith','sterne',
  'fielding','defoe','chaucer','pope','gay','radcliffe','maturin',
  'lewis','beckford','james','carroll','jerome','wharton',
  'doyle','chesterton','galsworthy','bennett','lonsdale','hilton',
  'stevenson','lear','hazlitt','thomas','dylan','scott','galsworthy',
  // Američané
  'poe','london','fitzgerald','hemingway','dreiser','crane',
  'melville','lardner','heyward','bierce','saki','burns',
  'twain','whitman','faulkner','o\'neill','stein','mitchell',
  'cooper','hawthorne','sinclair',
  // Poláci
  'sienkiewicz','ossendowski','choynowski',
  // Norové/Skandinávci
  'ibsen','hamsun','andersen','strindberg','heidenstam','munthe',
  // Španělé/Latin Amerika
  'cervantes','lorca','vega','gracián','unamuno','valle-inclán',
  'camões','ruiz','calderón','tirso',
  // Antičtí/Latinisté
  'homéros','sofokles','euripidés','aristofanés',
  'ovidius','catullus','tacitus','caesar','vergilius',
  'cicero','seneca','boëthius','epiktétos',
  // Ostatní
  'hearn','la fontaine','fontaine',
  'shaw','chesterton',
]);

function isForegnAuthor(authorName) {
  if (!authorName) return false;
  const parts = authorName.split(',');
  const surname = parts[0].toLowerCase().trim();

  if (FOREIGN_SURNAMES.has(surname)) return true;

  // Ruský patronym
  if (parts[1]) {
    const words = parts[1].toLowerCase().trim().split(/\s+/);
    for (const w of words.slice(1)) {
      if (w.endsWith('ič') || w.endsWith('evna') || w.endsWith('ovna')) return true;
    }
  }

  // "von" / "de la" / "de " v příjmení
  const low = authorName.toLowerCase();
  if (low.includes(' von ') || low.startsWith('von ')) return true;
  if (/ de([ ,])/.test(low) || low.startsWith('de ')) return true;
  if (low.includes(' del ') || low.includes(' della ') || low.includes(' di ')) return true;

  return false;
}

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: BASE, path, method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(d ? JSON.parse(d) : { status: res.statusCode }); }
        catch (e) { resolve({ raw: d, status: res.statusCode }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  // 1. Načíst documentId kategorie "Česká literatura" a "Světová literatura"
  const catsRes = await req('GET', '/api/categories?fields[0]=name&fields[1]=documentId&pagination[pageSize]=100');
  const categories = catsRes.data || [];

  const ceska = categories.find(c => c.name === 'Česká literatura');
  const svetova = categories.find(c => c.name === 'Světová literatura');

  if (!ceska) { console.log('❌ Kategorie "Česká literatura" nenalezena!'); return; }
  if (!svetova) { console.log('❌ Kategorie "Světová literatura" nenalezena!'); return; }

  console.log(`✓ Česká literatura: ${ceska.documentId}`);
  console.log(`✓ Světová literatura: ${svetova.documentId}`);

  // 2. Načíst všechny knihy v "Česká literatura" s autorem
  console.log('\nNačítám knihy z "Česká literatura"...');
  let page = 1;
  let toFix = [];

  while (true) {
    const res = await req('GET',
      `/api/books?filters[category][documentId][$eq]=${ceska.documentId}` +
      `&populate[author][fields][0]=name` +
      `&fields[0]=title&fields[1]=documentId` +
      `&pagination[page]=${page}&pagination[pageSize]=200`
    );
    const books = res.data || [];
    if (!books.length) break;

    for (const book of books) {
      const authorName = book.author?.name;
      if (authorName && isForegnAuthor(authorName)) {
        toFix.push({ documentId: book.documentId, title: book.title, author: authorName });
      }
    }

    const totalPages = res.meta?.pagination?.pageCount || 1;
    console.log(`  Stránka ${page}/${totalPages}: ${books.length} knih, nalezeno ${toFix.length} k opravě`);
    if (page >= totalPages) break;
    page++;
    await sleep(300);
  }

  console.log(`\nNalezeno ${toFix.length} knih k přesunutí do "Světová literatura":\n`);
  toFix.forEach(b => console.log(`  ${b.author} – ${b.title}`));

  if (toFix.length === 0) {
    console.log('Vše v pořádku, nic k opravě.');
    return;
  }

  console.log(`\nOpravuji...`);
  let fixed = 0;
  for (const book of toFix) {
    try {
      await req('PUT', `/api/books/${book.documentId}`, {
        data: { category: svetova.documentId }
      });
      fixed++;
      console.log(`  ✓ [${fixed}/${toFix.length}] ${book.author} – ${book.title}`);
    } catch (e) {
      console.log(`  ✗ ${book.title}: ${e.message}`);
    }
    await sleep(400);
  }

  console.log(`\n✓ Opraveno ${fixed}/${toFix.length} knih.`);
}

run().catch(console.error);
