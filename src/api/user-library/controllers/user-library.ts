import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::user-library.user-library', ({ strapi }) => ({
  async myLibrary(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Musíte být přihlášeni');

    const items = await strapi.documents('api::user-library.user-library').findMany({
      filters: { user: { id: { $eq: user.id } } } as any,
      populate: {
        book: {
          populate: ['cover', 'author', 'category'],
        },
      },
      sort: { downloadedAt: 'desc' },
    });

    return { data: items };
  },

  async addToLibrary(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Musíte být přihlášeni');

    const { bookDocumentId } = ctx.request.body as { bookDocumentId: string };
    if (!bookDocumentId) return ctx.badRequest('bookDocumentId je povinné');

    // Najít knihu
    const book = await strapi.documents('api::book.book').findOne({
      documentId: bookDocumentId,
    });
    if (!book) return ctx.notFound('Kniha nenalezena');

    // Zkontrolovat, zda záznam již existuje
    const existing = await strapi.documents('api::user-library.user-library').findMany({
      filters: {
        user: { id: { $eq: user.id } },
        book: { documentId: { $eq: bookDocumentId } },
      } as any,
    });

    if (existing.length > 0) {
      return { data: existing[0], alreadyExists: true };
    }

    const entry = await strapi.documents('api::user-library.user-library').create({
      data: {
        user: user.id,
        book: book.documentId,
        downloadedAt: new Date().toISOString(),
      } as any,
    });

    return { data: entry };
  },
}));
