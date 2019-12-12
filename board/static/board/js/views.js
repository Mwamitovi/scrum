// board/js/views.js

(function ($, Backbone, _, app) {
  const TemplateView = Backbone.View.extend({
    templateName: '',
    initialize: function () {
      this.template = _.template($(this.templateName).html())
    },
    render: function () {
      const context = this.getContext()
      const html = this.template(context)

      this.$el.html(html)
    },
    getContext: function () {
      return {}
    }
  })

  const FormView = TemplateView.extend({
    events: {
      'submit form': 'submit'
    },
    errorTemplate: _.template('<span class="error"><%- msg %></span>'),
    clearErrors: function () {
      $('.error', this.form).remove()
    },
    showErrors: function (errors) {
      _.map(errors, function (fieldErrors, name) {
        const field = $(':input[name=' + name + ']', this.form)
        let label = $('label[for=' + field.attr('id') + ']', this.form)

        if (label.length === 0) {
          label = $('label', this.form).first()
        }

        function appendError (msg) {
          label.before(this.errorTemplate({ msg: msg }))
        }

        _.map(fieldErrors, appendError, this)
      }, this)
    },
    serializeForm: function (form) {
      return _.object(_.map(form.serializeArray(), function (item) {
        // convert object to tuple of (name, value)
        return [item.name, item.value]
      }))
    },
    submit: function (e) {
      e.preventDefault()
      this.form = $(e.currentTarget)
      this.clearErrors()
    },
    failure: function (xhr, status, error) {
      const errors = xhr.responseJSON
      this.showErrors(errors)
    },
    done: function (e) {
      if (e) {
        e.preventDefault()
      }
      this.trigger('done')
      this.remove()
    }
  })

  const HeaderView = TemplateView.extend({
    tagName: 'header',
    templateName: '#header-template',
    events: {
      'click a.logout': 'logout'
    },
    getContext: function () {
      return { authenticated: app.session.authenticated() }
    },
    logout: function (e) {
      e.preventDefault()
      app.session.delete()
      window.location = '/'
    }
  })

  const HomepageView = TemplateView.extend({
    templateName: '#home-template',
    initialize: function (options) {
      // Once view is created,
      // sprints with end-dates greater than seven days ago are fetched
      // and the view is re-rendered to display once available
      const self = this
      TemplateView.prototype.initialize.apply(this, arguments)
      app.collections.ready.done(function () {
        let end = new Date()
        end.setDate(end.getDate() - 7)
        end = end.toISOString().replace(/T.*/g, '')
        app.sprints.fetch({
          data: { end_min: end },
          success: $.proxy(self.render, self)
        })
      })
    },
    getContext: function () {
      // template context now contains the current sprints from app.sprints
      // if app.collections isn't ready, this is a "null" value
      return { sprints: app.sprints || null }
    }
  })

  const LoginView = FormView.extend({
    id: 'login',
    templateName: '#login-template',
    submit: function (e) {
      let data = {}
      FormView.prototype.submit.apply(this, arguments)
      data = this.serializeForm(this.form)
      $.post(app.apiLogin, data)
        .done($.proxy(this.loginSuccess, this))
        .fail($.proxy(this.failure, this))
    },
    loginSuccess: function (data) {
      app.session.save(data.token)
      this.done()
    }
  })

  app.views.HeaderView = HeaderView
  app.views.HomepageView = HomepageView
  app.views.LoginView = LoginView
// eslint-disable-next-line
})(jQuery, Backbone, _, app)
