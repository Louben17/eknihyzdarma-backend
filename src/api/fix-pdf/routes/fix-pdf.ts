export default {
  routes: [
    {
      method: 'POST',
      path: '/fix-pdf/run',
      handler: 'fix-pdf.run',
      config: {
        auth: false,
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/fix-pdf/update',
      handler: 'fix-pdf.update',
      config: {
        auth: false,
        middlewares: [],
      },
    },
  ],
};
