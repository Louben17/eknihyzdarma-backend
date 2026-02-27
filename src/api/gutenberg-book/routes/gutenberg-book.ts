export default {
  routes: [
    { method: 'GET',    path: '/gutenberg-books',     handler: 'gutenberg-book.find',     config: { auth: false } },
    { method: 'GET',    path: '/gutenberg-books/:id', handler: 'gutenberg-book.findOne',  config: { auth: false } },
    { method: 'POST',   path: '/gutenberg-books',     handler: 'gutenberg-book.create' },
    { method: 'PUT',    path: '/gutenberg-books/:id', handler: 'gutenberg-book.update' },
    { method: 'DELETE', path: '/gutenberg-books/:id', handler: 'gutenberg-book.delete' },
    { method: 'POST',   path: '/gutenberg-books/:id/download', handler: 'gutenberg-book.incrementDownload', config: { auth: false } },
  ],
};
