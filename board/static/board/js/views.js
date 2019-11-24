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

  let FormView = TemplateView.extend({
    events: {
      'submit form': 'submit'
    },
    errorTemplate: _.template('<span class="error"><%- msg %></span>'),
    clearErrors: function () {
      $('.error', this.form).remove();
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
    serializeForm: function (form) {
      return _.object(_.map(form.serializeArray(), function (item) {
        // convert object to tuple of (name, value)
        return [item.name, item.value]
      }));
    },
    submit: function (e) {
      e.preventDefault();
      this.form = $(e.currentTarget);
      this.clearErrors();
    },
    failure: function (xhr, status, error) {
      let errors = xhr.responseJSON;
      this.showErrors(errors);
    },
    done: function (e) {
      if (e) {
        e.preventDefault();
      }
      this.trigger('done');
      this.remove();
    }
  });

  let HomepageView = TemplateView.extend({
    templateName: '#home-template'
  });
  
  let LoginView = FormView.extend({
    id: 'login',
    templateName: '#login-template',
    submit: function (e) {
      let data = {};
      FormView.prototype.submit.apply(this, arguments);
      data = this.serializeForm(this.form);
      $.post(app.apiLogin, data)
        .success($.proxy(this.loginSuccess, this))
        .fail($.proxy(this.failure, this));
    },
    loginSuccess: function (data) {
      app.session.save(data.token);
      this.done();
    }
  });

  app.views.HomepageView = HomepageView;
  app.views.LoginView = LoginView;

})(jQuery, Backbone, _, app);
