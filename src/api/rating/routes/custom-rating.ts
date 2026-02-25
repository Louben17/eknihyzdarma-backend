export default {
  routes: [
    {
      method: 'POST',
      path: '/ratings/upsert',
      handler: 'rating.upsert',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/ratings/stats/:documentId',
      handler: 'rating.stats',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
