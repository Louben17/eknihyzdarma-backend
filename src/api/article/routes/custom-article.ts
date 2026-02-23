export default {
  routes: [
    {
      method: 'POST',
      path: '/articles/:id/view',
      handler: 'article.incrementView',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
