export default {
  routes: [
    {
      method: 'POST',
      path: '/books/:id/download',
      handler: 'book.incrementDownload',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
