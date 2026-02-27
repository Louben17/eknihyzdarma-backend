import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::gutenberg-book.gutenberg-book', ({ strapi }) => ({
  async incrementDownload(ctx) {
    const { id } = ctx.params;

    const book = await strapi.documents('api::gutenberg-book.gutenberg-book').findOne({
      documentId: id,
    });

    if (!book) {
      return ctx.notFound('Kniha nenalezena');
    }

    await strapi.documents('api::gutenberg-book.gutenberg-book').update({
      documentId: id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { downloads: (book.downloads || 0) + 1 } as any,
    });

    ctx.body = { success: true };
  },
}));
