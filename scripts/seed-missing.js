/**
 * Supplementary seed script - imports books from .dat that are NOT in XML
 *
 * The original seed.js only imports 291 books from zaloha.xml.
 * The SQL dump (zaloha.dat) has 442 products total.
 * This script imports the ~151 missing books.
 *
 * Usage:
 *   STRAPI_URL=https://eknihyzdarma-backend-1.onrender.com STRAPI_TOKEN=xxx node scripts/seed-missing.js
 */

const fs = require('fs');
const path = require('path');

// --------------- Configuration ---------------

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

const BASE_DIR = path.join(__dirname, '..', 'eknihyzdarma');
const DAT_FILE = path.join(BASE_DIR, 'zalohy', 'zaloha.dat');
const XML_FILE = path.join(BASE_DIR, 'zalohy', 'zaloha.xml');
const FILES_DIR = path.join(BASE_DIR, 'files');

if (!STRAPI_TOKEN) {
  console.error('ERROR: STRAPI_TOKEN is required. Create a Full Access API token in Strapi admin.');
  process.exit(1);
}

// --------------- Encoding fix (CP1250 double-encoded as Latin-1→UTF-8) ---------------

const CP1250_MAP = {
  0x80: 0x20AC, 0x82: 0x201A, 0x84: 0x201E, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021,
  0x89: 0x2030, 0x8A: 0x0160, 0x8B: 0x2039, 0x8C: 0x015A, 0x8D: 0x0164, 0x8E: 0x017D, 0x8F: 0x0179,
  0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
  0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x015B, 0x9D: 0x0165, 0x9E: 0x017E, 0x9F: 0x017A,
  0xA0: 0x00A0, 0xA1: 0x02C7, 0xA2: 0x02D8, 0xA3: 0x0141, 0xA4: 0x00A4, 0xA5: 0x0104,
  0xA6: 0x00A6, 0xA7: 0x00A7, 0xA8: 0x00A8, 0xA9: 0x00A9, 0xAA: 0x015E, 0xAB: 0x00AB,
  0xAC: 0x00AC, 0xAD: 0x00AD, 0xAE: 0x00AE, 0xAF: 0x017B, 0xB0: 0x00B0, 0xB1: 0x00B1,
  0xB2: 0x02DB, 0xB3: 0x0142, 0xB4: 0x00B4, 0xB5: 0x00B5, 0xB6: 0x00B6, 0xB7: 0x00B7,
  0xB8: 0x00B8, 0xB9: 0x0105, 0xBA: 0x015F, 0xBB: 0x00BB, 0xBC: 0x013D, 0xBD: 0x02DD,
  0xBE: 0x013E, 0xBF: 0x017C, 0xC0: 0x0154, 0xC1: 0x00C1, 0xC2: 0x00C2, 0xC3: 0x0102,
  0xC4: 0x00C4, 0xC5: 0x0139, 0xC6: 0x0106, 0xC7: 0x00C7, 0xC8: 0x010C, 0xC9: 0x00C9,
  0xCA: 0x0118, 0xCB: 0x00CB, 0xCC: 0x011A, 0xCD: 0x00CD, 0xCE: 0x00CE, 0xCF: 0x010E,
  0xD0: 0x0110, 0xD1: 0x0143, 0xD2: 0x0147, 0xD3: 0x00D3, 0xD4: 0x00D4, 0xD5: 0x0150,
  0xD6: 0x00D6, 0xD7: 0x00D7, 0xD8: 0x0158, 0xD9: 0x016E, 0xDA: 0x00DA, 0xDB: 0x0170,
  0xDC: 0x00DC, 0xDD: 0x00DD, 0xDE: 0x0162, 0xDF: 0x00DF, 0xE0: 0x0155, 0xE1: 0x00E1,
  0xE2: 0x00E2, 0xE3: 0x0103, 0xE4: 0x00E4, 0xE5: 0x013A, 0xE6: 0x0107, 0xE7: 0x00E7,
  0xE8: 0x010D, 0xE9: 0x00E9, 0xEA: 0x0119, 0xEB: 0x00EB, 0xEC: 0x011B, 0xED: 0x00ED,
  0xEE: 0x00EE, 0xEF: 0x010F, 0xF0: 0x0111, 0xF1: 0x0144, 0xF2: 0x0148, 0xF3: 0x00F3,
  0xF4: 0x00F4, 0xF5: 0x0151, 0xF6: 0x00F6, 0xF7: 0x00F7, 0xF8: 0x0159, 0xF9: 0x016F,
  0xFA: 0x00FA, 0xFB: 0x0171, 0xFC: 0x00FC, 0xFD: 0x00FD, 0xFE: 0x0163, 0xFF: 0x02D9,
};

