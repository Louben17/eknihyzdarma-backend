export default {
  routes: [
    {
      method: 'GET',
      path: '/user-favorites/my',
      handler: 'user-favorite.myFavorites',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/user-favorites/toggle',
      handler: 'user-favorite.toggleFavorite',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/user-favorites/check/:bookDocumentId',
      handler: 'user-favorite.checkFavorite',
      config: {
        policies: [],
      },
    },
  ],
};
