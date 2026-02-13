/**
 * Seed script - migrace dat z PHP webu eknihyzdarma.cz do Strapi 5
 *
 * Použití:
 *   STRAPI_URL=https://eknihyzdarma-backend-1.onrender.com STRAPI_TOKEN=xxx node scripts/seed.js
 *
 * Data sources:
 *   - eknihyzdarma/zalohy/zaloha.xml  (UTF-8, primární zdroj pro knihy)
 *   - eknihyzdarma/zalohy/zaloha.dat  (SQL dump, pro vztahy a soubory)
 *   - eknihyzdarma/files/             (obrázky a e-book soubory)
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

// CP1250 to Unicode mapping for bytes 0x80-0xFF
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
  // The .dat file has text that was: CP1250 bytes → interpreted as Latin-1 → encoded as UTF-8
  // To reverse: get the Unicode code point of each char, if it maps to a CP1250 special char, replace it
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
  // Parse SQL INSERT values like: ('val1','val2'), ('val3','val4')
  // Handles parentheses inside quoted strings properly
  const results = [];

  // Skip past "insert into tablename values "
  const valuesIdx = line.indexOf(' values ');
  if (valuesIdx === -1) return results;
  let pos = valuesIdx + 8; // skip " values "

  while (pos < line.length) {
    // Find opening paren
    while (pos < line.length && line[pos] !== '(') pos++;
    if (pos >= line.length) break;
    pos++; // skip '('

    // Parse fields until matching closing paren
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
        pos++; // skip ')'
        break;
      }
      if (ch === ',' && !inQuote) {
        fields.push(current);
        current = '';
        pos++;
        // Skip space after comma between values
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
    znacka: [],        // id, ipopis, obrazek, web, priorita, url
    znackaDetail: [],  // id, znacka_id, jazyk, nazev, popis, ...
    produkt: [],       // id, category_id, ???, url, znacka_id, status, visible, ...
    produktDetail: [],  // id, product_id, jazyk, nazev, popis, ...
    eknihyFile: [],    // product_id, format, filename
    kategorie: [],     // id, ...
    kategorieDetail: [], // id, master, jazyk, nazev, ...
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

  console.log(`  Znacka (authors): ${data.znacka.length}`);
  console.log(`  Znacka detail: ${data.znackaDetail.length}`);
  console.log(`  Products: ${data.produkt.length}`);
  console.log(`  Product detail: ${data.produktDetail.length}`);
  console.log(`  E-book files: ${data.eknihyFile.length}`);
  console.log(`  Categories: ${data.kategorie.length}`);

  return data;
}

// --------------- XML Parser (simple regex-based) ---------------

function parseXml() {
  console.log('Parsing XML file...');
  const content = fs.readFileSync(XML_FILE, 'utf8');
  const items = content.split('<SHOPITEM>').slice(1);

  const books = items.map(item => {
    const get = (tag) => {
      const match = item.match(new RegExp(`<${tag}>(.*?)</${tag}>`, 's'));
      return match ? match[1].trim() : '';
    };
    return {
      id: get('ID'),
      title: get('PRODUCT'),
      description: get('DESCRIPTION'),
      manufacturer: get('MANUFACTURER'),
      categoryId: get('CATEGORY_ID'),
      categoryName: get('CATEGORY_NAME').trim(),
      imgUrl: get('IMGURL'),
    };
  });

  console.log(`  Books from XML: ${books.length}`);
  return books;
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

// --------------- Slug generation ---------------

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

// --------------- Strip HTML tags ---------------

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

// --------------- Main seed function ---------------

async function seed() {
  console.log(`\nSeeding Strapi at: ${STRAPI_URL}\n`);

  // Parse data sources
  const datData = parseDatFile();
  const xmlBooks = parseXml();

  // Build lookup maps from .dat

  // Znacka (author) map: id → { name, slug, bio, imageFile }
  const znackaMap = new Map();
  for (const row of datData.znacka) {
    const [id, ipopis, obrazek, web, priorita, urlSlug] = row;
    znackaMap.set(id, { id, ipopis, obrazek, urlSlug, name: null, bio: null });
  }
  for (const row of datData.znackaDetail) {
    const [id, znackaId, jazyk, nazev, popis] = row;
    if (jazyk === '1' && znackaMap.has(znackaId)) {
      const entry = znackaMap.get(znackaId);
      entry.name = fixEncoding(nazev);
      entry.bio = popis ? stripHtml(fixEncoding(popis)) : '';
    }
  }

  // Product map from .dat: id → { znackaId, categoryId, url, status }
  const produktMap = new Map();
  for (const row of datData.produkt) {
    const [id, categoryId, , url, znackaId, status, visible] = row;
    produktMap.set(id, { znackaId, categoryId, url, status, visible });
  }

  // Product detail map: id → { nazev, popis }
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

  // E-book files map: productId → [{ format, filename }]
  const ebookMap = new Map();
  for (const row of datData.eknihyFile) {
    const [productId, format, filename] = row;
    if (!ebookMap.has(productId)) ebookMap.set(productId, []);
    ebookMap.get(productId).push({ format, filename });
  }

  // ===== 1. Create Categories =====
  console.log('\n--- Creating Categories ---');
  const uniqueCategories = [...new Set(xmlBooks.map(b => b.categoryName).filter(Boolean))];
  const categoryMap = new Map(); // name → strapi documentId

  for (const catName of uniqueCategories) {
    const slug = slugify(catName);
    try {
      const result = await strapiRequest('/categories', 'POST', {
        data: { name: catName.trim(), slug }
      });
      const docId = result.data.documentId;
      categoryMap.set(catName.trim(), docId);
      console.log(`  Created category: "${catName}" (docId: ${docId})`);
    } catch (err) {
      console.log(`  Failed to create category "${catName}": ${err.message}`);
    }
  }

  // ===== 2. Create Authors =====
  console.log('\n--- Creating Authors ---');
  const uniqueAuthors = [...new Set(xmlBooks.map(b => b.manufacturer).filter(Boolean))];
  const authorStrapiMap = new Map(); // author name → strapi documentId

  // Build reverse map: author name (from XML) → znacka ID
  const authorNameToZnackaId = new Map();
  for (const xmlBook of xmlBooks) {
    const prod = produktMap.get(xmlBook.id);
    if (prod && prod.znackaId && xmlBook.manufacturer) {
      authorNameToZnackaId.set(xmlBook.manufacturer, prod.znackaId);
    }
  }

  for (const authorName of uniqueAuthors) {
    if (!authorName || authorName === 'VISIBILITY') continue;

    const znackaId = authorNameToZnackaId.get(authorName);
    const znacka = znackaId ? znackaMap.get(znackaId) : null;

    const slug = znacka?.urlSlug || slugify(authorName);
    const bio = znacka?.bio || '';

    try {
      const result = await strapiRequest('/authors', 'POST', {
        data: { name: authorName.trim(), slug, bio: bio.substring(0, 10000) }
      });
      const docId = result.data.documentId;
      authorStrapiMap.set(authorName, docId);
      console.log(`  Created author: "${authorName}" (docId: ${docId}, znacka: ${znackaId || 'N/A'})`);

      // Upload author photo from znacka folder
      if (znacka?.obrazek) {
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
      console.log(`  Failed to create author "${authorName}": ${err.message}`);
    }
  }

  // ===== 3. Create Books =====
  console.log('\n--- Creating Books ---');
  let bookCount = 0;

  for (const xmlBook of xmlBooks) {
    if (!xmlBook.title) continue;

    const prod = produktMap.get(xmlBook.id);
    const detail = produktDetailMap.get(xmlBook.id);

    let description = xmlBook.description || detail?.popis || '';

    const slug = prod?.url || slugify(xmlBook.title);
    const authorDocId = authorStrapiMap.get(xmlBook.manufacturer) || null;
    const categoryDocId = categoryMap.get(xmlBook.categoryName?.trim()) || null;

    try {
      const bookData = {
        title: xmlBook.title,
        slug,
        description: description.substring(0, 50000),
        isFree: true,
      };
      if (authorDocId) bookData.author = authorDocId;
      if (categoryDocId) bookData.category = categoryDocId;

      const result = await strapiRequest('/books', 'POST', {
        data: bookData
      });
      const bookDocId = result.data.documentId;
      bookCount++;

      console.log(`  [${bookCount}/${xmlBooks.length}] Created book: "${xmlBook.title}" (docId: ${bookDocId})`);

      // Upload book cover
      const imgId = xmlBook.imgUrl ? path.basename(xmlBook.imgUrl, path.extname(xmlBook.imgUrl)) : xmlBook.id;
      let coverPath = path.join(FILES_DIR, 'mod_eshop', 'produkty', 'full', `${imgId}.jpg`);
      if (!fs.existsSync(coverPath)) {
        coverPath = path.join(FILES_DIR, 'mod_eshop', 'produkty', `${imgId}.jpg`);
      }
      if (fs.existsSync(coverPath)) {
        const uploaded = await uploadFile(coverPath);
        if (uploaded) {
          await strapiRequest(`/books/${bookDocId}`, 'PUT', {
            data: { cover: uploaded.id }
          });
          console.log(`    Uploaded cover: ${path.basename(coverPath)}`);
        }
      }

      // Upload e-book files
      const ebooks = ebookMap.get(xmlBook.id);
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

      // Publish the book (must be last, after all media attached)
      await strapiRequest(`/books/${bookDocId}`, 'PUT', {
        data: { publishedAt: new Date().toISOString() }
      });
    } catch (err) {
      console.log(`  Failed to create book "${xmlBook.title}": ${err.message}`);
    }
  }

  console.log(`\n=== SEED COMPLETE ===`);
  console.log(`Categories: ${categoryMap.size}`);
  console.log(`Authors: ${authorStrapiMap.size}`);
  console.log(`Books: ${bookCount}`);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