function fixEncoding(str) {
  if (!str) return '';
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0x80 && code <= 0xFF && CP1250_MAP[code] !== undefined) {
      result += String.fromCodePoint(CP1250_MAP[code]);
    } else {
      result += str[i];
    }
  }
  return result;
}

// --------------- SQL Dump Parser ---------------

function parseSqlValues(line) {
  const results = [];
  const valuesIdx = line.indexOf(' values ');
  if (valuesIdx === -1) return results;
  let pos = valuesIdx + 8;

  while (pos < line.length) {
    while (pos < line.length && line[pos] !== '(') pos++;
    if (pos >= line.length) break;
    pos++;

    const fields = [];
    let current = '';
    let inQuote = false;
    let escaped = false;

    while (pos < line.length) {
      const ch = line[pos];
      if (escaped) {
        current += ch;
        escaped = false;
        pos++;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        pos++;
        continue;
      }
      if (ch === "'" && !inQuote) {
        inQuote = true;
        pos++;
        continue;
      }
      if (ch === "'" && inQuote) {
        if (pos + 1 < line.length && line[pos + 1] === "'") {
          current += "'";
          pos += 2;
          continue;
        }
        inQuote = false;
        pos++;
        continue;
      }
      if (ch === ')' && !inQuote) {
        fields.push(current);
        results.push(fields);
        pos++;
        break;
      }
      if (ch === ',' && !inQuote) {
        fields.push(current);
        current = '';
        pos++;
        while (pos < line.length && line[pos] === ' ') pos++;
        continue;
      }
      current += ch;
      pos++;
    }
  }
  return results;
}

function parseDatFile() {
  console.log('Parsing .dat file...');
  const content = fs.readFileSync(DAT_FILE, 'utf8');
  const lines = content.split('\n');

  const data = {
    znacka: [],
    znackaDetail: [],
    produkt: [],
    produktDetail: [],
    eknihyFile: [],
    kategorie: [],
    kategorieDetail: [],
  };

  for (const line of lines) {
    if (line.startsWith('insert into mod_eshop_znacka_detail values')) {
      data.znackaDetail.push(...parseSqlValues(line));
    } else if (line.startsWith('insert into mod_eshop_znacka values')) {
      data.znacka.push(...parseSqlValues(line));
    } else if (line.startsWith('insert into mod_eshop_produkt_detail values')) {
      data.produktDetail.push(...parseSqlValues(line));
    } else if (line.startsWith('insert into mod_eshop_produkt values')) {
      data.produkt.push(...parseSqlValues(line));
    } else if (line.startsWith('insert into eknihy_file values')) {
      data.eknihyFile.push(...parseSqlValues(line));
    } else if (line.startsWith('insert into mod_eshop_kategorie_detail values')) {
      data.kategorieDetail.push(...parseSqlValues(line));
    } else if (line.startsWith('insert into mod_eshop_kategorie values')) {
      data.kategorie.push(...parseSqlValues(line));
    }
  }

  console.log(`  Authors (znacka): ${data.znacka.length}`);
  console.log(`  Products: ${data.produkt.length}`);
  console.log(`  Product details: ${data.produktDetail.length}`);
  console.log(`  E-book files: ${data.eknihyFile.length}`);
  console.log(`  Categories: ${data.kategorie.length}`);
  console.log(`  Category details: ${data.kategorieDetail.length}`);

  return data;
}

// --------------- XML Parser (to get IDs already imported) ---------------

function getXmlBookIds() {
  console.log('Parsing XML to get already-imported IDs...');
  const content = fs.readFileSync(XML_FILE, 'utf8');
  const items = content.split('<SHOPITEM>').slice(1);
  const ids = new Set();

  for (const item of items) {
    const match = item.match(/<ID>(.*?)<\/ID>/);
    if (match) ids.add(match[1].trim());
  }

  console.log(`  XML book IDs: ${ids.size}`);
  return ids;
}

// --------------- Strapi API helpers ---------------

async function strapiRequest(endpoint, method = 'GET', body = null) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Strapi ${method} ${endpoint} failed (${response.status}): ${text}`);
  }

  return response.json();
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimes = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.epub': 'application/epub+zip', '.mobi': 'application/x-mobipocket-ebook',
    '.pdf': 'application/pdf',
  };
  return mimes[ext] || 'application/octet-stream';
}

async function uploadFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`    File not found: ${filePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const mimeType = getMimeType(filePath);

  const formData = new FormData();
  formData.append('files', new Blob([fileBuffer], { type: mimeType }), fileName);

  const url = `${STRAPI_URL}/api/upload`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    console.log(`    Upload failed for ${fileName}: ${text.substring(0, 200)}`);
    return null;
  }

  const result = await response.json();
  return Array.isArray(result) ? result[0] : result;
}

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// --------------- Fetch existing Strapi data ---------------

