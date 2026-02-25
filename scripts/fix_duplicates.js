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

// -1 duplikáty vytvořené importem
const mlpSlugs = [
  'cesta-na-sever-1', 'prvni-parta-1', 'bila-nemoc-1', 'bozi-muka-1',
  'mel-jsem-psa-a-kocku-1', 'obycejny-zivot-1', 'obrazky-z-holandska-1',
  'o-vecech-obecnych-cili-zoon-politikon-1', 'trapne-povidky-1',
  'vylet-do-spanel-1', 'kalendar-1'
];

async function run() {
  for (const slug of mlpSlugs) {
    const origSlug = slug.replace(/-1$/, '');

    // Načíst MLP -1 verzi
    const mlpRes = await req('GET', '/api/books?filters[slug][$eq]=' + slug + '&fields[0]=title&fields[1]=documentId&fields[2]=externalLinks&fields[3]=coverExternalUrl&fields[4]=mlpId');
    const mlpBook = mlpRes.data && mlpRes.data[0];
    if (!mlpBook) { console.log('NOT FOUND:', slug); continue; }

    // Načíst originál
    const origRes = await req('GET', '/api/books?filters[slug][$eq]=' + origSlug + '&fields[0]=title&fields[1]=documentId');
    const origBook = origRes.data && origRes.data[0];
    if (!origBook) { console.log('Original not found:', origSlug); continue; }

    // Update originálu
    await req('PUT', '/api/books/' + origBook.documentId, {
      data: {
        externalLinks: mlpBook.externalLinks,
        coverExternalUrl: mlpBook.coverExternalUrl,
        mlpId: mlpBook.mlpId,
      }
    });
    console.log('✓ Updated:', origSlug, '| links:', (mlpBook.externalLinks || []).length);

    // Smazat duplikát
    const del = await req('DELETE', '/api/books/' + mlpBook.documentId);
    console.log('🗑 Deleted:', slug, '| status:', del.status || 'ok');

    await new Promise(r => setTimeout(r, 400));
  }
  console.log('\nDone!');
}

run().catch(console.error);
