// board/js/views.js

(function ($, Backbone, _, app) {
  let TemplateView = Backbone.View.extend({
    templateName: '',
    initialize: function () {
      this.template = _.template($(this.templateName).html());
    },
    render: function () {
      let context = this.getContext(),
          html = this.template(context);
      
      this.$el.html(html);
    },
    getContext: function () {
      return {};
    }
  });

  let HomepageView = TemplateView.extend({
    templateName: '#home-template'
  });
  
  let LoginView = TemplateView.extend({
    id: 'login',
    templateName: '#login-template'
  });

  app.views.HomepageView = HomepageView;
  app.views.LoginView = LoginView;

})(jQuery, Backbone, _, app);