async function getExistingSlugs() {
  console.log('Fetching existing book slugs from Strapi...');
  const slugs = new Set();
  let page = 1;
  while (true) {
    const res = await strapiRequest(`/books?fields[0]=slug&pagination[page]=${page}&pagination[pageSize]=100`);
    for (const book of res.data) {
      slugs.add(book.slug);
    }
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  console.log(`  Existing books in Strapi: ${slugs.size}`);
  return slugs;
}

async function getExistingCategories() {
  console.log('Fetching existing categories from Strapi...');
  const cats = new Map(); // name → documentId
  const res = await strapiRequest('/categories?pagination[pageSize]=100');
  for (const cat of res.data) {
    cats.set(cat.name, cat.documentId);
  }
  console.log(`  Existing categories: ${cats.size}`);
  return cats;
}

async function getExistingAuthors() {
  console.log('Fetching existing authors from Strapi...');
  const authors = new Map(); // name → documentId
  let page = 1;
  while (true) {
    const res = await strapiRequest(`/authors?fields[0]=name&pagination[page]=${page}&pagination[pageSize]=100`);
    for (const author of res.data) {
      authors.set(author.name, author.documentId);
    }
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  console.log(`  Existing authors: ${authors.size}`);
  return authors;
}

// --------------- Main seed function ---------------

async function seedMissing() {
  console.log(`\nSupplementary seed - importing missing books from .dat`);
  console.log(`Strapi: ${STRAPI_URL}\n`);

  // Parse data sources
  const datData = parseDatFile();
  const xmlBookIds = getXmlBookIds();

  // Build lookup maps from .dat

  // Category map: categoryId → name
  const datCategoryMap = new Map();
  for (const row of datData.kategorieDetail) {
    const [id, categoryId, jazyk, nazev] = row;
    if (jazyk === '1') {
      datCategoryMap.set(categoryId, fixEncoding(nazev));
    }
  }
  console.log(`\nCategory mapping from .dat:`);
  for (const [id, name] of datCategoryMap) {
    console.log(`  ${id} → ${name}`);
  }

  // Author map: znackaId → { name, slug, bio, obrazek }
  const znackaMap = new Map();
  for (const row of datData.znacka) {
    const [id, ipopis, obrazek, web, priorita, urlSlug] = row;
    znackaMap.set(id, { id, obrazek, urlSlug, name: null, bio: null });
  }
  for (const row of datData.znackaDetail) {
    const [id, znackaId, jazyk, nazev, popis] = row;
    if (jazyk === '1' && znackaMap.has(znackaId)) {
      const entry = znackaMap.get(znackaId);
      entry.name = fixEncoding(nazev);
      entry.bio = popis ? stripHtml(fixEncoding(popis)) : '';
    }
  }

  // Product map: id → { znackaId, categoryId, url, visible }
  const produktMap = new Map();
  for (const row of datData.produkt) {
    const [id, categoryId, , url, znackaId, status, visible] = row;
    produktMap.set(id, { znackaId, categoryId, url, visible });
  }

  // Product detail: id → { nazev, popis }
  const produktDetailMap = new Map();
  for (const row of datData.produktDetail) {
    const [id, productId, jazyk, nazev, popis] = row;
    if (jazyk === '1') {
      produktDetailMap.set(productId, {
        nazev: fixEncoding(nazev),
        popis: popis ? stripHtml(fixEncoding(popis)) : ''
      });
    }
  }

  // E-book files: productId → [{ format, filename }]
  const ebookMap = new Map();
  for (const row of datData.eknihyFile) {
    const [productId, format, filename] = row;
    if (!ebookMap.has(productId)) ebookMap.set(productId, []);
    ebookMap.get(productId).push({ format, filename });
  }

  // Find missing products (in .dat but NOT in XML)
  const missingProducts = [];
  for (const [id, prod] of produktMap) {
    if (!xmlBookIds.has(id) && prod.visible === '1') {
      const detail = produktDetailMap.get(id);
      if (detail && detail.nazev) {
        missingProducts.push({ id, ...prod, ...detail });
      }
    }
  }

  console.log(`\nMissing products (in .dat, not in XML): ${missingProducts.length}`);

  // Fetch existing Strapi data to avoid duplicates
  const existingSlugs = await getExistingSlugs();
  const categoryMap = await getExistingCategories();
  const authorMap = await getExistingAuthors();

  // ===== Create missing categories =====
  console.log('\n--- Checking/creating categories ---');
  for (const prod of missingProducts) {
    const catName = datCategoryMap.get(prod.categoryId);
    if (catName && !categoryMap.has(catName)) {
      const slug = slugify(catName);
      try {
        const result = await strapiRequest('/categories', 'POST', {
          data: { name: catName, slug }
        });
        categoryMap.set(catName, result.data.documentId);
        console.log(`  Created new category: "${catName}" (docId: ${result.data.documentId})`);
      } catch (err) {
        console.log(`  Failed to create category "${catName}": ${err.message}`);
      }
    }
  }

  // ===== Create missing authors =====
  console.log('\n--- Checking/creating authors ---');
  const processedAuthors = new Set();
  for (const prod of missingProducts) {
    if (!prod.znackaId || prod.znackaId === '0' || processedAuthors.has(prod.znackaId)) continue;
    processedAuthors.add(prod.znackaId);

    const znacka = znackaMap.get(prod.znackaId);
    if (!znacka || !znacka.name) continue;

    if (authorMap.has(znacka.name)) continue;

    const slug = znacka.urlSlug || slugify(znacka.name);
    try {
      const result = await strapiRequest('/authors', 'POST', {
        data: { name: znacka.name, slug, bio: (znacka.bio || '').substring(0, 10000) }
      });
      const docId = result.data.documentId;
      authorMap.set(znacka.name, docId);
      console.log(`  Created author: "${znacka.name}" (docId: ${docId})`);

      // Upload author photo
      if (znacka.obrazek) {
        const photoPath = path.join(FILES_DIR, 'mod_eshop', 'znacka', znacka.obrazek);
        if (fs.existsSync(photoPath)) {
          const uploaded = await uploadFile(photoPath);
          if (uploaded) {
            await strapiRequest(`/authors/${docId}`, 'PUT', {
              data: { photo: uploaded.id }
            });
            console.log(`    Uploaded photo: ${znacka.obrazek}`);
          }
        }
      }
    } catch (err) {
      console.log(`  Failed to create author "${znacka.name}": ${err.message}`);
    }
  }

  // ===== Create missing books =====
  console.log('\n--- Creating missing books ---');
  let created = 0;
  let skipped = 0;

  for (const prod of missingProducts) {
    const slug = prod.url || slugify(prod.nazev);

    // Skip if slug already exists in Strapi
    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }

    const catName = datCategoryMap.get(prod.categoryId);
    const categoryDocId = catName ? categoryMap.get(catName) : null;

    const znacka = prod.znackaId ? znackaMap.get(prod.znackaId) : null;
    const authorDocId = znacka?.name ? authorMap.get(znacka.name) : null;

    try {
      const bookData = {
        title: prod.nazev,
        slug,
        description: (prod.popis || '').substring(0, 50000),
        isFree: true,
      };
      if (authorDocId) bookData.author = authorDocId;
      if (categoryDocId) bookData.category = categoryDocId;

      const result = await strapiRequest('/books', 'POST', {
        data: bookData
      });
      const bookDocId = result.data.documentId;
      created++;
      existingSlugs.add(slug);

      console.log(`  [${created}] Created: "${prod.nazev}" (slug: ${slug}, id: ${prod.id})`);

      // Upload book cover
      let coverPath = path.join(FILES_DIR, 'mod_eshop', 'produkty', 'full', `${prod.id}.jpg`);
      if (!fs.existsSync(coverPath)) {
        coverPath = path.join(FILES_DIR, 'mod_eshop', 'produkty', `${prod.id}.jpg`);
      }
      if (fs.existsSync(coverPath)) {
        const uploaded = await uploadFile(coverPath);
        if (uploaded) {
          await strapiRequest(`/books/${bookDocId}`, 'PUT', {
            data: { cover: uploaded.id }
          });
          console.log(`    Uploaded cover`);
        }
      }

      // Upload e-book files
      const ebooks = ebookMap.get(prod.id);
      if (ebooks && ebooks.length > 0) {
        const uploadedIds = [];
        for (const ebook of ebooks) {
          const ebookPath = path.join(FILES_DIR, 'mod_eknihy', ebook.filename);
          if (fs.existsSync(ebookPath)) {
            const uploaded = await uploadFile(ebookPath);
            if (uploaded) {
              uploadedIds.push(uploaded.id);
              console.log(`    Uploaded ebook: ${ebook.filename}`);
            }
          }
        }
        if (uploadedIds.length > 0) {
          await strapiRequest(`/books/${bookDocId}`, 'PUT', {
            data: { ebookFiles: uploadedIds }
          });
        }
      }

      // Publish the book
      await strapiRequest(`/books/${bookDocId}`, 'PUT', {
        data: { publishedAt: new Date().toISOString() }
      });
    } catch (err) {
      console.log(`  Failed to create book "${prod.nazev}": ${err.message}`);
    }
  }

  console.log(`\n=== SUPPLEMENTARY SEED COMPLETE ===`);
  console.log(`Missing products found: ${missingProducts.length}`);
  console.log(`Skipped (slug exists): ${skipped}`);
  console.log(`Created: ${created}`);
  console.log(`New categories: check above`);
  console.log(`New authors: check above`);
}

seedMissing().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
