/**
 * Fix PDF uploads - re-upload PDFs to Cloudinary as resource_type 'raw'
 *
 * Problem: Cloudinary stores PDFs as resource_type 'image' which returns 401
 * because Cloudinary blocks PDF delivery via image endpoint by default.
 * EPUB/MOBI correctly use 'raw'. This script re-uploads PDFs as 'raw'.
 *
 * Strategy:
 * 1. Call Strapi endpoint to get list of broken PDF files
 * 2. For each: find local file, upload to Cloudinary as 'raw' via direct API
 * 3. Call Strapi endpoint to update DB record with new URL
 *
 * Usage:
 *   STRAPI_URL=https://eknihyzdarma-backend-1.onrender.com node scripts/fix-pdf-uploads.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

const CLOUDINARY_NAME = 'dfj1iiv65';
const CLOUDINARY_KEY = '382587993648438';
const CLOUDINARY_SECRET = 'vgFcg6KOmKKN0uLRpXRce0FMTPE';
const FIX_KEY = 'fix-pdf-2024-temp';

const BASE_DIR = path.join(__dirname, '..', 'eknihyzdarma');
const FILES_DIR = path.join(BASE_DIR, 'files', 'mod_eknihy');

// --------------- Cloudinary signed upload ---------------

function cloudinarySign(params) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(sorted + CLOUDINARY_SECRET).digest('hex');
}

async function uploadToCloudinaryRaw(filePath, publicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { overwrite: 'true', public_id: publicId, timestamp };
  const signature = cloudinarySign(params);

  const fileBuffer = fs.readFileSync(filePath);
  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer], { type: 'application/pdf' }), path.basename(filePath));
  formData.append('public_id', publicId);
  formData.append('timestamp', String(timestamp));
  formData.append('overwrite', 'true');
  formData.append('api_key', CLOUDINARY_KEY);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/raw/upload`;
  const response = await fetch(url, { method: 'POST', body: formData });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${text.substring(0, 200)}`);
  }

  return response.json();
}

// --------------- Main ---------------

async function fixPdfs() {
  console.log(`Fixing PDF uploads...\n`);
  console.log(`Strapi: ${STRAPI_URL}`);
  console.log(`Local files: ${FILES_DIR}\n`);

  // Build index of local PDF files
  const localFiles = fs.readdirSync(FILES_DIR).filter(f => f.endsWith('.pdf'));
  const localMap = new Map();
  for (const f of localFiles) {
    localMap.set(f, path.join(FILES_DIR, f));
  }
  console.log(`Local PDF files available: ${localMap.size}\n`);

  // Step 1: Get list of broken PDF files from Strapi
  console.log('Fetching broken PDF file list from Strapi...');
  const listRes = await fetch(`${STRAPI_URL}/api/fix-pdf/run`, {
    method: 'POST',
    headers: { 'x-fix-key': FIX_KEY, 'Content-Type': 'application/json' },
  });

  if (!listRes.ok) {
    const text = await listRes.text();
    console.error(`Failed to get file list: ${listRes.status} ${text.substring(0, 200)}`);
    process.exit(1);
  }

  const listData = await listRes.json();
  console.log(`PDF files to fix: ${listData.total}\n`);

  if (listData.total === 0) {
    console.log('No PDF files need fixing!');
    return;
  }

  let fixed = 0;
  let noLocal = 0;
  let errors = 0;

  for (const file of listData.files) {
    // Find local file by name
    const localPath = localMap.get(file.name);
    if (!localPath) {
      console.log(`  SKIP (no local): ${file.name}`);
      noLocal++;
      continue;
    }

    try {
      // Upload to Cloudinary as raw
      const publicId = file.hash;
      console.log(`  Uploading: ${file.name} → raw/${publicId}`);

      const result = await uploadToCloudinaryRaw(localPath, publicId);
      const newUrl = result.secure_url;

      // Update Strapi DB record
      const updateRes = await fetch(`${STRAPI_URL}/api/fix-pdf/update`, {
        method: 'PUT',
        headers: {
          'x-fix-key': FIX_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: file.id,
          newUrl,
          newPublicId: result.public_id,
          oldPublicId: file.public_id,
        }),
      });

      if (!updateRes.ok) {
        const text = await updateRes.text();
        throw new Error(`Strapi update failed: ${text.substring(0, 200)}`);
      }

      fixed++;
      console.log(`    OK → ${newUrl}`);
    } catch (err) {
      console.log(`  ERROR: ${file.name} - ${err.message}`);
      errors++;
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Total: ${listData.total}`);
  console.log(`Fixed: ${fixed}`);
  console.log(`No local file: ${noLocal}`);
  console.log(`Errors: ${errors}`);
}

fixPdfs().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
