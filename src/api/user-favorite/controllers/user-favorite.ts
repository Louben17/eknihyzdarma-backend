import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::user-favorite.user-favorite', ({ strapi }) => ({
  async myFavorites(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Musíte být přihlášeni');

    const items = await strapi.documents('api::user-favorite.user-favorite').findMany({
      filters: { user: { id: { $eq: user.id } } } as any,
      populate: {
        book: {
          populate: ['cover', 'author', 'category'],
        },
      },
    });

    return { data: items };
  },

  async toggleFavorite(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Musíte být přihlášeni');

    const { bookDocumentId } = ctx.request.body as { bookDocumentId: string };
    if (!bookDocumentId) return ctx.badRequest('bookDocumentId je povinné');

    // Zkontrolovat, zda již existuje
    const existing = await strapi.documents('api::user-favorite.user-favorite').findMany({
      filters: {
        user: { id: { $eq: user.id } },
        book: { documentId: { $eq: bookDocumentId } },
      } as any,
    });

    if (existing.length > 0) {
      // Odebrat z oblíbených
      await strapi.documents('api::user-favorite.user-favorite').delete({
        documentId: existing[0].documentId,
      });
      return { data: null, favorited: false };
    }

    // Najít knihu
    const book = await strapi.documents('api::book.book').findOne({
      documentId: bookDocumentId,
    });
    if (!book) return ctx.notFound('Kniha nenalezena');

    // Přidat do oblíbených
    const entry = await strapi.documents('api::user-favorite.user-favorite').create({
      data: {
        user: user.id,
        book: book.documentId,
      } as any,
    });

    return { data: entry, favorited: true };
  },

  async checkFavorite(ctx) {
    const user = ctx.state.user;
    if (!user) return { favorited: false };

    const { bookDocumentId } = ctx.params;
    const existing = await strapi.documents('api::user-favorite.user-favorite').findMany({
      filters: {
        user: { id: { $eq: user.id } },
        book: { documentId: { $eq: bookDocumentId } },
      } as any,
    });

    return { favorited: existing.length > 0 };
  },
}));
