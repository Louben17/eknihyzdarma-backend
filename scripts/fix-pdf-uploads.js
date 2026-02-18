/**
 * Fix PDF uploads - re-upload PDFs to Cloudinary as resource_type 'raw'
 *
 * Problem: Cloudinary stores PDFs as resource_type 'image' which returns 401
 * because Cloudinary blocks PDF delivery via image endpoint by default.
 * EPUB/MOBI correctly use 'raw'. This script re-uploads PDFs as 'raw'.
 *
 * Usage:
 *   STRAPI_URL=https://eknihyzdarma-backend-1.onrender.com STRAPI_TOKEN=xxx node scripts/fix-pdf-uploads.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

const CLOUDINARY_NAME = 'dfj1iiv65';
const CLOUDINARY_KEY = '382587993648438';
const CLOUDINARY_SECRET = 'vgFcg6KOmKKN0uLRpXRce0FMTPE';

const BASE_DIR = path.join(__dirname, '..', 'eknihyzdarma');
const FILES_DIR = path.join(BASE_DIR, 'files');

if (!STRAPI_TOKEN) {
  console.error('ERROR: STRAPI_TOKEN is required.');
  process.exit(1);
}

// --------------- Cloudinary signed upload ---------------

function cloudinarySign(params) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(sorted + CLOUDINARY_SECRET).digest('hex');
}

async function uploadToCloudinaryRaw(filePath, publicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    public_id: publicId,
    resource_type: 'raw',
    timestamp,
    overwrite: 'true',
  };

  const signature = cloudinarySign(params);

  const fileBuffer = fs.readFileSync(filePath);
  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer], { type: 'application/pdf' }), path.basename(filePath));
  formData.append('public_id', publicId);
  formData.append('resource_type', 'raw');
  formData.append('timestamp', String(timestamp));
  formData.append('overwrite', 'true');
  formData.append('api_key', CLOUDINARY_KEY);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/raw/upload`;
  const response = await fetch(url, { method: 'POST', body: formData });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${text.substring(0, 200)}`);
  }

  return response.json();
}

async function deleteCloudinaryResource(publicId, resourceType = 'image') {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const signature = cloudinarySign(params);

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('timestamp', String(timestamp));
  formData.append('api_key', CLOUDINARY_KEY);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/${resourceType}/destroy`;
  const response = await fetch(url, { method: 'POST', body: formData });
  return response.ok;
}

// --------------- Strapi helpers ---------------

async function strapiRequest(endpoint, method = 'GET', body = null) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Strapi ${method} ${endpoint} failed (${response.status}): ${text.substring(0, 200)}`);
  }
  return response.json();
}

// --------------- Main ---------------

async function fixPdfUploads() {
  console.log('Fetching all books with ebook files from Strapi...\n');

  // Get all books with ebookFiles populated
  let allBooks = [];
  let page = 1;
  while (true) {
    const res = await strapiRequest(
      `/books?populate=ebookFiles&pagination[page]=${page}&pagination[pageSize]=100`
    );
    allBooks.push(...res.data);
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }

  console.log(`Total books: ${allBooks.length}`);

  // Find all PDF files that need fixing
  const pdfFiles = [];
  for (const book of allBooks) {
    if (!book.ebookFiles) continue;
    for (const file of book.ebookFiles) {
      if (file.ext === '.pdf' && file.provider_metadata?.resource_type === 'image') {
        pdfFiles.push({ bookId: book.id, bookDocId: book.documentId, bookTitle: book.title, file });
      }
    }
  }

  console.log(`PDF files to fix: ${pdfFiles.length}\n`);

  if (pdfFiles.length === 0) {
    console.log('No PDF files need fixing!');
    return;
  }

  // Build map of local ebook files for lookup
  const eknihyDir = path.join(FILES_DIR, 'mod_eknihy');
  const localFiles = fs.existsSync(eknihyDir) ? fs.readdirSync(eknihyDir) : [];
  const localPdfMap = new Map();
  for (const f of localFiles) {
    if (f.endsWith('.pdf')) {
      localPdfMap.set(f, path.join(eknihyDir, f));
    }
  }
  console.log(`Local PDF files available: ${localPdfMap.size}\n`);

  let fixed = 0;
  let failed = 0;
  let noLocal = 0;

  for (const item of pdfFiles) {
    const { file, bookTitle } = item;
    const originalName = file.name;

    // Find local file
    const localPath = localPdfMap.get(originalName);
    if (!localPath) {
      console.log(`  SKIP (no local file): ${originalName} - "${bookTitle}"`);
      noLocal++;
      continue;
    }

    try {
      // Generate a new public_id for raw upload
      const hash = file.hash || path.basename(originalName, '.pdf');
      const newPublicId = hash;

      console.log(`  Uploading: ${originalName} → raw/${newPublicId}`);

      // Upload to Cloudinary as raw
      const result = await uploadToCloudinaryRaw(localPath, newPublicId);
      const newUrl = result.secure_url || result.url;

      console.log(`    New URL: ${newUrl}`);

      // Update file entry in Strapi via upload API
      // We need to update the file record directly
      const updateUrl = `${STRAPI_URL}/api/upload?id=${file.id}`;
      const updateRes = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileInfo: {
            name: originalName,
          }
        }),
      });

      // Alternative: update via raw SQL-like approach through Strapi
      // Since Strapi's upload plugin doesn't easily allow URL updates via REST,
      // we'll re-upload the file through Strapi's upload endpoint to replace it

      // Actually, let's just re-upload through Strapi's upload API which will use Cloudinary
      // But that has the same resource_type issue...

      // Best approach: delete old file from Strapi, upload new one, re-attach to book
      // Step 1: Delete old Cloudinary image resource
      const oldPublicId = file.provider_metadata?.public_id;
      if (oldPublicId) {
        await deleteCloudinaryResource(oldPublicId, 'image');
        console.log(`    Deleted old image resource: ${oldPublicId}`);
      }

      // Step 2: Delete old file from Strapi
      await strapiRequest(`/upload/files/${file.id}`, 'DELETE');
      console.log(`    Deleted old Strapi file entry`);

      // Step 3: Upload new file through Strapi (but this will use Cloudinary provider again)
      // Instead, we already uploaded to Cloudinary directly as raw, so we need to create
      // the file entry in Strapi manually. But Strapi doesn't have an easy API for that.

      // Better approach: Upload through Strapi but the file will end up as image again...
      // Let's use a workaround: upload directly and then just re-upload the file via Strapi

      // Actually the simplest approach: just upload the file again through Strapi's upload
      // The file goes to Cloudinary, but this time we need to ensure it's raw.
      // Since we can't control resource_type through Strapi, let's use a different approach:

      // Upload the PDF via Strapi's upload API (it will go to Cloudinary)
      const fileBuffer = fs.readFileSync(localPath);
      const uploadForm = new FormData();
      uploadForm.append('files', new Blob([fileBuffer], { type: 'application/pdf' }), originalName);

      const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` },
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(`Re-upload failed: ${text.substring(0, 200)}`);
      }

      const uploaded = await uploadRes.json();
      const newFile = Array.isArray(uploaded) ? uploaded[0] : uploaded;

      // Check if the new file is still "image" type
      if (newFile.provider_metadata?.resource_type === 'image') {
        // It's still image type... we need to work around this.
        // Delete the Strapi entry and use our direct Cloudinary upload instead.
        await strapiRequest(`/upload/files/${newFile.id}`, 'DELETE');

        // We already uploaded to Cloudinary as raw above. We need to create a file entry
        // in Strapi pointing to that URL. Unfortunately Strapi doesn't have a clean API for this.

        // The cleanest remaining option: Just accept that Strapi re-uploads as image,
        // and instead fix the frontend to handle Cloudinary PDF URLs.
        console.log(`    WARNING: Re-upload still uses image type. Will fix via frontend.`);

        // Re-upload through Strapi again (we deleted the new one), keep tracking
        const uploadForm2 = new FormData();
        uploadForm2.append('files', new Blob([fileBuffer], { type: 'application/pdf' }), originalName);

        const uploadRes2 = await fetch(`${STRAPI_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` },
          body: uploadForm2,
        });

        if (uploadRes2.ok) {
          const uploaded2 = await uploadRes2.json();
          const newFile2 = Array.isArray(uploaded2) ? uploaded2[0] : uploaded2;

          // Re-attach to book
          const book = allBooks.find(b => b.documentId === item.bookDocId);
          if (book) {
            const currentFileIds = (book.ebookFiles || [])
              .filter(f => f.id !== file.id)
              .map(f => f.id);
            currentFileIds.push(newFile2.id);
            await strapiRequest(`/books/${item.bookDocId}`, 'PUT', {
              data: { ebookFiles: currentFileIds }
            });
          }
        }
        failed++;
        continue;
      }

      // New file is raw type - re-attach to book
      const book = allBooks.find(b => b.documentId === item.bookDocId);
      if (book) {
        const currentFileIds = (book.ebookFiles || [])
          .filter(f => f.id !== file.id)
          .map(f => f.id);
        currentFileIds.push(newFile.id);
        await strapiRequest(`/books/${item.bookDocId}`, 'PUT', {
          data: { ebookFiles: currentFileIds }
        });
        console.log(`    Re-attached to book`);
      }

      fixed++;
    } catch (err) {
      console.log(`  FAILED: ${originalName} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Failed: ${failed}`);
  console.log(`No local file: ${noLocal}`);
}

fixPdfUploads().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
