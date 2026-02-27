import { factories } from '@strapi/strapi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UID = 'api::gutenberg-book.gutenberg-book' as any;

export default factories.createCoreController(UID, ({ strapi }) => ({
  async incrementDownload(ctx) {
    const { id } = ctx.params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const book = await (strapi.documents(UID) as any).findOne({ documentId: id });

    if (!book) {
      return ctx.notFound('Kniha nenalezena');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (strapi.documents(UID) as any).update({
      documentId: id,
      data: { downloads: (book.downloads || 0) + 1 },
    });

    ctx.body = { success: true };
  },
}));
