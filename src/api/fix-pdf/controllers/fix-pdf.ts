/**
 * Temporary controller to fix PDF files on Cloudinary.
 *
 * Problem: PDFs uploaded via Strapi Cloudinary provider get resource_type 'image'
 * which blocks delivery (401). This re-uploads them as 'raw'.
 *
 * Strategy: Use Cloudinary Admin API to download the PDF bytes directly,
 * then re-upload as resource_type 'raw'.
 */

// @ts-ignore - cloudinary is installed as dependency of the upload provider
import cloudinary from 'cloudinary';

const SECRET_KEY = 'fix-pdf-2024-temp';

export default {
  async run(ctx) {
    // Simple auth to prevent random access
    const authHeader = ctx.request.header['x-fix-key'];
    if (authHeader !== SECRET_KEY) {
      ctx.status = 403;
      ctx.body = { error: 'Invalid key' };
      return;
    }

    const cloudName = process.env.CLOUDINARY_NAME;
    const apiKey = process.env.CLOUDINARY_KEY;
    const apiSecret = process.env.CLOUDINARY_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      ctx.status = 500;
      ctx.body = { error: 'Cloudinary env vars not set' };
      return;
    }

    // Configure cloudinary SDK
    cloudinary.v2.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Find all PDF files with resource_type 'image'
    const files = await strapi.db.query('plugin::upload.file').findMany({
      where: {
        mime: 'application/pdf',
      },
    });

    const pdfImageFiles = files.filter(
      (f: any) => f.provider_metadata?.resource_type === 'image'
    );

    const results: any[] = [];
    let processed = 0;

    for (const file of pdfImageFiles) {
      const oldPublicId = file.provider_metadata?.public_id;
      if (!oldPublicId) {
        results.push({ id: file.id, name: file.name, status: 'skip', reason: 'no public_id' });
        continue;
      }

      try {
        // Use Cloudinary Admin API to get the resource details
        const resource = await cloudinary.v2.api.resource(oldPublicId, {
          resource_type: 'image',
        });

        // Use private_download_url to get an authenticated download URL
        // This bypasses the CDN delivery restrictions
        const downloadUrl = cloudinary.v2.utils.private_download_url(
          oldPublicId,
          'pdf',
          {
            resource_type: 'image',
            expires_at: Math.floor(Date.now() / 1000) + 3600,
          }
        );

        // New public_id for raw resource
        const newPublicId = file.hash;

        // Upload from the private download URL to Cloudinary as raw
        const uploadResult = await cloudinary.v2.uploader.upload(downloadUrl, {
          resource_type: 'raw',
          public_id: newPublicId,
          overwrite: true,
        });

        const newUrl = uploadResult.secure_url;

        // Update the database record
        await strapi.db.query('plugin::upload.file').update({
          where: { id: file.id },
          data: {
            url: newUrl,
            provider_metadata: {
              public_id: uploadResult.public_id,
              resource_type: 'raw',
            },
          },
        });

        // Delete old image-type resource from Cloudinary
        try {
          await cloudinary.v2.uploader.destroy(oldPublicId, {
            resource_type: 'image',
          });
        } catch (e) {
          // Non-critical
        }

        processed++;
        results.push({
          id: file.id,
          name: file.name,
          status: 'fixed',
          newUrl,
        });
      } catch (err: any) {
        results.push({
          id: file.id,
          name: file.name,
          status: 'error',
          error: err.message?.substring(0, 200),
        });
      }
    }

    const fixed = results.filter((r) => r.status === 'fixed').length;
    const errors = results.filter((r) => r.status === 'error').length;

    ctx.body = {
      total: pdfImageFiles.length,
      fixed,
      errors,
      results: results.slice(0, 20), // Limit output size
      remaining: results.length > 20 ? results.length - 20 : 0,
    };
  },
};
