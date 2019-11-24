// board/js/models.js

(function ($, Backbone, _, app) {
  let Session = Backbone.Model.extend({
    defaults: {
      token: null
    },
    initialize: function (options) {
      this.options = options;
      this.load();
    },
    load: function () {
      let token = localStorage.apiToken;
      if (token) {
        this.set('token', token);
      }
    },
    save: function (token) {
      this.set('token', token);
      if (token === null) {
        localStorage.removeItem('apiToken');
      } else {
        localStorage.apiToken = token;
      }
    },
    delete: function () {
      this.save(null);
    },
    authenticated: function () {
      return this.get('token') !== null;
    }
  });

  app.session = new Session();

})(jQuery, Backbone, _, app);
