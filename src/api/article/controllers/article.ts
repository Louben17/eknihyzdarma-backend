import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  async incrementView(ctx) {
    const { id } = ctx.params;

    const article = await strapi.documents('api::article.article').findOne({
      documentId: id,
    });

    if (!article) {
      return ctx.notFound('Článek nenalezen');
    }

    await strapi.documents('api::article.article').update({
      documentId: id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { views: (article.views || 0) + 1 } as any,
    });

    ctx.body = { success: true };
  },
}));
