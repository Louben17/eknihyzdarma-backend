import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::rating.rating', ({ strapi }) => ({

  // POST /api/ratings/upsert
  // Body: { bookDocumentId, score, ipAddress }
  async upsert(ctx) {
    const { bookDocumentId, score, ipAddress } = ctx.request.body as {
      bookDocumentId: string;
      score: number;
      ipAddress: string;
    };

    if (!bookDocumentId || !score || !ipAddress) {
      return ctx.badRequest('Chybí povinné parametry');
    }
    if (score < 1 || score > 5 || !Number.isInteger(score)) {
      return ctx.badRequest('Hodnocení musí být celé číslo 1–5');
    }

    // Ověřit, že kniha existuje
    const book = await strapi.documents('api::book.book').findOne({
      documentId: bookDocumentId,
    });
    if (!book) return ctx.notFound('Kniha nenalezena');

    // Najít existující hodnocení od této IP pro tuto knihu
    const existing = await strapi.documents('api::rating.rating').findMany({
      filters: {
        book: { documentId: { $eq: bookDocumentId } },
        ipAddress: { $eq: ipAddress },
      } as any,
    });

    if (existing.length > 0) {
      // Aktualizovat existující hodnocení
      await strapi.documents('api::rating.rating').update({
        documentId: existing[0].documentId,
        data: { score } as any,
      });
    } else {
      // Vytvořit nové hodnocení
      await strapi.documents('api::rating.rating').create({
        data: {
          score,
          ipAddress,
          book: bookDocumentId,
        } as any,
      });
    }

    // Spočítat průměr pro tuto knihu
    const allRatings = await strapi.documents('api::rating.rating').findMany({
      filters: {
        book: { documentId: { $eq: bookDocumentId } },
      } as any,
    });

    const count = allRatings.length;
    const sum = allRatings.reduce((acc: number, r: any) => acc + r.score, 0);
    const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

    return { average, count, userScore: score };
  },

  // GET /api/ratings/stats/:documentId?ip=xxx
  async stats(ctx) {
    const { documentId } = ctx.params as { documentId: string };
    const ip = ctx.query.ip as string | undefined;

    const allRatings = await strapi.documents('api::rating.rating').findMany({
      filters: {
        book: { documentId: { $eq: documentId } },
      } as any,
    });

    const count = allRatings.length;
    const sum = allRatings.reduce((acc: number, r: any) => acc + r.score, 0);
    const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

    let userScore: number | null = null;
    if (ip) {
      const userRating = allRatings.find((r: any) => r.ipAddress === ip);
      userScore = userRating?.score ?? null;
    }

    return { average, count, userScore };
  },
}));
