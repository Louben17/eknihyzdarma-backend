/**
 * Cleanup script - delete all data from Strapi (for re-seeding)
 * Usage: STRAPI_URL=... STRAPI_TOKEN=... node scripts/cleanup.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_TOKEN;

if (!TOKEN) { console.error('STRAPI_TOKEN required'); process.exit(1); }

async function deleteAll(endpoint, label) {
  const headers = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
  let deleted = 0;

  while (true) {
    const res = await fetch(`${STRAPI_URL}/api${endpoint}?pagination[pageSize]=100`, { headers });
    const data = await res.json();
    const items = data.data || [];
    if (items.length === 0) break;

    for (const item of items) {
      const docId = item.documentId;
      const delRes = await fetch(`${STRAPI_URL}/api${endpoint}/${docId}`, { method: 'DELETE', headers });
      if (delRes.ok) {
        deleted++;
      } else {
        console.log(`  Failed to delete ${label} ${docId}: ${delRes.status}`);
      }
    }
  }
  console.log(`Deleted ${deleted} ${label}`);
}

async function cleanup() {
  console.log(`Cleaning up Strapi at: ${STRAPI_URL}\n`);
  // Delete in order: books first (has relations), then authors, then categories
  await deleteAll('/books', 'books');
  await deleteAll('/authors', 'authors');
  await deleteAll('/categories', 'categories');
  console.log('\nCleanup complete!');
}

cleanup().catch(console.error);
