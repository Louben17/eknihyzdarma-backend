import { factories } from '@strapi/strapi';

const defaultRouter = factories.createCoreRouter('api::gutenberg-book.gutenberg-book');

export default {
  routes: [
    ...defaultRouter.routes,
    {
      method: 'POST',
      path: '/gutenberg-books/:id/download',
      handler: 'gutenberg-book.incrementDownload',
      config: { auth: false },
    },
  ],
};
