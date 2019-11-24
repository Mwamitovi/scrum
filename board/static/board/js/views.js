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
    templateName: '#login-template',
    errorTemplate: _.template('<span class="error"><%- msg %></span>'),
    events: {
      'submit form': 'submit'
    },
    submit: function (e) {
      let data = {};
      e.preventDefault();
      this.form = $(e.currentTarget);
      this.clearErrors();
      data = {
        username: $(':input[name="username"]', this.form).val(),
        password: $(':input[name="password"]', this.form).val()
      };
      $.post(app.apiLogin, data)
        .success($.proxy(this.loginSuccess, this))
        .fail($.proxy(this.loginFailure, this));
    },
    loginSuccess: function (data) {
      app.session.save(data.token);
      this.trigger('login', data.token);
    },
    loginFailure: function (xhr, status, error) {
      let errors = xhr.responseJSON;
      this.showErrors(errors);
    },
    showErrors: function (errors) {
      _.map(errors, function (fieldErrors, name) {
        let field = $(':input[name=' + name + ']', this.form),
            label = $('label[for=' + field.attr('id') + ']', this.form);
        
        if (label.length === 0) {
          label = $('label', this.form).first();
        }

        function appendError(msg) {
          label.before(this.errorTemplate({ msg: msg }));
        }

        _.map(fieldErrors, appendError, this);
      }, this);
    },
    clearErrors: function () {
      $('.error', this.form).remove();
    }
  });

  app.views.HomepageView = HomepageView;
  app.views.LoginView = LoginView;

})(jQuery, Backbone, _, app);
