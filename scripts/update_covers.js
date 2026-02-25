const https = require('https');
const TOKEN = 'f336ce288b5630eaa259b8013754b07982841afcdbaa2c58605721ee4e50c5bdecee0b6163a97be4879a93f76e6e2ca1a2add9f586de922f4064054098c104bce3ad367a46e08fd478c722cdfa51068d4292f24d12569d35444d53393c048e19f3511e56c56aff628297ce143de14954f1c1892c23d0b3722685045417b87e4c';
const BASE = 'eknihyzdarma-backend-1.onrender.com';

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
        catch (e) { resolve({ status: res.statusCode }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

// slug → Open Library cover URL
const covers = {
  'prvni-parta': 'https://covers.openlibrary.org/b/id/11632373-M.jpg',
  'anglicke-listy': 'https://covers.openlibrary.org/b/id/921266-M.jpg',
  'bila-nemoc': 'https://covers.openlibrary.org/b/id/4291026-M.jpg',
  'italske-listy': 'https://covers.openlibrary.org/b/id/10420849-M.jpg',
  'o-vecech-obecnych-cili-zoon-politikon': 'https://covers.openlibrary.org/b/id/13098711-M.jpg',
  'obycejny-zivot': 'https://covers.openlibrary.org/b/id/3135366-M.jpg',
  'obrazky-z-holandska': 'https://covers.openlibrary.org/b/id/13479516-M.jpg',
  // MLP správná URL od uživatele
  // 'anglicke-listy': 'https://web2.mlp.cz/koweb/00/04/34/55/Small.02.jpg',
};

async function run() {
  for (const [slug, coverUrl] of Object.entries(covers)) {
    const res = await req('GET', '/api/books?filters[slug][$eq]=' + slug + '&fields[0]=documentId&fields[1]=title');
    const book = res.data && res.data[0];
    if (!book) { console.log('NOT FOUND:', slug); continue; }

    await req('PUT', '/api/books/' + book.documentId, {
      data: { coverExternalUrl: coverUrl }
    });
    console.log('✓', slug, '→', coverUrl);
    await new Promise(r => setTimeout(r, 300));
  }
  console.log('\nDone!');
}

run().catch(console.error);
