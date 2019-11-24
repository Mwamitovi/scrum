// board/js/router.js

(function ($, Backbone, _, app) {
  let AppRouter = Backbone.Router.extend({
    routes: {
      '': 'home'
    },
    initialize: function (options) {
      this.contentElement = '#content';
      this.current = null;
      Backbone.history.start();
    },
    home: function () {
      let view = new app.views.HomepageView({ el: this.contentElement });
      this.render(view);
    },
    route: function (route, name, callback) {
      // we override default route to enforce login on every page
      let login;
      callback = callback || this[name];
      callback = _.wrap(callback, function (original) {
        let args = _.without(arguments, original);
        
        if (app.session.authenticate()) {
          original.apply(this, args);
        } else {
          // show the login screen before calling the view
          $(this.contentElement).hide();
          // bind original callback once the login is successful
          login = new app.views.LoginView();
          $(this.contentElement).after(login.el);
          login.on('done', function () {
            $(this.contentElement).show();
            original.apply(this, args);
          }, this);
          // render the login form
          login.render();
        }
      });
      return Backbone.Router.prototype.route.apply(
        this, [route, name, callback]
      );
    },
    render: function (view) {
      if (this.current) {
        this.current.undelegateEvents();
        this.current.$el = $();
        this.current.remove();
      }
      this.current = view;
      this.current.render();
    }
  });

  app.router = AppRouter;

})(jQuery, Backbone, _, app);
