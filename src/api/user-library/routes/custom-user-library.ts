export default {
  routes: [
    {
      method: 'GET',
      path: '/user-library/my',
      handler: 'user-library.myLibrary',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/user-library/add',
      handler: 'user-library.addToLibrary',
      config: {
        policies: [],
      },
    },
  ],
};
