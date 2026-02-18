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
  ],
};
