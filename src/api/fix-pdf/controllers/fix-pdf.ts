/**
 * Temporary controller to fix PDF file URLs in Strapi database.
 *
 * POST /api/fix-pdf/run - list all PDF files needing fix
 * PUT /api/fix-pdf/update - update a single file record with new URL
 */

// @ts-ignore
import cloudinary from 'cloudinary';

const SECRET_KEY = 'fix-pdf-2024-temp';

function checkAuth(ctx: any): boolean {
  if (ctx.request.header['x-fix-key'] !== SECRET_KEY) {
    ctx.status = 403;
    ctx.body = { error: 'Invalid key' };
    return false;
  }
  return true;
}

export default {
  // List all PDF files that need fixing
  async run(ctx) {
    if (!checkAuth(ctx)) return;

    const files = await strapi.db.query('plugin::upload.file').findMany({
      where: { mime: 'application/pdf' },
    });

    const pdfImageFiles = files.filter(
      (f: any) => f.provider_metadata?.resource_type === 'image'
    );

    ctx.body = {
      total: pdfImageFiles.length,
      files: pdfImageFiles.map((f: any) => ({
        id: f.id,
        name: f.name,
        hash: f.hash,
        url: f.url,
        public_id: f.provider_metadata?.public_id,
      })),
    };
  },

  // Update a single file record with new Cloudinary raw URL
  async update(ctx) {
    if (!checkAuth(ctx)) return;

    const { fileId, newUrl, newPublicId, oldPublicId } = ctx.request.body;

    if (!fileId || !newUrl || !newPublicId) {
      ctx.status = 400;
      ctx.body = { error: 'Missing fileId, newUrl, or newPublicId' };
      return;
    }

    // Update the database record
    await strapi.db.query('plugin::upload.file').update({
      where: { id: fileId },
      data: {
        url: newUrl,
        provider_metadata: {
          public_id: newPublicId,
          resource_type: 'raw',
        },
      },
    });

    // Delete old image-type resource from Cloudinary if credentials available
    if (oldPublicId && process.env.CLOUDINARY_NAME) {
      try {
        cloudinary.v2.config({
          cloud_name: process.env.CLOUDINARY_NAME,
          api_key: process.env.CLOUDINARY_KEY,
          api_secret: process.env.CLOUDINARY_SECRET,
        });
        await cloudinary.v2.uploader.destroy(oldPublicId, { resource_type: 'image' });
      } catch (e) {
        // Non-critical
      }
    }

    ctx.body = { success: true, fileId, newUrl };
  },
};
