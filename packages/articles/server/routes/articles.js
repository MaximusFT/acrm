'use strict';

var articles = require('../controllers/articles');

module.exports = function(Articles, app, auth) {

  app.route('/articles')
    .get(auth.requiresLogin, articles.all)
    .post(auth.requiresAdmin, articles.create, auth.eventHandler);
  app.route('/articles/:articleId')
    .get(auth.requiresLogin, articles.show)
    .put(auth.requiresAdmin, articles.update)
    .delete(auth.requiresAdmin, articles.destroy);

  // Finish with setting up the articleId param
  app.param('articleId', articles.article);
};
